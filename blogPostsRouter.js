const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const BlogPost = require('./models');

router.get('/', (req, res) => {
  BlogPost.find((err, blogs) => {
    if(err) {
      res.send(err)
    }
    res.json(blogs)
  });
});

router.get('/:id', (req, res) => {
  BlogPost.findById(req.params.id, (err, blogs) => {
    if(err) {
      res.send(err)
    }
    res.json(blogs)
  });
});

router.post('/', (req, res) => {
  console.log(req.body)
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
   const field = requiredFields[i];
   if (!(field in req.body)) {
     const message = `Missing \`${field}\` in request body`
     console.log(message);
     return res.status(400).send(message)
   }
 }
  const newBlogPost = new BlogPost()

  newBlogPost.title = req.body.title
  newBlogPost.content = req.body.content
  newBlogPost.author = req.body.author

  newBlogPost.save((err, record) => {
    if(err) {
      res.send(err)
    }

    res.json(record)
  });
});

router.put('/:id', (req,res) => {
  const requiredFields = ['title', 'content', 'author', 'publishDate'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.log(message);
      return res.status(400).send(message);
    }
  }
  console.log(`Updating blog post \`${req.params.id}\``);

  const updateObject = {};
  const updateableFields = ['title', 'content', 'author', 'publishDate'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObject[field] = req.body[field];
    }
  });

  BlogPost.findByIdAndUpdate(req.params.id, {$set: updateObject})
.then(blogs => res.status(201).json({"message": "Successfully updated blog post"}));
});

// delete request by id
router.delete('/:id', (req, res) => {
  BlogPost.findByIdAndRemove(req.params.id)
  .then(() => res.status(204).end());
});

module.exports = router;
