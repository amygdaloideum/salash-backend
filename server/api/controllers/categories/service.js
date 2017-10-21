import logger from '../../../common/logger';
import driver from '../../../common/db-driver';
import cuid from 'cuid';
import slug from 'limax';

class CategoriesService {

  formatCategories(records) {
    return records.map(record => record.get('category').properties);
  }

  all() {
    logger.info(`${this.constructor.name}.all()`);
    const session = driver.session();
    return session.run(`MATCH (category:Category) RETURN category`)
    .then(res => {
      session.close();
      return { categories: this.formatCategories(res.records) };
    });
  }

  create(name) {
    logger.info(`${this.constructor.name}.create()`);
    const session = driver.session();
    const params = {
      id: cuid(),
      name,
      slug: slug(name),
    };
    return session.run(`CREATE (category:Category {id: {id}, name: {name}, slug: {slug}}) RETURN category`, params)
    .then(res => {
      session.close();
      return res.records.get('category');
    });
  }
}

export default new CategoriesService();
