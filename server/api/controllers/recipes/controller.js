import RecipeService from './service';
import logger from '../../../common/logger';
import sanitizeHtml from 'sanitize-html';
import slug from 'limax';

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
    if (!req.user || !req.user.cuid) {
      return res.status(401).end();
    }

    const recipe = req.body;

    if (!recipe.title
      || (!recipe.ingredients && recipe.ingredients.length)
      || (!recipe.categories && recipe.categories.length)) {
      return res.status(403).end();
    }

    const instructionsHtmlConfig = {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'h1', 'h2' ])
    };

    const cleanedRecipe = {
      id: cuid(),
      title: sanitizeHtml(recipe.title),
      slug: slug(recipe.title.toLowerCase(), { lowercase: true }),
      description: sanitizeHtml(recipe.description),
      instructions: sanitizeHtml(recipe.instructions, instructionsHtmlConfig),
      youtubeUrl: recipe.youtubeUrl,
    };
  
    RecipeService
      .create(cleanedRecipe)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      }).catch(err => {
        logger.error(err);
        res.status(500).end();
      });
  }

  update(req, res) {

  }

  delete(req, res) {

  }


}
export default new Controller();
