import express, { json } from 'express';

import { createMovieRouter } from './routes/movies.js';
import { corsMiddleware } from './middlewares/cors.js';
import swaggerUi from 'swagger-ui-express';

import fs from 'fs';
const swaggerDocument = JSON.parse(fs.readFileSync('./openApiDocs.json', 'utf8'));

export const createApp = ({ movieModel }) => {
  const app = express();
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.disable('x-powered-by');
  app.use(json());
  app.use(corsMiddleware());

  app.use('/movies', createMovieRouter({ movieModel }));

  const PORT = process.env.PORT ?? 1234;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};
