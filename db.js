const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.MONGODB_URL ;

mongoose.connect(mongoURL)
.then(()=> console.log("Connected to MongoDB server"))
.catch(err => console.log(err));

//Get the default connection
//Mongoose maintains a default connection when you use mongoose.connect()
const db = mongoose.connection;

//Define event listener for databae connection

db.on('connected', ()=> {
    console.log("Connected to MongoDB server");
    
});

db.on('error' , (err)=> {
    console.log("MongoDB connection error", err);
    
});

db.on('disconnected', ()=> {
    console.log("MongoDB disconnected");
});

module.exports = db;