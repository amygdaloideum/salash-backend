import driver from '../db-driver';

export function isOwner(recipeId, userId) {
  const session = driver.session();
  return new Promise((resolve, reject) => {
    session.run(`
      MATCH (recipe:Recipe {id: {recipeId}})<-[:REGISTERED]-(user:User)
      RETURN user`, { recipeId })
      .then(dbResponse => {
        session.close();
        const recipeOwner = dbResponse.records[0].get('user').properties;
        if(recipeOwner.id == userId) {
          resolve();
        } else {
          reject();
        }
      }).catch(err => {
        reject('error fetching user from db');
      });
  });

}