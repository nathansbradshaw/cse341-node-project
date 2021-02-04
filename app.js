require('dotenv').config();
const cors = require('cors') // Place this with other requires (like 'path' and 'express')
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const uri = process.env.MONGODB_URL || (process.env.URI);
const adminID = (process.env.ADMIN_ID) || '601202c52d39e2426491f911';

const PORT = process.env.PORT || 5000 // So we can run on heroku || (OR) localhost:5000
const publicDirectory = path.join(__dirname, 'public');

const errorController = require('./controllers/error');
const User = require('./models/user')

const app = express();
const store = new MongoDBStore({
   uri: uri,
   collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'my secret change me', resave: false, saveUninitialized: false, store: store}));
app.use(csrfProtection);
app.use(flash());

const corsOptions = {
   origin: "https://nathan-cse341-prove.herokuapp.com/",
   optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
   useUnifiedTopology: true,
   useNewUrlParser: true,
   useCreateIndex: true,
   useFindAndModify: false,
   family: 4
};




app.use((req, res, next) => {
   if (!req.session.user){
      return next();
   }

   User.findById(req.session.user._id)
   .then(user => {
      req.user = user;
      next();
   })
   .catch(err => console.log(err));
})
app.use((req, res, next) => {
   res.locals.isAuthenticated = req.session.isLoggedIn;
   res.locals.csrfToken = req.csrfToken();
   next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);


mongoose.connect(uri, options).then(result => {
   app.listen(PORT, () => console.log(`Listening on ${PORT}`));
}).catch(err => {
   console.log(err);
})
