import * as express from 'express';
import controller from './controller';
import { hasGodMode } from '../../../common/auth/middleware';

export default express
  .Router()
  .get('/', controller.all)
  .post('/', hasGodMode, controller.create);
