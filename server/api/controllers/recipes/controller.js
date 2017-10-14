import RecipeService from './service';
import logger from '../../../common/logger';

export class Controller {

  query(req, res) {

  }

  byId(req, res) {
    RecipeService
      .byId(req.params.id)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      }).catch(err => {
        logger.error(err);
        res.status(500).end();
      });
  }

  create(req, res) {

  }

  update(req, res) {
    
  }

  delete(req, res) {

  }

  
}
export default new Controller();
