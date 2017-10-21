import * as express from 'express';
import cuid from 'cuid';

export default express
  .Router()
  .get('/guid', (req, res) => {
    return res.status(200).send(cuid());
   });
