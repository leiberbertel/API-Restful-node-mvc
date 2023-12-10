import cors from 'cors';

const ACCEPTED_ORIGINS = [
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5600',
  'http://127.0.0.1:5700'
];

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
  origin: (origin, callback) => {
    if (acceptedOrigins.includes(origin) || !origin) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  }
});
