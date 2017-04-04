import Canvas   from 'canvas';
import wrapText from './wrapText'

export default (req, res, next) => {
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
