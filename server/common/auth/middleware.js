import jwt from 'jsonwebtoken';
import driver from '../db-driver';

export function authenticate (req, res, next){
  // check header or url parameters or post parameters for token
  const token = req.headers.authorization;
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.user = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

  }
}

export function hasGodMode (req, res, next){
  // check header or url parameters or post parameters for token
  const token = req.headers.authorization;
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        if(!(user.permissions && user.permissions.includes('godmode'))) {
          return res.status(403).send({
            success: false,
            message: 'You need godmode to access this endpoint.'
        });
        }
        // if everything is good, save to request for use in other routes
        req.user = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

  }
}

export function isOwnerOfRecipe(req, res, next) {
  if (!req.user || !req.user.id) {
    res.status(401).json({ message: 'permission denied', status: 401 }); 
  }
  if (!req.params.id) {
    res.status(400).send({ message: 'missing required params', status: 400 });
  }
  const recipeId = req.params.id;
  const userId = req.user.id;
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session.run(`
      MATCH (recipe:Recipe {id: {recipeId}})<-[:REGISTERED]-(user:User)
      RETURN user`, { recipeId })
      .then(dbResponse => {
        session.close();
        const recipeOwner = dbResponse.records[0].get('user').properties;
        if(recipeOwner.id == userId) {
          next();
        } else {
          res.status(401).send({ message: 'only the owner of the recipe may alter it', status: 401 });
        }
      }).catch(err => {
        res.status(500).send({ message: 'error getting recipe owner from database', status: 500 });
      });
  });

}