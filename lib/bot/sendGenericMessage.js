import request     from 'request-promise';
import config      from '../../config/';

export default (sender, guides) => {
  let timestamp = Math.round(new Date().getTime());
  let elementsToSend = [];
  guides.forEach(guide => {
    let element = {};
    element['title'] = guide.title;
    let text = guide.text;
    if (text !== undefined && text.length > 0) {
      element['subtitle'] = text.substring(0, 100) + '...';
    } else {
      element['subtitle'] = '...';
    }
    element['image_url'] = 'https://mac5.ixcglobal.com/images?name=' + guide.mainTitle + '&timestamp=' + timestamp;
    element['buttons'] = [{
      'type': 'postback',
      'title': 'Read more',
      'payload': guide._id
    }];
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
