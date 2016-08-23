import request     from 'request-promise';
import config      from '../../config/';
import sendRequest from './sendRequest';

export default (senderId, event, substring, isLastMessage, textToSend, i) => {
  console.log('send to ' + senderId + ' message->' + substring);
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
            let lengthLatest = textToSend.length - i;
            substring = textToSend.substring(i, i + lengthLatest);
            isLastMessage = true;
          } else {
            i+= 300;
            substring = textToSend.substring(i,i+300);
          }
          sendRequest(senderId, event, substring, isLastMessage, textToSend, i);
        }
      }
    }
  });
}
