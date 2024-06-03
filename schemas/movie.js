import z from "zod";

/**
 * Esquema de validación para una película usando Zod.
 * @const {ZodSchema}
 */
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5.5),
  poster: z.string().url({
    message: "Poster must be a valid URL",
  }),
  genre: z.array(
    z.enum([
      "Action",
      "Adventure",
      "Fantasy",
      "Drama",
      "Romance",
      "Sci-Fi",
      "Animation",
      "Crime",
    ]),
    {
      required_error: "Movie genre is required",
      invalid_type_error: "Movie genre must be an array of enum Genre",
    }
  ),
});

export { movieSchema };

/**
 * Valida un objeto contra el esquema completo de una película.
 *
 * @param {Object} object - El objeto a validar.
 * @returns {ZodSafeParseReturnType} El resultado de la validación.
 */
export function validateMovie(object) {
  return movieSchema.safeParse(object);
}

/**
 * Valida un objeto contra un esquema parcial de una película.
 *
 * @param {Object} object - El objeto a validar.
 * @returns {ZodSafeParseReturnType} El resultado de la validación.
 */
export function validatePartialMovie(object) {
  return movieSchema.partial().safeParse(object);
}
