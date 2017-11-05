import logger from '../../../common/logger';
import driver from '../../../common/db-driver';
import cuid from 'cuid';
import slug from 'limax';

class UsersService {

  formatUser(records) {
    return {
      ...records[0].get('user').properties,
      recipes: records.map(record => record.get('recipe')),
    }
  }

  get(id) {
    logger.info(`${this.constructor.name}.get()`);
    const session = driver.session();
    return session.run(`
      MATCH (user:User {id: {id}})
      WITH user
      OPTIONAL MATCH (user)-[:REGISTERED]->(recipe:Recipe)
      RETURN DISTINCT user, {title: recipe.title, id: recipe.id} AS recipe
    `, { id })
      .then(res => {
        session.close();
        return this.formatUser(res.records);
      });
  }
}

export default new UsersService();
