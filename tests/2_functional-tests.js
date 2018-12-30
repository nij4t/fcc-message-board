/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  var _id1, _id2, reply_id1;

  suite('API ROUTING FOR /api/threads/:board', function() {
  
    suite('POST a thread to a specific message board', function() {
     
      test('', done => {
        chai.request(server)
        .post('/api/threads/testboard')
        .send({ text: 'test text', delete_password: 'testpasswd' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          _id1 = res.body._id;
          done();
        })
      });

      test('seed thread for reply', done => {
        chai.request(server)
        .post('/api/threads/testboard')
        .send({ text: 'test text', delete_password: 'testpasswd' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          _id2 = res.body._id
          done();
        })
      });

    });
    
    suite('GET an array of the most recent 10 bumped threads on the board', function() {
      
      test('', done => {
        chai.request(server)
        .get('/api/threads/testboard')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.notProperty(res.body[0], 'delete_password');
          assert.notProperty(res.body[0], 'reported');
          done();
        })
      })
      
    });
    
    suite('PUT request to /api/threads/{board} => I can report a thread and change it\'s reported value to true', function() {
      
      test('', done => {
        chai.request(server)
        .put('/api/threads/testboard')
        .send({ thread_id: _id1, reported: true })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'success');
          done();
        })
      })

    });

    suite('DELETE request to /api/threads/{board} => I can delete a thread completely', function() {
      
      test('', done => {
        chai.request(server)
        .delete('/api/threads/testboard')
        .send({ thread_id: _id1, delete_password: 'testpasswd' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'success');
          done();
        });
      });

    });
    
  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST /api/replies/:board => reply to a thead on a specific board', function() {
      
      test('', done => {
        chai.request(server)
        .post('/api/replies/testboard')
        .send({ 
          thread_id: _id2, 
          text: 'test reply', 
          delete_password: 'replytestpasswd' 
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'replies')
          assert.isArray(res.body.replies)
          reply_id1 = res.body.replies[0]._id;
          done();
        })
      });

    });
    
    suite('GET /api/replies/:board => get an entire thread with all it\'s replies from', function() {
      
      test('', done => {
        chai.request(server)
        .get('/api/replies/testboard')
        .query({ thread_id: _id2 })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.notProperty(res.body, 'delete_password');
          assert.notProperty(res.body, 'reported');
          done();
        })
      })

    });
    
    suite('PUT /api/replies/:board => report a reply and change it\'s reported value to true', function() {
      
      test('', done => {
        chai.request(server)
        .put('/api/replies/testboard')
        .send({ thread_id: _id2, reply_id: reply_id1 })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'success');
          done();
        })
      })

    });
    
    suite('DELETE /api/replies/:board => delete a post(just changing the text to \'[deleted]\')', function() {
      
      test('', done => {
        chai.request(server)
        .delete('/api/replies/testboard')
        .send({ 
          thread_id: _id2, 
          reply_id: reply_id1, 
          delete_password: 'replytestpasswd' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'success');
          done();
        })
      })

    });
    
  });

});
