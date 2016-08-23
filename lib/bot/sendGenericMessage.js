import request     from 'request-promise';
import config      from '../../config/';

export default (sender, guides) => {
  let timestamp = Math.round(new Date().getTime());
  let elementsToSend = [];
  guides.forEach(guide => {
    let element = {};
    element['title'] = guide._doc.title;
    let text = guide._doc.text;
    if (text !== undefined && text.length > 0) {
      element['subtitle'] = text.substring(0, 100) + '...';
    } else {
      element['subtitle'] = '...';
    }
    element['image_url'] = 'https://mac5.ixcglobal.com/images?name=' + guide._doc.mainTitle + '&timestamp=' + timestamp;
    element['buttons'] = [{
      'type': 'postback',
      'title': 'Read more',
      'payload': guide._id
    }];
    elementsToSend.push(element);
  });

  if (elementsToSend.length > 10) {
    var i,j,temparray,chunk = 10;
    for (i=0,j=elementsToSend.length; i<j; i+=chunk) {
      temparray = elementsToSend.slice(i,i+chunk);
      // do whatever
      sendMessage(temparray);
    }
  } else sendMessage(elementsToSend);

  function sendMessage(elements) {
    let messageData = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: elements
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
        message: messageData
      }
    }, (error, response, body) => {
      if (error) {
        console.error(`Error sending messages: ${error}`)
      } else if (response.body.error) {
        console.error(`Error: ${response.body.error}`)
      }
    })
  }

}
