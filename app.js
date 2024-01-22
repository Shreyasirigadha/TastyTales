//app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3002;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/recipe-book', { useNewUrlParser: true, useUnifiedTopology: true });

// Create a Recipe schema
const recipeSchema = new mongoose.Schema({
  title: String,
  ingredients: String,
  procedure: String,
  tags: [String], // Array of tags
});


const Recipe = mongoose.model('Recipe', recipeSchema);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Home route
app.get('/', async (req, res) => {
  try {
    let recipes;
    let searchQuery;

    // Check if there's a search query
    if (req.query.search) {
      searchQuery = req.query.search.toLowerCase();

      // Use MongoDB's $regex operator for case-insensitive search
      recipes = await Recipe.find({
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { ingredients: { $regex: searchQuery, $options: 'i' } },
          { procedure: { $regex: searchQuery, $options: 'i' } },
          { tags: { $regex: searchQuery, $options: 'i' } },
        ],
      });
    } else {
      // Fetch all recipes
      recipes = await Recipe.find();
    }

    res.render('index', { recipes, searchQuery });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Add Recipe route
app.get('/add', (req, res) => {
  res.render('add_recipe');
});

app.post('/add', async (req, res) => {
  const { title, name, email, ingredients, procedure, tags, description } = req.body;

  const newRecipe = new Recipe({
    title,
    name,
    email,
    ingredients,
    procedure,
    tags: tags.split(',').map(tag => tag.trim()),
    description,
  });

  try {
    await newRecipe.save();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/about', (req,res)=>{
  res.render('about');
});

app.get('/help', (req,res)=>{
  res.render('help');
});

app.get('/delete/:id', async (req, res) => {
  const recipeId = req.params.id;

  try {
    const recipe = await Recipe.findById(recipeId);
    res.render('delete_confirmation', { recipe });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/delete/:id', async (req, res) => {
  const recipeId = req.params.id;

  try {
    // Use mongoose to find and delete the recipe
    await Recipe.findByIdAndDelete(recipeId);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/view-recipe/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(recipeId);
    console.log('Recipe:', recipe);


    if (!recipe) {
      return res.status(404).send('Recipe not found');
    }

    res.render(path.join(__dirname, 'views', 'view_recipe'), { recipe });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/views/:category/:recipe', (req, res) => {
  const category = req.params.category;
  const recipe = req.params.recipe;
  res.render(__dirname + `/views/${category}/${recipe}.ejs`);
  //res.render('/views/${category}/${recipe}')
});

app.post('/save-recipe', async (req, res) => {
  const { title, tags, ingredients, procedure } = req.body;

  const newRecipe = new Recipe({
    title,
    tags,
    ingredients,
    procedure,
  });

  try {
    await newRecipe.save();
    res.send('Recipe saved successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Add this route after your other routes in app.js
app.get('/search-by-ingredients', async (req, res) => {
  try {
    const selectedIngredients = req.query.ingredients.split(',');

    // Use MongoDB's $all operator to find recipes that contain all selected ingredients
    const recipes = await Recipe.find({ ingredients: { $all: selectedIngredients } });

    res.render('search_results', { recipes });

  } catch (error) {
    console.error('Error fetching recipes by ingredients:', error);
    res.status(500).send('Internal Server Error');
  }
});

// search using a specific tag
app.get('/search-by-tag/:tag', async (req, res) => {
  const tag = req.params.tag;

try {
   //Find recipes with the specified tag
  const recipes = await Recipe.find({ tags: tag });

    res.render('search_results', { recipes });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/recipe/:recipeName', (req, res) => {
  const recipeName = req.params.recipeName;
  const recipeFilePath = path.join(__dirname, 'views', `${recipeName}.ejs`);

  try {
    const recipeContent = fs.readFileSync(recipeFilePath, 'utf8');
    res.json({ recipeContent });
  } catch (error) {
    console.error('Error reading recipe file:', error);
    res.status(500).send('Internal Server Error');
  }
});



// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
