import logger from '../../../common/logger';
import driver from '../../../common/db-driver';

const typeMap = {
  'like': 'LIKES',
  'save': 'SAVED',
}

class IngredientsService {

  formatIngredients(records) {
    return records.map(record => record.get('category').properties);
  }

  interact(type, recipeId, userId) {
    logger.info(`${this.constructor.name}.interact(${type}, ${recipeId}, ${userId})`);
    const session = driver.session();
    const query = `
      MATCH (user:User {id: { userId }}), (recipe:Recipe {id: { recipeId }})
      MERGE (user)-[:${typeMap[type]}]->(recipe)
    `;
    return session.run(query, { recipeId, userId })
      .then(res => {
        session.close();
        return { message: 'interaction with recipe persisted successfully'};
      });
  }

  unInteract(type, recipeId, userId) {
    logger.info(`${this.constructor.name}.unInteract(${type}, ${recipeId}, ${userId})`);
    const session = driver.session();
    const query = `
      MATCH (user:User {id: { userId }}), (recipe:Recipe {id: { recipeId }})
      WITH user, recipe
      OPTIONAL MATCH (user)-[interaction:${typeMap[type]}]->(recipe)
      DELETE interaction
    `;
    return session.run(query, { recipeId, userId })
      .then(res => {
        session.close();
        return { message: 'interaction with recipe deleted successfully'};
      });
  }
}

export default new IngredientsService();
