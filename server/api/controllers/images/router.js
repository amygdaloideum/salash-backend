import * as express from 'express';
import cuid from 'cuid';
import authenticate from '../../../common/auth/middleware';
import multer from 'multer';
import cloudinary from 'cloudinary';
import logger from '../../../common/logger';
import driver from '../../../common/db-driver';

const upload = multer();

export default express
  .Router()
  .post('/', authenticate, upload.single('image'), (req, res) => {
    if (req.file) {
      cloudinary.uploader.upload_stream(result => handleResponse(result, req, res)).end(req.file.buffer);
    } else {
      return res.status(403).end();
    }
  });

function handleResponse(result, req, res) {
  if (!req.user || !req.user.id) {
    return res.status(401).end();
  }
  const thumbnailUrl = cloudinary.url(result.public_id, { format: 'jpg', width: 150, height: 150, crop: 'fill' });
  const session = driver.session();
  const params = {
    userId: req.user.id,
    id: cuid(),
    bytes: result.bytes,
    format: result.format,
    createdAt: result.created_at,
    height: result.height,
    cloudinaryId: result.public_id,
    secureUrl: result.secure_url,
    signature: result.signature,
    url: result.url,
    width: result.width,
    thumbnailUrl,
  };
  return session.run(`
    MATCH (user:User {id: {userId}})
    WITH user
    CREATE (image:Image {
      id: {id},
      bytes: {bytes},
      format: {format},
      createdAt: {createdAt},
      height: {height},
      cloudinaryId: {cloudinaryId},
      secureUrl: {secureUrl},
      url: {url},
      width: {width},
      thumbnailUrl: {thumbnailUrl}
    })<-[:HAS_IMAGE]-(user)
    RETURN image
    `, params)
    .then(dbResponse => {
      session.close();
      const responseData = dbResponse.records[0].get('image').properties;
      res.json(responseData);
    }).catch(err => {
      res.status(500).send('error saving image');
    });
}