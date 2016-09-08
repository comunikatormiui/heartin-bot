import fs       from 'fs';
import mongoose from 'mongoose';
import config   from '../../config/';

const modelsPath = `${__dirname}/../models`;
fs.readdirSync(modelsPath).forEach(file => {
  if (~file.indexOf('js')) {
    require(`${modelsPath}/${file}`);
  }
});

const Docs = mongoose.model('Docs');

export default (req, res, next) => {
  console.log(`Received ${req.query.id}`);
  if (req.query.id) {
    Docs.findById(req.query.id, (err, img) => {
      if (err) {
        console.error(err);
        res.send('Error');
        next();
      } else {
        const buf = new Buffer(img.image.toString('ascii'), 'base64');
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': buf.length
        });
        res.end(buf);
        next();
      }
    });
  } else {
    res.send('Error');
    next();
  }
}
