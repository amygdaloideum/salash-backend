import * as express from 'express';
import fetch from 'node-fetch';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import logger from '../../../common/logger';

export default express
  .Router()
  .get('/facebook', passport.authenticate('facebook', { session: false }), (req, res) => {
    logger.info(`granted token to user ${req.user.user.username}`);
    return res.status(200).send(req.user);
  });
