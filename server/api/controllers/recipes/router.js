import * as express from 'express';
import controller from './controller';
import { authenticate, isOwnerOfRecipe, getUserFromToken } from '../../../common/auth/middleware';
import multer from 'multer';
const upload = multer();

export default express
  .Router()
  .get('/latest', getUserFromToken, controller.getLatest)
  .get('/:id', getUserFromToken, controller.byId)
  .post('/', authenticate, upload.single('image'), controller.create)
  .put('/:id', authenticate, isOwnerOfRecipe, controller.update)
  .delete('/:id', authenticate, isOwnerOfRecipe, controller.delete);