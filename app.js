require('dotenv').config();
const cors = require('cors') // Place this with other requires (like 'path' and 'express')
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URL || (process.env.URI).toString();
const adminID = (process.env.ADMIN_ID).toString();

const PORT = process.env.PORT || 5000 // So we can run on heroku || (OR) localhost:5000
const publicDirectory = path.join(__dirname, 'public');

const errorController = require('./controllers/error');
const User = require('./models/user')

const app = express();


app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



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
   User.findById(adminID)
      .then(user => {
         req.user = user;
         next();
      })
      .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


mongoose.connect(uri, options).then(result => {
   // const user = new User({
   //    name: 'nate',
   //    email: 'nate@nate.com',
   //    cart: {
   //       items: []
   //    }
   // });
   // user.save();
   app.listen(PORT, () => console.log(`Listening on ${PORT}`));
}).catch(err => {
   console.log(err);
})
