export default (req, res) => {
  if (req.query['hub.verify_token'] === 'heartin-bot-verify-token') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('wrong token, error');
  }

  console.log(`Received ${req.query}`);
};
