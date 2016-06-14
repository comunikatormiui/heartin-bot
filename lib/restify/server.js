import restify from 'restify';
import request from 'request';

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.use(restify.queryParser());
server.use(restify.acceptParser(server.acceptable));
// server.use(restify.queryParser());
// server.use(restify.urlEncodedBodyParser());
// server.use(restify.jsonp());
server.use(restify.bodyParser({
  mapParams: false
}));
function sendGenericMessage(sender, guides) {

  function sendMessageForItems(items) {
    const elementsToSend = [];

    items.forEach((guide) => {
      const element = {};
      const timestamp = Math.round(new Date().getTime());

      element.title = guide.title;
      const text = guide.text;
      if (text !== undefined && text.length > 0) {
        element.subtitle = `${text.substring(0, 100)}...`;
      } else {
        element.subtitle = '...';
      }
      element.image_url = `https://mac5.ixcglobal.com/images?name=${guide.mainTitle}&timestamp=${timestamp}`;
      element.buttons = [{
        type: "postback",
        title: "Read more",
        payload: guide._id
      }];
      elementsToSend.push(element);
    });


    const messageData = {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elementsToSend
        }
      }
    };
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
        access_token: 'EAANoqHvZBBckBAPS5td0KpIatcKLEL2jnflMXQTdm3XbXiP73eAnFVbBIBZAADQH8RSNwK3IoEELa4q1wkq2ZBXA7eVBHRmX25huGRRJr0NLF99NdhVAg2MKXtSTRJWs3vSmCiTZBl8qgV6RzaC4Dt7L98jy2ujZCZCOamaw1rtAZDZD'
      },
      method: 'POST',
      json: {
        recipient: {
          id: sender
        },
        message: messageData
      }
    }, (error, response, body) => {
      if (error) {
        console.log('Error sending messages: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    });
  }
  if (guides.length < 9)
    sendMessageForItems(guides);
  else {
    for (let i = 0; i < guides.length; i += 9) {
      let nextStep = 0;
      if (i + 9 > guides.length) {
        nextStep = guides.length - i;
      } else {
        nextStep = i + 9;
      }
      const arrayToSend = guides.slice(i, nextStep + i);
      sendMessageForItems(arrayToSend);
    }
  }
}

function sendButtonMessage(sender, titleText, searchString) {
  const messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": titleText,
        "buttons" : [{
          "type": "postback",
          "title": "Yes",
          "payload": "yes/" + searchString
        }, {
          "type": "postback",
          "title": "No",
          "payload":"no"
        }]
      }
    }
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: 'EAANoqHvZBBckBAPS5td0KpIatcKLEL2jnflMXQTdm3XbXiP73eAnFVbBIBZAADQH8RSNwK3IoEELa4q1wkq2ZBXA7eVBHRmX25huGRRJr0NLF99NdhVAg2MKXtSTRJWs3vSmCiTZBl8qgV6RzaC4Dt7L98jy2ujZCZCOamaw1rtAZDZD'
    },
    method: 'POST',
    json: {
      recipient: {
        id: sender
      },
      message: messageData
    }
  }, (error, response, body) => {
    if (error) {
      console.log('Error sending messages: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  var cars = text.split("\n");

  for (var ii = 0; ii < cars.length; ii++) {

    var line = "";
    var words = cars[ii].split(" ");

    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + " ";
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;

      if (testWidth > maxWidth) {
        context.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }

    context.fillText(line, x, y);
    y += lineHeight;
  }
}

function respondImage(req, res, next) {
  console.log('Received ' + req);
  console.log('Received ' + req.query.name);
  var Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(400, 100)
  , ctx = canvas.getContext('2d');

  ctx.font = '14px Helvetica Neue';
  // ctx.rotate(.1);
  var maxWidth = 200;
  var lineHeight = 19;
  var x = 110; // (canvas.width - maxWidth) / 2;
  var y = 20;
  // ctx.beginPath();
  // ctx.rect(20, 20, 300, 100);
  // ctx.fillStyle = "red";
  // ctx.fill();

  wrapText(ctx, req.query.name, x, y, maxWidth, lineHeight);

  // ctx.fillText(req.query.name, 20, 20);

  // var te = ctx.measureText(req.query.name);
  // ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  // ctx.beginPath();
  // ctx.lineTo(50, 102);
  // ctx.lineTo(50 + te.width, 102);
  // ctx.stroke();

  // console.log('<img src="' + canvas.toDataURL() + '" />');
  res.contentType = "image/png";

  res.send(canvas.toBuffer());

  // if (req.query.hub.verify_token === 'heartin-bot-verify-token1')
  //     res.send(req.query.hub.challenge);
  // else
  //     res.send('Not verified');
  next();
}
server.get('/images', respondImage);

function respond(req, res, next) {
  console.log('Received ' + req);
  console.log('Received ' + req.query.hub.challenge);
  res.contentType = "text/plain";

  if (req.query.hub.verify_token === 'heartin-bot-verify-token1')
    res.send(req.query.hub.challenge);
  else
    res.send('Not verified');
  next();
}
server.get('/webhook', respond);
// server.use(restify.queryParser());
function sendMessage(recipientId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: 'EAANoqHvZBBckBAPS5td0KpIatcKLEL2jnflMXQTdm3XbXiP73eAnFVbBIBZAADQH8RSNwK3IoEELa4q1wkq2ZBXA7eVBHRmX25huGRRJr0NLF99NdhVAg2MKXtSTRJWs3vSmCiTZBl8qgV6RzaC4Dt7L98jy2ujZCZCOamaw1rtAZDZD'},
    method: 'POST',
    json: {
      recipient: {id: recipientId},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
};

server.post('/webhook', function (req, res) {
  console.log('Received: ', req.body);

  var events = req.body.entry[0].messaging;

  for (i = 0; i < events.length; i++) {
    var event = events[i];
    if (event.message && event.message.text) {
      var isSandbox = false;
      if (event.sender.id === '1254765807882082') {
        console.log("its sandbox from Alex");
        isSandbox = true;
        // sendGenericMessage(event.sender.id);
        // continue;
      } else {
        console.log("its productions")
      }
      var text = event.message.text.toLowerCase();

      if (text.indexOf('/search') > -1) {
        text = text.replace('/search','');
        var textWithoutSpaces = text.replace(' ','');
        if (textWithoutSpaces.length == 0) {
          sendMessage(event.sender.id, {text: "nothing to search please write words"});
        } else {
          text = text.slice(1);
          sendMessage(event.sender.id, {text: "I start searching for '" + text + "'"});
          dbMain.collection('guides').find({"title": new RegExp(text, 'i')}).toArray(function(err, items) {
            if (err) {
              console.error(err);
              return;
            }
            if(items.length == 0)
              sendMessage(event.sender.id, {text: "finded zero items"});

            else {
              sendGenericMessage(event.sender.id,items);
            }
          });

        }
      } else {
        var extraction_result = keyword_extractor.extract(event.message.text,{
          language:"english",
          remove_digits: true,
          return_changed_case:true,
          remove_duplicates: false
        });
        var search = extraction_result.join(" ");

        sendButtonMessage(event.sender.id,'Do you like to search "' + search + "'? You can allways search by type '/search cardiovascular'",search);
      }

      var senderId = event.sender.id;
      request({
        url: 'https://graph.facebook.com/v2.6/' + senderId,
        qs: {
          fields: 'first_name,last_name,profile_pic,locale,timezone,gender',
          access_token: 'EAANoqHvZBBckBAPS5td0KpIatcKLEL2jnflMXQTdm3XbXiP73eAnFVbBIBZAADQH8RSNwK3IoEELa4q1wkq2ZBXA7eVBHRmX25huGRRJr0NLF99NdhVAg2MKXtSTRJWs3vSmCiTZBl8qgV6RzaC4Dt7L98jy2ujZCZCOamaw1rtAZDZD'},
        method: 'GET'
      }, function(error, response, body) {
        if (error) {
          console.log('Error sending messages: ', error)
        } else if (response.body.error) {
          console.log('Error: ', response.body.error)
        }
        var info = JSON.parse(body);
        info.id = senderId;
        console.log(info);
        dbMain.collection('fbUsers').insertOne(info, function(err, result) {
          if (err)
            console.error(err);
          else console.log("Inserted a document into the collection fbUsers.");
        });
      });
    }
    if (event.postback) {
      if (event.postback.payload === 'no')
        return;
      if (event.postback.payload.indexOf('yes')  > -1) {
        var search = event.postback.payload.slice(4);
        sendMessage(event.sender.id, {text: "I start searching for '" + search + "'"});
        dbMain.collection('guides').find({"title": new RegExp(search, 'i')}).toArray(function(err, items) {
          if (err) {
            console.error(err);
            return;
          }
          if(items.length == 0)
            sendMessage(event.sender.id, {text: "finded zero items"});
          else {
            sendGenericMessage(event.sender.id,items);
          }
        });
        return;
      }

      var text = JSON.stringify(event.postback);
      console.log('postback: ', text);
      var ObjectID = require('mongodb').ObjectID;
      var obj = new ObjectID(event.postback.payload);

      dbMain.collection('guides').find({_id: obj}).toArray(function(err, items) {
        if (err) {
          console.error(err);
          return;
        }
        if (items.length == 0)
          sendMessage(event.sender.id, {text: "finded zero items"});

        var guide = items[0];
        var textToSend = guide.text;
        var i = 0;
        var substring = textToSend.substring(i,i+300);
        var isLastMessage = false;

        function sendRequest(senderId) {
          //     console.log('send to ' + senderId + ' message->' + substring);
          request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: 'EAANoqHvZBBckBAPS5td0KpIatcKLEL2jnflMXQTdm3XbXiP73eAnFVbBIBZAADQH8RSNwK3IoEELa4q1wkq2ZBXA7eVBHRmX25huGRRJr0NLF99NdhVAg2MKXtSTRJWs3vSmCiTZBl8qgV6RzaC4Dt7L98jy2ujZCZCOamaw1rtAZDZD'},
            method: 'POST',
            json: {
              recipient: {id: event.sender.id},
              message: {text: substring}
            }
          }, function(error, response, body) {
            if (error) {
              console.log('Error sending message: ', error);
            } else if (response.body.error) {
              console.log('Error: ', response.body.error);
            } else {
              if (!isLastMessage) {
                if (i < textToSend.length) {
                  if (i + 300 > textToSend.length) {
                    var lengthLatest = textToSend.length-i;
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
        //     var substring = textToSend.substring(i,i+300);
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
        // var setOfText = guide.text.match(/.{1,310}/g);
        // setOfText.forEach(function(textToSend) {
        //     sendMessage(event.sender.id, {text: textToSend});
        // });
      });
    }
  }
  res.send("");
});

server.listen(process.env.port || 3978, () => {
  console.log('%s listening to %s', server.name, server.url);
});
