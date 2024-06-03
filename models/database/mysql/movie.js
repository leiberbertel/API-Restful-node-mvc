import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const connection = await mysql.createConnection(config);

/**
 * Modelo para manejar las operaciones relacionadas con las películas en la base de datos.
 */
export class MovieModel {
  /**
   * Obtiene todas las películas, opcionalmente filtradas por género.
   * @param {Object} options - Opciones de búsqueda.
   * @param {string} [options.genre] - Género de las películas a buscar.
   * @returns {Promise<Array>} La lista de películas.
   */
  static async getAll({ genre }) {
    let movies;

    if (genre) {
      const lowerCaseGenre = genre.toLowerCase();

      const [genres] = await connection.query(
        "SELECT id FROM genre WHERE LOWER(name) = ?;",
        [lowerCaseGenre]
      );

      if (genres.length === 0) return [];

      const [{ id: genreId }] = genres;

      [movies] = await connection.query(
        "SELECT m.title, m.year, m.director, m.duration, m.poster, m.rate, " +
          "BIN_TO_UUID(m.id, 0) AS id, GROUP_CONCAT(g.name SEPARATOR ', ') AS genres " +
          "FROM movie m " +
          "LEFT JOIN movie_genres mg ON m.id = mg.movie_id " +
          "LEFT JOIN genre g ON mg.genre_id = g.id " +
          "WHERE mg.genre_id = ? " +
          "GROUP BY mg.movie_id;",
        [genreId]
      );
    } else {
      [movies] = await connection.query(
        "SELECT m.title, m.year, m.director, m.duration, m.poster, m.rate, " +
          "BIN_TO_UUID(m.id, 0) AS id, GROUP_CONCAT(g.name SEPARATOR ', ') AS genres " +
          "FROM movie m " +
          "LEFT JOIN movie_genres mg ON m.id = mg.movie_id " +
          "LEFT JOIN genre g ON mg.genre_id = g.id " +
          "GROUP BY m.title;"
      );
    }

    return movies;
  }

  /**
   * Obtiene una película por su ID.
   * @param {Object} options - Opciones de búsqueda.
   * @param {string} options.id - ID de la película.
   * @returns {Promise<Object|null>} La película encontrada o null si no se encuentra.
   */
  static async getById({ id }) {
    const [movies] = await connection.query(
      "SELECT m.title, m.year, m.director, m.duration, m.poster, m.rate, " +
        "BIN_TO_UUID(m.id, 0) AS id, GROUP_CONCAT(g.name SEPARATOR ', ') AS genres " +
        "FROM movie m " +
        "LEFT JOIN movie_genres mg ON m.id = mg.movie_id " +
        "LEFT JOIN genre g ON mg.genre_id = g.id " +
        "WHERE m.id = UUID_TO_BIN(?, 0);",
      [id]
    );

    if (movies.length === 0 || movies[0].id === null) {
      return null;
    }

    return movies[0];
  }

  /**
   * Crea una nueva película.
   * @param {Object} options - Opciones de creación.
   * @param {Object} options.input - Datos de la nueva película.
   * @returns {Promise<Object>} La película creada.
   * @throws {Error} Si ocurre un error al crear la película.
   */
  static async create({ input }) {
    const {
      genre: genreInput,
      title,
      year,
      duration,
      director,
      rate,
      poster,
    } = input;

    const [uuidResult] = await connection.query("SELECT UUID() uuid;");
    const [uuid] = uuidResult;

    try {
      await connection.query(
        "INSERT INTO movie (id, title, year, director, duration, poster, rate) " +
          "VALUES (UUID_TO_BIN(?, 0), ?, ?, ?, ?, ?, ?);",
        [uuid.uuid, title, year, director, duration, poster, rate]
      );
    } catch (e) {
      throw new Error("Error creating a movie");
    }

    for (const genreName of genreInput) {
      const capitalizedGenreName =
        genreName.charAt(0).toUpperCase() + genreName.slice(1).toLowerCase();

      const [genres] = await connection.query(
        "SELECT id FROM genre WHERE name = ?;",
        [capitalizedGenreName]
      );

      if (genres.length > 0) {
        await connection.query(
          "INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?, 0), ?);",
          [uuid.uuid, genres[0].id]
        );
      }
    }
    const [movies] = await connection.query(
      "SELECT m.title, m.year, m.director, m.duration, m.poster, m.rate, " +
        "BIN_TO_UUID(m.id, 0) AS id, GROUP_CONCAT(g.name SEPARATOR ', ') AS genres " +
        "FROM movie m " +
        "LEFT JOIN movie_genres mg ON m.id = mg.movie_id " +
        "LEFT JOIN genre g ON mg.genre_id = g.id " +
        "WHERE m.id = UUID_TO_BIN(?, 0) " +
        "GROUP BY m.id;",
      [uuid.uuid]
    );

    return movies[0];
  }

  /**
   * Actualiza una película por su ID.
   * @param {Object} options - Opciones de actualización.
   * @param {string} options.id - ID de la película a actualizar.
   * @param {Object} options.input - Datos a actualizar.
   * @returns {Promise<Object|null>} La película actualizada o null si no se encuentra.
   */
  static async update({ id, input }) {
    const validFields = [
      "title",
      "year",
      "duration",
      "director",
      "rate",
      "poster",
    ];
    const fieldsToUpdate = Object.entries(input)
      .filter(([key]) => validFields.includes(key))
      .map(([key, value]) => ({ key, value }));

    if (fieldsToUpdate.length === 0) {
      return null;
    }

    const setClause = fieldsToUpdate
      .map((field) => `${field.key} = ?`)
      .join(", ");
    const values = fieldsToUpdate.map((field) => field.value);

    const query = `UPDATE movie SET ${setClause} WHERE id = UUID_TO_BIN(?, 0);`;
    values.push(id);

    try {
      await connection.query(query, values);
      const [updatedMovies] = await connection.query(
        "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id, 0) AS id " +
          "FROM movie WHERE id = UUID_TO_BIN(?, 0);",
        [id]
      );

      return updatedMovies.length > 0 ? updatedMovies[0] : null;
    } catch (error) {
      throw new Error("Error updating the movie");
    }
  }

  /**
   * Elimina una película por su ID.
   * @param {Object} options - Opciones de eliminación.
   * @param {string} options.id - ID de la película a eliminar.
   * @returns {Promise<boolean>} True si la película fue eliminada, false en caso contrario.
   */
  static async delete({ id }) {
    const result = await connection.query(
      "DELETE FROM movie WHERE id = UUID_TO_BIN(?, 0);",
      [id]
    );

    return result[0].affectedRows > 0;
  }
}
