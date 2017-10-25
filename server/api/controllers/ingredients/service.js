import logger from '../../../common/logger';
import driver from '../../../common/db-driver';
import cuid from 'cuid';
import slug from 'limax';

class IngredientsService {

  formatIngredients(records) {
    return records.map(record => record.get('category').properties);
  }

  query(name) {
    logger.info(`${this.constructor.name}.query()`);
    const session = driver.session();
    const params = { name };
    return session.run(`
      MATCH (i:Ingredient) WHERE LOWER(i.name) CONTAINS {name} RETURN i LIMIT 25
    `, params)
      .then(res => {
        session.close();
        return res.records.map(record => record.get('i').properties);
      });
  }

  get(id) {
    logger.info(`${this.constructor.name}.get()`);
    const session = driver.session();
    const params = { id };
    return session.run(`
    MATCH (i:Ingredient {id: {id}})-[:HAS_NUTRIENTS]->(r:Report) RETURN r
    `, params)
      .then(res => {
        session.close();
        const report = res.records.map(record => record.get('r').properties)[0]
        if(!report) {
          return null
        }
        return {
          ...report,
          data: JSON.parse(report.data),
        }
      });
  }
}

export default new IngredientsService();
