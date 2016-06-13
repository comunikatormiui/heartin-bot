import express      from 'express';
import deb          from 'debug';
import logger       from 'morgan';
import path         from 'path';
import favicon      from 'serve-favicon';
import bodyParser   from 'body-parser';
import cookieParser from 'cookie-parser';
import cons         from 'consolidate';
import routes       from './routes';

const debug = deb('heartin-bot:server');
const app = express();

app.set('port', process.env.PORT || 9000);

app.engine('pug', cons.pug);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
if (app.get('env') !== 'development') {
  app.enable('view cache');
} else {
  app.use(logger('dev'));
}
app.use(favicon(`${__dirname}/public/favicon.ico`));
app.use(bodyParser.json({
  limit: '20mb'
}));
app.use(bodyParser.urlencoded({
  limit: '20mb',
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(app.get('port'), '0.0.0.0', () => {
  debug(`Express server listening on port ${app.get('port')} in ${app.get('env')} mode`);
});
