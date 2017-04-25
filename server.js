const express = require('express');

const morgan = require('morgan');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const app = express();

app.use(morgan('common'));

const {BlogPosts} = require('./models');

// we want to create blog posts using BlogPosts.create
BlogPosts.create('My First Blog Post', 'This is my blog post content', 'Hunter Motte', 'April 24th');

//GET request to get our blog posts
app.get('/blog-posts', (req, res) => {
  res.json(BlogPosts.get());
});

// post request, need to make sure we have data for title, content, and author
app.post('/blog-posts', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.log(message);
      return res.status(400).send(message)
    }
  }
  const item = BlogPosts.create(req.body.title, req.body.content, req.body.author);
  res.status(201).json(item);
});

// delete request by id
app.delete('/blog-posts/:id', (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted blog post with id \`${req.params.id}\``);
  res.status(204).end();
});


app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});
