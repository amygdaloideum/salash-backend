import * as express from 'express';
import controller from './controller';
import { authenticate, isOwnerOfRecipe } from '../../../common/auth/middleware';
import multer from 'multer';
const upload = multer();

export default express
  .Router()
  .get('/latest', controller.getLatest)
  .get('/:id', controller.byId)
  .post('/', authenticate, upload.single('image'), controller.create)
  .put('/:id', authenticate, isOwnerOfRecipe, controller.update)
  .delete('/:id', authenticate, isOwnerOfRecipe, controller.delete);