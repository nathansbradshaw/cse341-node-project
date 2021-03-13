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
   res.locals.isAuthenticated = req.session.isLoggedIn;
   if(req.session.user) {
      res.locals.isAdmin = req.session.user.isAdmin;
      res.locals.username = req.session.user.fname;
   }

   res.locals.csrfToken = req.csrfToken();
   next();
})

app.use((req, res, next) => {
   if (!req.session.user){
      return next();
   }

   User.findById(req.session.user._id)
   .then(user => {
      if(!user) {
         return next();
      }
      req.user = user;
      next();
   })
   .catch(err => {
      next(new Error(err));
   } );
})


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500',errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
   console.log(error);
   res.status(500).render('500', {
      pageTitle: 'Server Side Error', path: '/500',
      isAuthenticated: req.session.isLoggedIn,
      
    });
})

mongoose.connect(uri, options).then(result => {
   app.listen(PORT, () => console.log(`Listening on ${PORT}`));
}).catch(err => {
   console.log(err);
})
