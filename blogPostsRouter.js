const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {BlogPosts} = require('./models');

new BlogPosts = ('My First Blog Post', 'This is my blog post content', 'Hunter Motte');

router.get('/', (req, res) => {
  BlogPosts.find({}, (err, blogs) => {
    if(err) {
      res.send(err)
    }
    res.json(blogs)
  });
});

router.get('/:id', (req, res) => {
  BlogPosts.findById({req.params.id}, (err, blogs) => {
    if(err) {
      res.send(err)
    }
    res.json(blogs)
  });
});

router.post('/', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
   const field = requiredFields[i];
   if (!(field in req.body)) {
     const message = `Missing \`${field}\` in request body`
     console.log(message);
     return res.status(400).send(message)
   }
 }
  const newBlogPost = new BlogPosts()

  newBlogPost.title = req.body.title
  newBlogPost.content = req.body.content
  newBlogPost.author = req.body.author

  newBlogPost.save(err, record) => {
    if(err) {
      res.send(err)
    }

    res.json(record)
  });
});

router.put('/:id', jsonParser, (req,res) => {
  const requiredFields = ['title', 'content', 'author', 'publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.log(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = (
      `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`);
      console.log(message);
      return res.status(400).send(message);
  }
  console.log(`Updating blog post \`${req.params.id}\``);

  const updateObject = {};
  const updateableFields = ['title', 'content', 'author', 'publishDate'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObject[field] = req.body[field];
    }
  });

  BlogPosts.findByIdAndUpdate(req.params.id, {$set: updateObject})
  .then(blogs => res.status(204).end())
});

// delete request by id
router.delete('/:id', (req, res) => {
  BlogPosts.findByIdAndRemove(req.params.id);
  .then(() => res.status(204).end());
});

module.exports = router;
