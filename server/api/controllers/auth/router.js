import * as express from 'express';
import fetch from 'node-fetch';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';

export default express
  .Router()
  .get('/facebook', passport.authenticate('facebook', { session: false }), (req, res) => {
    return res.status(200).send(req.user);
  });
