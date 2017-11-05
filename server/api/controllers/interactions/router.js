import * as express from 'express';
import controller from './controller';
import { authenticate } from '../../../common/auth/middleware';

export default express
  .Router()
  .post('/:type/:id', authenticate, controller.post)
  .delete('/:type/:id', authenticate, controller.delete)