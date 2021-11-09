var createError = require('http-errors');
var express = require('express');
const mongoose = require('mongoose');
const r_Index = require('./routes/index');
const r_Add = require('./routes/add');
const r_User = require('./routes/user');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
const expressValidator = require("express-validator");
const passport = require("passport");
const app = express();
const dataBase = require("./md/db")


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(require("connect-flash")());
app.use(function (req, res, next) {
    res.locals.messages = require("express-messages")(req, res);
    next();
});

// ============= Settings session ================


app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    // cookie: { secure: true }
}));

// =============== express-validator ===================

app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        let nameSpace = param.split(".");
        root = nameSpace.shift();
        formParam = root;

        while (nameSpace.length) {
            formParam += "[" + nameSpace.shift() + "]";
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        }
    }
}));


// mongoose settings
mongoose.connect(dataBase.db);
const db = mongoose.connection;
db.on('open', () => {
    console.log('mongoose run http://localhost:3000');
});

db.on('error', (err) => {
    console.log(err, 'monogose error');
});


//body-parser settings
// app.use(bodyParser.urlencoded({
//     extended: true
// }));
// app.use(bodyParser.json());


require("./pass/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());
app.get("*", (req, res, next) => {
    res.locals.user = req.user || null
    next();
});

// passport use

app.use(r_Index);
app.use(r_Add);
app.use(r_User);

// public settings
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

module.exports = app;