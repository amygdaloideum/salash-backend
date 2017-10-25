import IngredientsService from './service';
import logger from '../../../common/logger';

export class Controller {
  query(req, res) {
    IngredientsService.query(req.query.name)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      }).catch(err => {
        logger.error(err);
        res.status(500).end();
      });
  }

  get(req, res) {
    IngredientsService.get(req.params.id)
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
