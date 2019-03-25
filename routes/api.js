/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
const COLLECTION = 'personal-library';
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function (err, db) {
        if (err) {
          console.log(`Failed to connect to DB : ${err}`);
          return;
        }
        console.log(`Connected to DB`);
        let collection = db.collection(COLLECTION);
        collection.find({}).toArray(function (err, docs) {
          if (err) res.send(`DB Error: ${err}`);
          else {
            res.send(docs);
          }
        })
        db.close();
      })
    })

    .post(function (req, res) {
      var title = req.body.title;
      if (!title) {
        res.send(`Error: No title provided`);
        return;
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, function (err, db) {
        if (err) {
          console.log(`Failed to connect to DB : ${err}`);
          return;
        }
        console.log(`Connected to DB`);
        let collection = db.collection(COLLECTION);
        //response will contain new book object including atleast _id and title
        collection.insertOne({
          title: title,
          comments: [],
          commentcount: 0
        }, function (err, r) {
          if (err) res.send(`DB Error : ${err}`);
          else {
            res.send(r.ops[0]);
          }
        })
        db.close();
      })
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) {
          console.log(`Failed to connect to DB : ${err}`);
          return;
        }
        console.log(`Connected to DB`);
        let collection = db.collection(COLLECTION);
        collection.deleteMany({}, function(err, r) {
          if (err) res.send(`DB delete error: ${err}`);
          else {
            res.send(`complete delete successful`);
          }
        })
      })
    });


  app.route('/api/books/:id')
    .get(function (req, res) {
      var bookid = req.params.id;
      if (!ObjectId.isValid(bookid)) {
        res.send(`${id} is not a valid _id`);
        return;
      }
      let o_id = new ObjectId(bookid);
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
        if (err) {
          console.log(`Failed to connect to DB : ${err}`);
          return;
        }
        console.log(`Connected to DB`);
        let collection = db.collection(COLLECTION);
        collection.findOne({_id: o_id}, function(err, r){
          if (err) res.send(`DB Error`);
          if (!r) res.send('no book exists');
          else res.send(r);
        })
        db.close();
      })
    })

    .post(function (req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      if (!ObjectId.isValid(bookid)) {
        res.send(`${id} is not a valid _id`);
        return;
      }
      let o_id = new ObjectId(bookid);
      //json res format same as .get
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
        if (err) {
          console.log(`Failed to connect to DB : ${err}`);
          return;
        }
        console.log(`Connected to DB`);
        let collection = db.collection(COLLECTION);
        collection.findOneAndUpdate({_id: o_id}
          , {
            $push: {comments: comment},
            $inc: {commentcount: 1}
          }, {
            new:true
          }
          , function(err, r){
          if (err) res.send(`DB Error`);
          if (!Object.keys(r).length) res.send('no book exists');
          res.send(r.value);
        })
        db.close();
      })
    })

    .delete(function (req, res) {
      var bookid = req.params.id;
      if (!ObjectId.isValid(bookid)) {
        res.send(`${id} is not a valid _id`);
        return;
      }
      let o_id = new ObjectId(bookid);
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db){
        if (err) {
          console.log(`Failed to connect to DB : ${err}`);
          return;
        }
        console.log(`Connected to DB`);
        let collection = db.collection(COLLECTION);
        collection.deleteOne({_id: o_id}
          , function(err, r){
          if (err) res.send(`Delete One Error: ${err}`);
          else res.send('delete successful');
        })
        db.close();
      })
    });
};
