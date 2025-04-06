require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./server/config/db');
const {isActiveRoute} = require('./server/helpers/routeHelpers');

const app = express();
const PORT = 5000 || process.env.PORT;

// Connect to DB
connectDB();

// to pass search data
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret : 'keyboard cat',
    resave : false,
    saveUninitialized : true,
    store : MongoStore.create({ mongoUrl : process.env.MONGODB_URI})
}));

app.use(express.static('public'));

// Template Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

const landLayout = './layouts/land';
// Landing Page
app.get("/", (req, res) => {
    res.render('landing' , {layout : landLayout});
});

app.post("/select", (req, res) => {
    const { role } = req.body;
    if (role === "admin") {
      res.redirect("/admin");
    } else {
      res.redirect("/user");
    }
});
  
app.use('/user', require('./server/routes/user'));
app.use('/admin', require('./server/routes/admin'));

app.listen(PORT , () => {
    console.log(`server running on port ${PORT}`);
})