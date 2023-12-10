import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const connection = await mysql.createConnection(config);

export class MovieModel {
  static async getAll ({ genre }) {
    let movies;

    if (genre) {
      const lowerCaseGenre = genre.toLowerCase();

      const [genres] = await connection.query(
        'SELECT id FROM genre WHERE LOWER(name) = ?;', [lowerCaseGenre]
      );

      if (genres.length === 0) return [];

      const [{ id: genreId }] = genres;

      [movies] = await connection.query(
        'SELECT m.title, m.year, m.director, m.duration, m.poster, m.rate, ' +
        'BIN_TO_UUID(m.id, 0) AS id, GROUP_CONCAT(g.name SEPARATOR \', \') AS genres ' +
        'FROM movie m ' +
        'LEFT JOIN movie_genres mg ON m.id = mg.movie_id ' +
        'LEFT JOIN genre g ON mg.genre_id = g.id ' +
        'WHERE mg.genre_id = ? ' +
        'GROUP BY mg.movie_id;', [genreId]
      );
    } else {
      [movies] = await connection.query(
        'SELECT m.title, m.year, m.director, m.duration, m.poster, m.rate, ' +
        'BIN_TO_UUID(m.id, 0) AS id, GROUP_CONCAT(g.name SEPARATOR \', \') AS genres ' +
        'FROM movie m ' +
        'LEFT JOIN movie_genres mg ON m.id = mg.movie_id ' +
        'LEFT JOIN genre g ON mg.genre_id = g.id ' +
        'GROUP BY m.title;'
      );
    }

    return movies;
  }

  static async getById ({ id }) {
    const [movies] = await connection.query(
      'SELECT m.title, m.year, m.director, m.duration, m.poster, m.rate, ' +
      'BIN_TO_UUID(m.id, 0) AS id, GROUP_CONCAT(g.name SEPARATOR \', \') AS genres ' +
      'FROM movie m ' +
      'LEFT JOIN movie_genres mg ON m.id = mg.movie_id ' +
      'LEFT JOIN genre g ON mg.genre_id = g.id ' +
      'WHERE m.id = UUID_TO_BIN(?, 0);', [id]
    );

    if (movies.length === 0 || movies[0].id === null) {
      return null;
    }

    return movies[0];
  }

  static async create ({ input }) {
    const {
      genre: genreInput,
      title,
      year,
      duration,
      director,
      rate,
      poster
    } = input;

    const [uuidResult] = await connection.query('SELECT UUID() uuid;');
    const [uuid] = uuidResult;

    try {
      await connection.query(
        'INSERT INTO movie (id, title, year, director, duration, poster, rate) ' +
        'VALUES (UUID_TO_BIN(?, 0), ?, ?, ?, ?, ?, ?);',
        [uuid.uuid, title, year, director, duration, poster, rate]
      );
    } catch (e) {
      throw new Error('Error creating a movie');
    }

    for (const genreName of genreInput) {
      const capitalizedGenreName = genreName.charAt(0).toUpperCase() + genreName.slice(1).toLowerCase();

      const [genres] = await connection.query(
        'SELECT id FROM genre WHERE name = ?;', [capitalizedGenreName]
      );

      if (genres.length > 0) {
        await connection.query(
          'INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?, 0), ?);',
          [uuid.uuid, genres[0].id]
        );
      }
    }
    const [movies] = await connection.query(
      'SELECT m.title, m.year, m.director, m.duration, m.poster, m.rate, ' +
      'BIN_TO_UUID(m.id, 0) AS id, GROUP_CONCAT(g.name SEPARATOR \', \') AS genres ' +
      'FROM movie m ' +
      'LEFT JOIN movie_genres mg ON m.id = mg.movie_id ' +
      'LEFT JOIN genre g ON mg.genre_id = g.id ' +
      'WHERE m.id = UUID_TO_BIN(?, 0) ' +
      'GROUP BY m.id;', [uuid.uuid]
    );

    return movies[0];
  }

  static async update ({ id, input }) {
    const validFields = ['title', 'year', 'duration', 'director', 'rate', 'poster'];
    const fieldsToUpdate = Object.entries(input)
      .filter(([key]) => validFields.includes(key))
      .map(([key, value]) => ({ key, value }));

    if (fieldsToUpdate.length === 0) {
      return null;
    }

    const setClause = fieldsToUpdate.map(field => `${field.key} = ?`).join(', ');
    const values = fieldsToUpdate.map(field => field.value);

    const query = `UPDATE movie SET ${setClause} WHERE id = UUID_TO_BIN(?, 0);`;
    values.push(id);

    try {
      await connection.query(query, values);
      const [updatedMovies] = await connection.query(
        'SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id, 0) AS id ' +
        'FROM movie WHERE id = UUID_TO_BIN(?, 0);', [id]
      );

      return updatedMovies.length > 0 ? updatedMovies[0] : null;
    } catch (error) {
      return new Error('Algo ha salido mal!');
    }
  }

  static async delete ({ id }) {
    const result = await connection.query('DELETE FROM movie WHERE id = UUID_TO_BIN(?, 0);', [id]);

    return result[0].affectedRows > 0;
  }
}
