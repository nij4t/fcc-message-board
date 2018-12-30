/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

const MongoClient = require('mongodb').MongoClient;
const ObjectID    = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.MONGOLAB_URI;

module.exports = function (app) {
  
  app.route('/api/threads/:board')

    .get((req, res) => {
      const board = req.params.board
      MongoClient.connect(CONNECTION_STRING)
      .then(db => {
        db.collection(board)
        .find({}, { 
          delete_password: 0, 
          reported: 0, 
          'replies.reported': 0,
          'replies.delete_password': 0 
        }, 
          {replies: { $size: 3, $sort: { created_on: -1 } }})
        .sort({ bumped_on: -1 }).limit(10)
        .toArray()
        .then(docs => res.json(docs))
        .catch(err => res.json(err))
      })
      .catch(err => res.json(err))
    })

    .post((req, res) => {
      const board = req.params.board
      const thread = Object.assign(req.body, {
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        replies: []
      });
      MongoClient.connect(CONNECTION_STRING)
      .then(db => {
        db.collection(board)
        .insertOne(thread)
        .then(doc => {
          thread._id = doc.insertedId
          res.json(thread)
          // res.redirect('/b/'+board)
        })
      })
      .catch(err => res.json(err))
    })

    .put((req, res) => {
      const board = req.params.board;
      const _id = req.body.thread_id;
      const reported = req.body.reported;
      MongoClient.connect(CONNECTION_STRING)
      .then(db => {
        db.collection(board)
        .update({ _id: new ObjectID(_id) }, { $set: { reported } })
        .then(doc => {
          res.json({ success: 'successfully updated' })
        })
        .catch(err => res.json(err))
      })
      .catch(err => res.json(err))
    })

    .delete((req, res) => {
      const board = req.params.board;
      const _id = req.body.thread_id;
      const delete_password = req.body.delete_password;
      MongoClient.connect(CONNECTION_STRING)
      .then(db => {
        db.collection(board)
        .remove({ _id: new ObjectID(_id), delete_password })
        .then(doc => {
          res.json({ success: 'successfully deleted' })
        })
        .catch(err => res.json({ error: 'incorrect password' }))
      })
      .catch(err => res.json(err))
    })

    
  app.route('/api/replies/:board')

    .get((req, res) => {
      const board = req.params.board;
      const thread_id = req.query.thread_id;
      MongoClient.connect(CONNECTION_STRING)
      .then(db => {
        db.collection(board)
        .findOne({ _id: new ObjectID(thread_id) }, { 
          delete_password: 0, 
          reported: 0, 
          'replies.reported': 0,
          'replies.delete_password': 0 
        }, 
        { replies: { $sort: { created_on: -1 } }})
        .then(docs => res.json(docs))
        .catch(err => res.json(err))
      })
      .catch(err => res.json(err))
    })

    .post((req, res) => {
      const board = req.params.board;
      const { text, thread_id, delete_password } = req.body;
      const reply = { 
        text, 
        created_on: new Date(), 
        delete_password, 
        reported: false,
        _id: new ObjectID()
      }
      MongoClient.connect(CONNECTION_STRING)
      .then(db => {
        db.collection(board)
        .update({ _id: new ObjectID(thread_id) },
        { $push: { replies: reply }, $set: { bumped_on: reply.created_on } }
        ).then(doc => {
          // res.redirect('/b/'+board+'/'+thread_id)
          res.redirect('/api/replies/'+board+'/?thread_id='+thread_id)
        }).catch(err => res.json(err))
      }).catch(err => res.json(err))
    })

    .put((req, res) => {
      const board = req.params.board;
      const _id = req.body.thread_id;
      const reply_id = req.body.reply_id;
      MongoClient.connect(CONNECTION_STRING)
      .then(db => {
        db.collection(board)
        .update(
          { _id: new ObjectID(_id), 'replies._id': new ObjectID(reply_id) }, 
          { $set: { 'replies.$.reported': true }
        })
        .then(doc => {
          res.json({ success: 'successfully updated' })
        })
        .catch(err => res.json(err))
      })
      .catch(err => res.json(err))
    })

    .delete((req, res) => {
      const board = req.params.board;
      const _id = req.body.thread_id;
      const reply_id = req.body.reply_id;
      const delete_password = req.body.delete_password;
      MongoClient.connect(CONNECTION_STRING)
      .then(db => {
        db.collection(board)
        .update(
          { _id: new ObjectID(_id), 
            'replies._id': new ObjectID(reply_id), 
            'replies.delete_password': delete_password
          }, 
          { $set: { 'replies.$.text': '[deleted]' }
        })
        .then(doc => {
          res.json({ success: 'successfully deleted' })
        })
        .catch(err => res.json(err))
      })
      .catch(err => res.json(err))
    })

};
