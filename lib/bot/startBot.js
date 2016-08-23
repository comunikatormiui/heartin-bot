import fs                 from 'fs';
import restify            from 'restify';
import builder            from 'botbuilder';
import mongoose           from 'mongoose';
import config             from '../../config/';
import respondImage       from './respondImage';
import respond            from './respond';
import sendMessage        from './sendMessage';
import sendGenericMessage from './sendGenericMessage';
import sendRequest        from './sendRequest';

const modelsPath = `${__dirname}/../models`;
fs.readdirSync(modelsPath).forEach(file => {
  if (~file.indexOf('js')) {
    require(`${modelsPath}/${file}`);
  }
});

const Docs = mongoose.model('Docs');
mongoose.connect(config.mongoURL);

export default () => {
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

      Docs.find({
        $text : {
          $search : text
        }
      }, (err, items) => {
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
  server.get('/images', respondImage);
  server.get('/webhook', respond);
  // server.use(restify.queryParser());

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

            Docs.find({
              $text : {
                $search : text
              }
            }, (err, items) => {
              if (err) {
                console.error(err);
              }
              if (items.length == 0) {
                sendMessage(event.sender.id, {
                  text: "finded zero items"
                });
              } else {
                // if (isSandbox) {
                sendGenericMessage(event.sender.id, items);
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

        Docs.findById(event.postback.payload, (err, items) => {
          if (err) {
            console.error(err);
          }
          if (items.length == 0) {
            sendMessage(event.sender.id, {
              text: 'finded zero items'
            });
          }

          let guide = items._doc;
          let textToSend = guide.content;
          let i = 0;
          let substring = textToSend.substring(i,i+300);
          let isLastMessage = false;

          sendRequest(event.sender.id, event, substring, isLastMessage, textToSend, i);

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
