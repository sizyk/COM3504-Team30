const createError = require('http-errors');
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes');
const plantRouter = require('./routes/plant');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');

const app = express();
app.use(favicon(path.join('public', 'img', 'favicon.ico')));

// view engine setup
app.set('views', path.join(__dirname, 'layouts'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
// Increase upload size limit from 100kb
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: false, limit: '100mb' }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/plant', plantRouter);
app.use('/api', apiRouter);

app.use('/public', express.static('public'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(
  '/public/img/uploads',
  express.static(path.join(__dirname, '/public/img/uploads')),
); // for serving static image files

module.exports = app;
