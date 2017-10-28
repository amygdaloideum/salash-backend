import * as express from 'express';
import controller from './controller';
import authenticate from '../../../common/auth/middleware';
import multer from 'multer';
const upload = multer();

export default express
  .Router()
  .get('/:id', controller.byId)
  .post('/', authenticate, upload.single('image'), controller.create);