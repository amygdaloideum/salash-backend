import * as express from 'express';
import controller from './controller';
import authenticate from '../../../common/auth/middleware';

export default express
  .Router()
  .get('/:id', controller.byId)
  .post('/', authenticate, controller.create);