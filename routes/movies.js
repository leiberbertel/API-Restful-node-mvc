import { Router } from "express";
import { MovieController } from "../controllers/movie.js";

/**
 * Crea un enrutador para manejar las rutas relacionadas con las películas.
 *
 * @param {Object} options - Opciones para el enrutador.
 * @param {Object} options.movieModel - El modelo de datos para las películas.
 * @returns {Router} El enrutador configurado para las películas.
 */
export const createMovieRouter = ({ movieModel }) => {
  const moviesRouter = Router();
  const movieController = new MovieController({ movieModel });

  /**
   * Ruta para obtener todas las películas.
   * @name get/
   * @function
   * @memberof module:routers/moviesRouter
   * @inner
   * @param {Request} req - Objeto de solicitud.
   * @param {Response} res - Objeto de respuesta.
   */
  moviesRouter.get("/", movieController.getAll);

  /**
   * Ruta para crear una nueva película.
   * @name post/
   * @function
   * @memberof module:routers/moviesRouter
   * @inner
   * @param {Request} req - Objeto de solicitud.
   * @param {Response} res - Objeto de respuesta.
   */
  moviesRouter.post("/", movieController.create);

  /**
   * Ruta para obtener una película por su ID.
   * @name get/:id
   * @function
   * @memberof module:routers/moviesRouter
   * @inner
   * @param {Request} req - Objeto de solicitud.
   * @param {Response} res - Objeto de respuesta.
   */
  moviesRouter.get("/:id", movieController.getById);

  /**
   * Ruta para eliminar una película por su ID.
   * @name delete/:id
   * @function
   * @memberof module:routers/moviesRouter
   * @inner
   * @param {Request} req - Objeto de solicitud.
   * @param {Response} res - Objeto de respuesta.
   */
  moviesRouter.delete("/:id", movieController.delete);

  /**
   * Ruta para actualizar parcialmente una película por su ID.
   * @name patch/:id
   * @function
   * @memberof module:routers/moviesRouter
   * @inner
   * @param {Request} req - Objeto de solicitud.
   * @param {Response} res - Objeto de respuesta.
   */
  moviesRouter.patch("/:id", movieController.update);

  return moviesRouter;
};
