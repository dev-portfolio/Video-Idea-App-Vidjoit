const express = require('express');
const exphbs  = require('express-handlebars');
const mongoose = require('mongoose');
const bodyparser = require('body-parser')
const methodOverride = require('method-override')
const app = express();

mongoose.Promise = global.Promise;
 
//load idea model
require('./models/Idea');
const Idea = mongoose.model('ideas'); 

// connect mongoose
mongoose.connect('mongodb://localhost/test')
.then(() => console.log('mongo connected'))
.catch(err => console.log(err));

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));

//override Middleware
app.use(methodOverride('_method'));

//body parser
app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())


app.set('view engine', 'handlebars');

// UPDATE Route
app.put('/ideas/:id', (req, res) => {
  Idea.findOne({
    _id : req.params.id
  })
  .then(idea=> {
    idea.title = req.body.title;
    idea.details = req.body.details;
  
    idea.save()
    .then(idea => {
      res.redirect('/ideas');
    })
  });

});


//edit form
app.get('/edit/:id' , (req, res) => {
  Idea.findOne({
    _id : req.params.id
  })
  .then(idea => {res.render('edit', {
      idea:idea
    });
  });
});

// Index Route
app.get('/', (req, res) => {
  const title = 'hey Welcome';
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});
// ideas Route
app.get('/ideas', (req, res) => {
  Idea.find({})
  .sort({date : 'desc'})
  .then(ideas => {
    res.render('ideas', {
      ideas : ideas
    });
  });
 
});
//idea form
app.get('/add', (req, res) => {
  res.render('add');
});
// process form
app.post('/add', (req, res) => {
  let errors = [];

  if(!req.body.title){
    errors.push({text:'Please add a title'});
  }
  if(!req.body.details){
    errors.push({text:'Please add some details'});
  }

  if(errors.length > 0){
    res.render('add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
  const newUser = {
    title :req.body.title,
    details: req.body.details
  }
  new Idea(newUser)
  .save()
  .then(idea => {
    res.redirect('/ideas');
  })  
}
});
const port = 5000;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});