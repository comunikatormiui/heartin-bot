export default (req, res, next) => {
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
