import examplesRouter from './api/controllers/examples/router';
import recipesRouter from './api/controllers/recipes/router';
import categoriesRouter from './api/controllers/categories/router';
import authRouter from './api/controllers/auth/router';
import utilsRouter from './api/controllers/utils/router';
import ingredientsRouter from './api/controllers/ingredients/router';
import imagesRouter from './api/controllers/images/router';
import usersRouter from './api/controllers/users/router';

export default function routes(app) {
  app.use('/api/v1/examples', examplesRouter);
  app.use('/api/v1/recipes', recipesRouter);
  app.use('/api/v1/categories', categoriesRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/utils', utilsRouter);
  app.use('/api/v1/ingredients', ingredientsRouter);
  app.use('/api/v1/images', imagesRouter);
  app.use('/api/v1/users', usersRouter);
}
