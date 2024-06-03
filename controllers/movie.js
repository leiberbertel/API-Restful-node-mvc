import { validateMovie, validatePartialMovie } from "../schemas/movie.js";

/**
 * Controlador para manejar las operaciones relacionadas con las películas.
 */
export class MovieController {
  /**
   * Crea una instancia de MovieController.
   * @param {Object} options - Opciones para el controlador.
   * @param {Object} options.movieModel - El modelo de datos para las películas.
   */
  constructor({ movieModel }) {
    this.movieModel = movieModel;
  }

  /**
   * Obtiene todas las películas, opcionalmente filtradas por género.
   * @param {Object} req - Objeto de solicitud.
   * @param {Object} res - Objeto de respuesta.
   * @returns {Promise<void>} La lista de películas en formato JSON.
   */
  getAll = async (req, res) => {
    const { genre } = req.query;
    const movies = await this.movieModel.getAll({ genre });

    res.json(movies);
  };

  /**
   * Obtiene una película por su ID.
   * @param {Object} req - Objeto de solicitud.
   * @param {Object} res - Objeto de respuesta.
   * @returns {Promise<void>} La película encontrada en formato JSON o un mensaje de error si no se encuentra.
   */
  getById = async (req, res) => {
    const { id } = req.params;
    const movie = await this.movieModel.getById({ id });
    if (movie) return res.json(movie);

    res.status(404).json({ message: "Movie not found" });
  };

  /**
   * Crea una nueva película.
   * @param {Object} req - Objeto de solicitud.
   * @param {Object} res - Objeto de respuesta.
   * @returns {Promise<void>} La película creada en formato JSON o un mensaje de error si la validación falla.
   */
  create = async (req, res) => {
    const result = validateMovie(req.body);

    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const newMovie = await this.movieModel.create({ input: result.data });

    res.status(201).json(newMovie);
  };

  /**
   * Elimina una película por su ID.
   * @param {Object} req - Objeto de solicitud.
   * @param {Object} res - Objeto de respuesta.
   * @returns {Promise<void>} Un mensaje de confirmación de eliminación o un mensaje de error si no se encuentra la película.
   */
  delete = async (req, res) => {
    const { id } = req.params;

    const wasDeleted = await this.movieModel.delete({ id });

    if (!wasDeleted) {
      return res.status(404).json({ message: "Movie not found" });
    }

    return res.json({ message: "Movie deleted" });
  };

  /**
   * Actualiza una película por su ID.
   * @param {Object} req - Objeto de solicitud.
   * @param {Object} res - Objeto de respuesta.
   * @returns {Promise<void>} La película actualizada en formato JSON o un mensaje de error si la validación falla o no se encuentra la película.
   */
  update = async (req, res) => {
    const result = validatePartialMovie(req.body);

    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const { id } = req.params;
    const updatedMovie = await this.movieModel.update({
      id,
      input: result.data,
    });

    if (updatedMovie === null) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.json(updatedMovie);
  };
}
