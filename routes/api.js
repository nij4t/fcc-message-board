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
        .find({}, { delete_password: 0, reported: 0 }, 
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
      // TODO: I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}.
      // Also hiding the same fields.
    })

    .post((req, res) => {
      // TODO: I can POST a reply to a thead on a specific board
      // by passing form data text, delete_password, & thread_id to /api/replies/{board}
      // and it will also update the bumped_on date to the comments date.
      // (Recomend res.redirect to thread page /b/{board}/{thread_id}) 
      // In the thread's 'replies' array will be saved _id, text, created_on, delete_password, & reported.
    })

    .put((req, res) => {
      // TODO: I can report a reply and change it's reported value to true by sending a PUT request to /api/replies/{board}
      // and pass along the thread_id & reply_id.
      // (Text response will be 'success')
    })

    .delete((req, res) => {
      // TODO: I can delete a post(just changing the text to '[deleted]') if I send a DELETE request to /api/replies/{board}
      // and pass along the thread_id, reply_id, & delete_password.
      // (Text response will be 'incorrect password' or 'success')
    })

};
