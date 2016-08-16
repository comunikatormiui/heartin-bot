import request  from 'request-promise';
import cheerio  from 'cheerio';
import os       from 'os';
import restify  from 'restify';
import builder  from 'botbuilder';
import assert   from 'assert';
import mongoose from 'mongoose';
import fs       from 'fs';
import Canvas   from 'canvas';
import config   from '../../config/';

let chilkat;
let dbMain;

const modelsPath = `${__dirname}/../models`;
console.log(modelsPath);
fs.readdirSync(modelsPath).forEach(file => {
  if (~file.indexOf('js')) {
    require(`${modelsPath}/${file}`);
  }
});

const Docs = mongoose.model('Docs');

switch (os.platform()) {
  case 'win32':
    chilkat = require('chilkat_win32');
    break;
  case 'linux':
    if (os.arch() == 'x86') {
      chilkat = require('chilkat_linux32');
    } else {
      chilkat = require('chilkat_linux64');
    }
    break;
  case 'darwin':
    chilkat = require('chilkat_macosx');
    break;
  default:
    chilkat = require('chilkat_macosx');
}

const h2t = new chilkat.HtmlToText();
const success = h2t.UnlockComponent('30-day trial');
if (success !== true) {
  console.error(h2t.LastErrorText);
}

function startBot() {
  // Create bot and add dialogs
  const bot = new builder.BotConnectorBot({
    appId: config.appId,
    appSecret: config.appSecret
  });

  bot.add('/', new builder.CommandDialog().matches('^search', session => {
    let text = session.message.text;
    text = text.replace('search','');
    let textWithoutSpaces = text.replace(' ','');
    if (textWithoutSpaces.length === 0) {
      session.send("nothing to search please write words");

    } else {
      text = text.slice(1);
      session.send("I start searching for->" + text);

      dbMain.collection('guides').find({
        "title": new RegExp(text, 'i')
      }).toArray((err, items) => {
        if (err) {
          console.error(err);
        }
        if (items.length == 0) {
          session.send("finded zero items");
        } else {
          items.forEach(guide => {
            session.send(`From: ${guide.mainTitle}`);
            session.send(`Title: ${guide.title}`);
            session.send(guide.text);
          });
        }
      });
    }
    console.log(session.message);
  }).onDefault(session => {
    session.send('I didn\'t understand. Say search <what you like to search> to me!');
  }));


  // Setup Restify Server
  let server = restify.createServer();
  server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
  server.use(restify.queryParser());
  server.use(restify.acceptParser(server.acceptable));
  // server.use(restify.queryParser());
  // server.use(restify.urlEncodedBodyParser());
  // server.use(restify.jsonp());
  server.use(restify.bodyParser({ mapParams: false }));
  function sendGenericMessage(sender,guides) {
    let timestamp = Math.round(new Date().getTime());
    let elementsToSend = [];
    guides.forEach(guide => {
      let element = {};
      element["title"] = guide.title;
      let text = guide.text;
      if (text !== undefined && text.length > 0) {
        element["subtitle"] = text.substring(0, 100) + '...';
      } else {
        element["subtitle"] = '...';
      }
      element["image_url"] = "https://mac5.ixcglobal.com/images?name=" + guide.mainTitle + "&timestamp=" + timestamp;
      element["buttons"] = [{"type": "postback", "title": "Read more","payload":guide._id}];
      elementsToSend.push(element);
    });


    let messageData = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: elementsToSend
        }
      }
    }
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
        access_token: config.token
      },
      method: 'POST',
      json: {
        recipient: {
          id: sender
        },
        message: messageData,
      }
    }, (error, response, body) => {
      if (error) {
        console.error(`Error sending messages: ${error}`)
      } else if (response.body.error) {
        console.error(`Error: ${response.body.error}`)
      }
    })
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    let cars = text.split('\n');

    for (let i = 0; i < cars.length; i++) {

      let line = '';
      let words = cars[i].split(' ');

      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;

        if (testWidth > maxWidth) {
          context.fillText(line, x, y);
          line = words[n] + " ";
          y += lineHeight;
        } else {
          line = testLine;
        }
      }

      context.fillText(line, x, y);
      y += lineHeight;
    }
  }

  function respondImage(req, res, next) {
    console.log(`Received ${req}`);
    console.log(`Received ${req.query.name}`);
    let Image = Canvas.Image;
    let canvas = new Canvas(400, 100);
    let ctx = canvas.getContext('2d');

    ctx.font = '14px Helvetica Neue';
    // ctx.rotate(.1);
    let maxWidth = 200;
    let lineHeight = 19;
    let x = 110; // (canvas.width - maxWidth) / 2;
    let y = 20;
    // ctx.beginPath();
    // ctx.rect(20, 20, 300, 100);
    // ctx.fillStyle = "red";
    // ctx.fill();

    wrapText(ctx, req.query.name, x, y, maxWidth, lineHeight);

    // ctx.fillText(req.query.name, 20, 20);

    // let te = ctx.measureText(req.query.name);
    // ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    // ctx.beginPath();
    // ctx.lineTo(50, 102);
    // ctx.lineTo(50 + te.width, 102);
    // ctx.stroke();

    // console.log('<img src="' + canvas.toDataURL() + '" />');
    res.contentType = 'image/png';

    res.send(canvas.toBuffer());

    // if (req.query.hub.verify_token === 'heartin-bot-verify-token1')
    //     res.send(req.query.hub.challenge);
    // else
    //     res.send('Not verified');
    next();
  }
  server.get('/images', respondImage);

  function respond(req, res, next) {
    console.log(`Received ${req}`);
    console.log(`Received ${req.query.hub.challenge}`);
    res.contentType = 'text/plain';

    if (req.query.hub.verify_token === 'heartin-bot-verify-token1') {
      res.send(req.query.hub.challenge);
    } else {
      res.send('Not verified');
    }
    next();
  }
  server.get('/webhook', respond);
  // server.use(restify.queryParser());
  function sendMessage(recipientId, message) {
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
        access_token: config.token
      },
      method: 'POST',
      json: {
        recipient: {
          id: recipientId
        },
        message: message,
      }
    }, (error, response, body) => {
      if (error) {
        console.error(`Error sending message: ${error}`);
      } else if (response.body.error) {
        console.error(`Error: ${response.body.error}`);
      }
    });
  };

  server.post('/webhook', (req, res) => {
    console.log(`Received: ${req.body}`);

    let events = req.body.entry[0].messaging;

    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      if (event.message && event.message.text) {
        let isSandbox = false;
        if (event.sender.id === '1254765807882082') {
          console.log('its sandbox from Alex');
          isSandbox = true;
          // sendGenericMessage(event.sender.id);
          // continue;
        } else {
          console.log('its productions')
        }
        let text = event.message.text.toLowerCase();

        if (text.indexOf('search') > -1) {
          text = text.replace('search','');
          let textWithoutSpaces = text.replace(' ','');
          if (textWithoutSpaces.length == 0) {
            sendMessage(event.sender.id, {text: "nothing to search please write words"});
          } else {
            text = text.slice(1);
            sendMessage(event.sender.id, {
              text: `I start searching for-> ${text}`
            });

            dbMain.collection('guides').find({
              "title": new RegExp(text, 'i')
            }).toArray((err, items) => {
              if (err) {
                console.error(err);
              }
              if (items.length == 0) {
                sendMessage(event.sender.id, {
                  text: "finded zero items"
                });
              } else {
                // if (isSandbox) {
                sendGenericMessage(event.sender.id,items);
                // } else {
                //     items.forEach(function(guide) {
                //         sendMessage(event.sender.id, {text: "From: " + guide.mainTitle});
                //         sendMessage(event.sender.id, {text: "Title: " + guide.title});
                //         let setOfText = guide.text.match(/.{1,310}/g);
                //         setOfText.forEach(function(textToSend) {
                //             sendMessage(event.sender.id, {text: textToSend});
                //         });
                //     });
                // }
              }


            });

          }
        } else {
          sendMessage(event.sender.id, {
            text: "I didn't understand. Service provide access to guidelines for cardiologists. Say search <what you like to search> to me!"
          });
        }
      }
      if (event.postback) {
        let text = JSON.stringify(event.postback)
        console.log(`postback: ${text}`);
        let ObjectID = require('mongodb').ObjectID;
        let obj = new ObjectID(event.postback.payload);

        dbMain.collection('guides').find({
          _id: obj
        }).toArray((err, items) => {
          if (err) {
            console.error(err);
          }
          if (items.length == 0) {
            sendMessage(event.sender.id, {
              text: "finded zero items"
            });
          }

          let guide = items[0];
          let textToSend = guide.text;
          let i = 0;
          let substring = textToSend.substring(i,i+300);
          let isLastMessage = false;

          function sendRequest(senderId) {
            //     console.log('send to ' + senderId + ' message->' + substring);
            request({
              url: 'https://graph.facebook.com/v2.6/me/messages',
              qs: {
                access_token: config.token
              },
              method: 'POST',
              json: {
                recipient: {
                  id: event.sender.id
                },
                message: {
                  text: substring
                }
              }
            }, (error, response, body) => {
              if (error) {
                console.error(`Error sending message: ${error}`);
              } else if (response.body.error) {
                console.error(`Error: ${response.body.error}`);
              } else {
                if (!isLastMessage) {
                  if (i < textToSend.length) {
                    if (i + 300 > textToSend.length) {
                      let lengthLatest = textToSend.length-i;
                      substring = textToSend.substring(i,i + lengthLatest);
                      isLastMessage = true;
                    } else {
                      i+= 300;
                      substring = textToSend.substring(i,i+300);
                    }
                    sendRequest(senderId);
                  }
                }
              }
            });
          }

          sendRequest(event.sender.id);

          // for (i = 0; i < textToSend.length; i+= 300) {
          //     let substring = textToSend.substring(i,i+300);
          //     // sendMessage(event.sender.id, {text: substring});
          //     request({
          //         url: 'https://graph.facebook.com/v2.6/me/messages',
          //         qs: {access_token: 'EAANoqHvZBBckBAPS5td0KpIatcKLEL2jnflMXQTdm3XbXiP73eAnFVbBIBZAADQH8RSNwK3IoEELa4q1wkq2ZBXA7eVBHRmX25huGRRJr0NLF99NdhVAg2MKXtSTRJWs3vSmCiTZBl8qgV6RzaC4Dt7L98jy2ujZCZCOamaw1rtAZDZD'},
          //         method: 'POST',
          //         json: {
          //             recipient: {id: event.sender.id},
          //             message: substring,
          //         }
          //     }, function(error, response, body) {
          //         if (error) {
          //             console.log('Error sending message: ', error);
          //         } else if (response.body.error) {
          //             console.log('Error: ', response.body.error);
          //         }
          //     });
          //
          // }
          // let setOfText = guide.text.match(/.{1,310}/g);
          // setOfText.forEach(function(textToSend) {
          //     sendMessage(event.sender.id, {text: textToSend});
          // });
        });
      }
    }
    res.send('');
  });

  server.listen(config.port, () => {
    console.log(`${server.name} listening to ${server.url}`);
  });
}

mongoose.connect(config.mongoURL);
startBot();
