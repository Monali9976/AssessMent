const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/movie');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  // Initial data
  const initialMovies = [
    {
      name: "Harry Potter and the Order of the Phoenix",
      img: "https://bit.ly/2IcnSwz",
      summary: "Harry Potter and Dumbledore's warning about the return of Lord Voldemort is not heeded by the wizard authorities who, in turn, look to undermine Dumbledore's authority at Hogwarts and discredit Harry."
    },
    {
      name: "The Lord of the Rings: The Fellowship of the Ring",
      img: "https://bit.ly/2Ct1Lcg",
      summary: "A young hobbit, Frodo, who has found the One Ring that belongs to the Dark Lord Sauron, begins his journey with eight companions to Mount Doom, the only place where it can be destroyed."
    },
    {
      name: "Avengers: Endgame",
      img: "https://bit.ly/2PzcZlb",
      summary: "Adrift in space with no food or water, Tony Stark sends a message to Pepper Potts as his oxygen supply starts to dwindle. Meanwhile, the remaining Avengers -- Thor, Black Widow, Captain America, and Bruce Banner -- must figure out a way to bring back their vanquished allies for an epic showdown with Thanos -- the evil demigod who decimated the planet and the universe."
    }
  ];

  try {
    // Check if the initial data is already in the database
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      // Insert initial data
      await Movie.insertMany(initialMovies);
      console.log('Initial movies data has been added to the database');
    } else {
      console.log('Movie data already exists in the database');
    }
  } catch (err) {
    console.error('Error inserting initial movies data:', err);
  }
});

// Movie Schema
const movieSchema = new mongoose.Schema({
  name: String,
  img: String,
  summary: String
});

const Movie = mongoose.model('Movie', movieSchema);

// Routes

// Create a new movie
app.post('/movie', async (req, res) => {
  const newMovie = new Movie(req.body);
  try {
    const savedMovie = await newMovie.save();
    res.status(201).json(savedMovie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Read all movies
app.get('/movie', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Read one movie
app.get('/movie/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie == null) {
      return res.status(404).json({ message: 'Cannot find movie' });
    }
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a movie
app.patch('/movie/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie == null) {
      return res.status(404).json({ message: 'Cannot find movie' });
    }
    if (req.body.name != null) {
      movie.name = req.body.name;
    }
    if (req.body.img != null) {
      movie.img = req.body.img;
    }
    if (req.body.summary != null) {
      movie.summary = req.body.summary;
    }
    const updatedMovie = await movie.save();
    res.json(updatedMovie);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a movie
app.delete('/movie/:id', async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);
      if (movie == null) {
        return res.status(404).json({ message: 'Cannot find movie' });
      }
      await Movie.deleteOne({ _id: req.params.id });
      res.json({ message: 'Deleted Movie' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
