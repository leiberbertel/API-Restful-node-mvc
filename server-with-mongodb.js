import { createApp } from './app.js';
import { MovieModel } from './models/database/mongodb/movie.js';

createApp({ movieModel: MovieModel });
