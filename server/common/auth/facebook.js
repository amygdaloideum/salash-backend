import * as express from 'express';
import cuid from 'cuid';
import jwt from 'jsonwebtoken';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import driver from '../../common/db-driver';

const facebookConfig = {
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_REDIRECT_URL,
};

const signToken = (user, secret) => jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '24h' });

export default new FacebookStrategy(facebookConfig, (accessToken, refreshToken, profile, done) => {
  const session = driver.session();
  process.nextTick(() => {
    session.run(`
      MERGE (u:User {facebookId: "${profile.id}"})
      ON CREATE SET u.id = "${cuid()}"        
      ON CREATE SET u.facebookName = "${profile.displayName}"
      ON CREATE SET u.facebookToken = "${accessToken}"
      ON CREATE SET u.username = "${profile.displayName}"
      RETURN u
    `).then(response => {
        const user = response.records[0].get('u').properties;
        const token = signToken(user, process.env.JWT_SECRET);
        return done(null, { user, token });
      });
  });
});
