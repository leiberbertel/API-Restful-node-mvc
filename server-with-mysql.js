import { createApp } from './app.js';
import { MovieModel } from './models/database/mysql/movie.js';

createApp({ movieModel: MovieModel });
