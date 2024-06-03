import cors from "cors";

const ACCEPTED_ORIGINS = [
  "http://127.0.0.1:5500",
  "http://127.0.0.1:5600",
  "http://127.0.0.1:5700",
];

/**
 * Intercepta la petición y procesa una lista de orígenes aceptados.
 * @param {Object} [options] Opciones para el middleware.
 * @param {Array<String>} [options.acceptedOrigins=ACCEPTED_ORIGINS] Orígenes aceptados.
 * @returns {Function} Middleware de CORS configurado.
 * @throws {Error} Si el origen de la petición no está permitido.
 * @author Leiber Bertel
 */
export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) =>
  cors({
    origin: (origin, callback) => {
      if (acceptedOrigins.includes(origin) || !origin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  });
