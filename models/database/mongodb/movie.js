import mongoose from 'mongoose';

const connection = await mongoose.connect('mongodb://localhost:27017/movies', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const movieSchema = new mongoose.Schema({
  title: String,
  year: Number,
  director: String,
  duration: Number,
  poster: String,
  rate: Number,
  genres: [String]
});

const Movie = mongoose.model('Movie', movieSchema);

export class MovieModel {
  static async getAll () {
    return await Movie.find();
  }

  static async getById ({ id }) {
    return await Movie.findById(id);
  }

  static async create ({ movieData }) {
    const movie = new Movie(movieData);
    return await movie.save();
  }

  static async update ({ id, movieData }) {
    return await Movie.findByIdAndUpdate(id, movieData, { new: true });
  }

  static async delete ({ id }) {
    return await Movie.findByIdAndDelete(id);
  }
}
