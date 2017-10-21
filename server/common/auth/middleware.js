import jwt from 'jsonwebtoken';

export default function isAuthenticated (req, res, next){
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