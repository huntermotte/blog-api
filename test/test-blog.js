const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');
const BlogPost = require('../models');
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
  return BlogPost.create(seedData);
}

// function that generates a blog title
function generateBlogTitle() {
  const titles = ['Title 1', 'Title 2', 'Title 3', 'Title 4', 'Title 5'];
  return titles[Math.floor(Math.random() * titles.length)];
}

// function that generates blog content
function generateBlogContent() {
  const contentExamples = ['this is some great content', 'even better content here', 'the quick brown fox jumped over the lazy dog', 'four score and seven years ago', 'the last example of content'];
  return contentExamples[Math.floor(Math.random() * contentExamples.length)];
}

// function that generates blog author name
function generateAuthor() {
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName()
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
        res.body.should.have.length.of.at.least(1);
        return BlogPost.count();
      })
      .then(function(count) {
        res.body.should.have.length.of(count);
      });
    });
  });

     it('should make sure blogs have correct fields', function() {
      let responseBlog;
      return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.should.have.length.of.at.least(1);
        res.body.forEach(function(blog) {
          blog.should.be.a('object');
          blog.should.include.keys('_id', 'title', 'content', 'author');
        });
        responseBlog = res.body[0];
        return BlogPost.findById(responseBlog.id).exec();
      })
    });

  describe('POST endpoint', function() {
    it('should create a new blog post', function() {
      const newBlog = generateBlogData();

      return chai.request(app)
      .post('/blog-posts')
      .send(newBlog)
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('_id', 'title', 'content', 'author');
        res.body.title.should.equal(newBlog.title);
        res.body.content.should.equal(newBlog.content);
        res.body.author.firstName.should.equal(newBlog.author.firstName);
        res.body.author.lastName.should.equal(newBlog.author.lastName);
        res.body._id.should.not.be.null;
        return BlogPost.findById(res.body._id);
      })
      .then(function(blog) {
        blog.title.should.equal(newBlog.title);
        blog.content.should.equal(newBlog.content);
        blog.author.firstName.should.equal(newBlog.author.firstName);
        blog.author.lastName.should.equal(newBlog.author.lastName);
      });
    });
  });

  describe('PUT endpoint', function() {
    it('should update fields you send over', function() {
      const updateBlog = {
        title: 'Updated title',
        content: 'Brand spankin new content',
        author: "Billy Bob",
        publishDate: Date()
      };

      return BlogPost.findOne()
      .then(function(blog) {
        updateBlog.id = blog.id;

        return chai.request(app)
        .put(`/blog-posts/${blog.id}`)
        .send(updateBlog);
      })
      .then(function(res) {
        res.should.have.status(201);
        return BlogPost.findById(updateBlog.id);
      })
      .then(function(blog) {
        blog.title.should.equal(updateBlog.title);
        blog.content.should.equal(updateBlog.content);
      });
    });
  });

  describe('DELETE endpoint', function() {
    it('should delete a blog post by id', function() {
      let blog;

      return BlogPost.findOne()
      .then(function(_blog) {
        blog = _blog;
        return chai.request(app).delete(`/blog-posts/${blog.id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
        return BlogPost.findById(blog.id);
      })
      .then(function(_blog) {
        should.not.exist(_blog);
      });
    });
  });

});
