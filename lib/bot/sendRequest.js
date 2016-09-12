import fs          from 'fs';
import request     from 'request-promise';
import mongoose    from 'mongoose';
import eachSeries  from 'async/eachSeries';
import config      from '../../config/';
import sendRequest from './sendRequest';

const modelsPath = `${__dirname}/../models`;
fs.readdirSync(modelsPath).forEach(file => {
  if (~file.indexOf('js')) {
    require(`${modelsPath}/${file}`);
  }
});

const Docs = mongoose.model('Docs');

export default (senderId, event, substring, isLastMessage, textToSend, i, id) => {
  if (!isLastMessage) {
    console.log(`send to ${senderId} message-> ${substring}`);
    const arr = substring.split(/\[{2}page\:([0-9]{1,2}|[a-z][0-9]|[0-9][a-z])\]{2}/);
    eachSeries(arr, (item, callback) => {
      if (item !== '') {
        if (item.length < 3) {
          Docs.find({
            docid: id,
            type: 2,
            page: item
          }, '_id').then(image => {
            eachSeries(image, (im, cb) => {
              console.log(`https://mac5.ixcglobal.com/image?id=${im._id}`);
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
                    attachment: {
                      type: 'image',
                      payload: {
                        url: `https://mac5.ixcglobal.com/image?id=${im._id}`
                      }
                    }
                  }
                }
              }, (error, response, body) => {
                if (error) {
                  console.error(`Error sending message: ${error}`);
                  cb(error);
                } else if (response.body.error) {
                  console.error(`Error: ${response.body.error}`);
                  cb(response.body.error);
                } else {
                  cb();
                }
              });
            }, err => {
              if (err) {
                console.error(err);
                callback(err);
              } else {
                callback();
              }
            });
          }).catch(err => {
            callback(err);
            console.error(err);
            console.error('Images not found');
          });;
        } else {
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
                text: item
              }
            }
          }, (error, response, body) => {
            if (error) {
              console.error(`Error sending message: ${error}`);
              callback(error);
            } else if (response.body.error) {
              console.error(`Error: ${response.body.error}`);
              callback(response.body.error);
            } else {
              callback();
            }
          });
        }
      } else {
        callback();
      }
    }, err => {
      if (err) {
        console.error(err);
      } else {
        if (i < textToSend.length) {
          if (i + 300 > textToSend.length) {
            let lengthLatest = textToSend.length - i;
            substring = textToSend.substring(i, i + lengthLatest);
            isLastMessage = true;
          } else {
            i += 300;
            substring = textToSend.substring(i, i + 300);
          }
          sendRequest(senderId, event, substring, isLastMessage, textToSend, i, id);
        }
      }
    });
  }
}
