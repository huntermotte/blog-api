const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
const should = chai.should();
chai.use(chaiHttp);

describe('BlogPosts', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  })

  it('should get blog posts on GET', function() {
    return chai.request(app)
    .get('/blog-posts')
    .then(function(res) {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      res.body.should.have.length.of.at.least(1);
      res.body.forEach(function(item) {
        item.should.be.a('object');
        item.should.have.all.keys('id', 'title', 'content', 'author', 'publishDate')
      });
    });
  });

  it('should create new blog posts on POST', function() {
    const newBlogPost = {
      title: "My Post",
      content: 'Content goes here',
      author: 'Hunter'
    };
    return chai.request(app)
    .post('/blog-posts')
    .send(newBlogPost)
    .then(function(res) {
      res.should.have.status(201);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.should.include.keys('title', 'content', 'author');
      res.body.title.should.equal(newBlogPost.title);
      res.body.content.should.equal(newBlogPost.content);
      res.body.author.should.equal(newBlogPost.author);
    });
  });

  it('should update blog posts on PUT', function() {
    const updatePost = {
      title: 'New Title',
      content: 'Brand new content',
      author: 'Bill Nye',
      publishDate: new Date()
    }
    return chai.request(app)
    .get('/blog-posts')
    .then(function(res) {
      updatePost.id = res.body[0].id;

      return chai.request(app)
      .put(`/blog-posts/${updatePost.id}`)
      .send(updatePost)
      })
      .then(function(res) {
        res.should.have.status(204);
        res.body.should.be.a('object');
      });
    });

  it('should delete blog posts on DELETE', function() {
    return chai.request(app)
    .get('/blog-posts')
    .then(function(res) {
      return chai.request(app)
      .delete(`/blog-posts/${res.body[0].id}`)
    })
    .then(function(res) {
      res.should.have.status(204);
    });
  });

});
