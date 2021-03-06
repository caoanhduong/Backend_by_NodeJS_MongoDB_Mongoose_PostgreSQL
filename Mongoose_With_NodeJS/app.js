
const tracing = require('@opencensus/nodejs');
const propagation = require('@opencensus/propagation-b3');

// Creates Zipkin exporter
const zipkin = require('@opencensus/exporter-zipkin');
const exporter = new zipkin.ZipkinTraceExporter({
	url: 'http://localhost:9411/api/v2/spans',
	serviceName: 'opencensus-express'
});

// NOTE: Please ensure that you start the tracer BEFORE initializing express app
// Starts tracing and set sampling rate, exporter and propagation
tracing.start({
	exporter,
	samplingRate: 1, // For demo purposes, always sample
	propagation: new propagation.B3Format(),
	logLevel: 1 // show errors, if any
});

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const mongoose = require('mongoose');
const expressStatusMonitor = require('express-status-monitor');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usersRoutes.js');
var carsRouter = require('./routes/carsRoutes.js')

var app = express();

mongoose.connect('mongodb://localhost:27017/contact', { useNewUrlParser: true });
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressStatusMonitor());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cars', carsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
