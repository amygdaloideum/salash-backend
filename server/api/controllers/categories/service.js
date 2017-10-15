import logger from '../../../common/logger';
import driver from '../../../common/db-driver';

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
}

export default new CategoriesService();
