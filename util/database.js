const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
  MongoClient.connect(
    "mongodb+srv://nathansbradshaw:MfOpNOD2jJSH2a1n@cluster0.4a2nl.mongodb.net/shop?retryWrites=true&w=majority"
  )
    .then((client) => {
      console.log("Connected to MongoDB!");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
   if (_db) {
      return _db;
   }
   throw 'no database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
