import CategoriesService from './service';
import logger from '../../../common/logger';

export class Controller {
  all(req, res) {
    CategoriesService.all()
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      }).catch(err => {
        logger.error(err);
        res.status(500).end();
      });
  }

  create(req, res) {
    CategoriesService.create(req.query.name)
    .then(r => {
      if (r) res.json(r);
      else res.status(404).end();
    }).catch(err => {
      logger.error(err);
      res.status(500).end();
    });
  }
}
export default new Controller();
