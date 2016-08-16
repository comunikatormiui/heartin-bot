import request from 'request-promise';
import config  from '../../config/';

export default (recipientId, message) => {
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
