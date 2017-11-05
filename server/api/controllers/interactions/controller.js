import InteractionsService from './service';
import logger from '../../../common/logger';

const types = [
  'like',
  'save',
];

export class Controller {
  post(req, res) {
    if(!types.includes(req.params.type) || !req.params.id) {
      res.status(400).end();
    }
    InteractionsService.interact(req.params.type, req.params.id, req.user.id)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      }).catch(err => {
        logger.error(err);
        res.status(500).end();
      });
  }

  delete(req, res) {
    if(!types.includes(req.params.type) || !req.params.id) {
      res.status(400).end();
    }
    InteractionsService.unInteract(req.params.type, req.params.id, req.user.id)
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
