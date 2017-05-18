const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');
const {BlogPost} = require('../models');
// need to bring in our TEST_DATABASE_URL
const {TEST_DATABASE_URL} = require('../config');

const should = chai.should();

chai.use(chaiHttp);

// high level: set up faker data

// write a function that seeds the database with blog database
function seedBlogData() {
  console.log('Seeding blog data');
  const seedData = [];

  for (let i=0; i<=10; i++) {
    seedData.push(generateBlogData());
  }

  return BlogPost.insertMany(seedData);
}

// function that generates a blog title
function generateBlogTitle() {
  const titles = ['Title 1', 'Title 2', 'Title 3', 'Title 4', 'Ttitle 5'];
  return titles[Math.floor(Math.random() * titles.length)];
}

// function that generates blog content
function generateBlogContent() {
  return faker.Lorem.paragraph();
}

// function that generates blog author name
function generateAuthor() {
  return {
    firstName: faker.firstName(),
    lastName: faker.lastName()
  }
}

// function that inserts our generated data using faker
function generateBlogData() {
  return {
    title: generateBlogTitle(),
    content: generateBlogContent(),
    author: generateAuthor()
  }
}

// function that tears down the database
function tearDownDb() {
  console.log('Deleting database');
  return mongoose.connection.dropDatabase();
}

// 'describe' block before our asynch operation
describe('Blog API Test', function() {
  // before rotuine to start the server
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  // beforeEach routine that seeds our database
  beforeEach(function() {
    return seedBlogData();
  });
  // afterEacr routine that tears down the database after each test runs
  afterEach(function() {
    return tearDownDb();
  });
  // after routine that shuts down the server
  after(function() {
    return closeServer();
  });

  // begin nested 'describe' blocks to test API endpoints
  // one for each GET/POST/PUT/DELETE endpoint
  describe('GET endpoint', function() {
    it('should get all current blog posts', function() {
      let res;
      return chai.request(app)
      .get('/blog-posts')
      .then(function(_res) {
        res = _res;
        res.should.have.status(200);
        res.body.blogposts.should.have.length.of.at.least(1);
        return BlogPost.count();
      })
      .then(function(count) {
        res.body.blogposts.should.have.length.of(count);
      });
    });

    it('should make sure blogs have correct fields', function() {
      let responseBlog;
      return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.blogposts.should.be.a('array');
        res.body.blogposts.have.length.of.at.least(1);
        res.body.blogposts.forEach(function(blog) {
          blog.should.be.a('object');
          blog.should.include.keys('id', 'title', 'content', 'author', 'publishDate')
        });
        responseBlog = res.body.blogposts[0];
        return BlogPost.findById(responseBlog.id);
      });
      .then(function(blog) {
        responseBlog.id.should.equal(blog.id);
        responseBlog.title.should.equal(blog.title);
        responseBlog.content.should.equal(blog.content);
        responseBlog.author.should.equal(blog.author);
        responseBlog.publishDate.should.equal(blog.publishDate);
      });
    });
  });

  describe('POST endpoint', function() {
    it('should create a new blog post', function() {

    });
  });

  describe('PUT endpoint', function() {
    it('should update fields you send over', function() {

    });
  });

  describe('DELETE endpoint', function() {
    it('should delete a blog post by id', function() {

    });
  });

});
