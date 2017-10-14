import examplesRouter from './api/controllers/examples/router';
import recipesRouter from './api/controllers/recipes/router';

export default function routes(app) {
  app.use('/api/v1/examples', examplesRouter);
  app.use('/api/v1/recipes', recipesRouter);
}
