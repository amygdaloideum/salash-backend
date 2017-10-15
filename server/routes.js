import examplesRouter from './api/controllers/examples/router';
import recipesRouter from './api/controllers/recipes/router';
import categoriesRouter from './api/controllers/categories/router';
import authRouter from './api/controllers/auth/router';

export default function routes(app) {
  app.use('/api/v1/examples', examplesRouter);
  app.use('/api/v1/recipes', recipesRouter);
  app.use('/api/v1/categories', categoriesRouter);
  app.use('/api/v1/auth', authRouter);
}
