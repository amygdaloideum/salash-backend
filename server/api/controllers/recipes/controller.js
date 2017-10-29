import RecipeService from './service';
import logger from '../../../common/logger';
import sanitizeHtml from 'sanitize-html';
import slug from 'limax';
import cuid from 'cuid';
import cloudinary from 'cloudinary';

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
    if (!req.user || !req.user.id) {
      return res.status(401).end();
    }

    const recipe = req.body;
    const hasImage = recipe.image && recipe.image.id;

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
      createdAt: Date.now(),
      title: sanitizeHtml(recipe.title),
      slug: slug(recipe.title.toLowerCase(), { lowercase: true }),
      description: sanitizeHtml(recipe.description),
      instructions: sanitizeHtml(recipe.instructions, instructionsHtmlConfig),
      categories: recipe.categories,
      ingredients: recipe.ingredients.filter(i => !i.custom),
      customIngredients: recipe.ingredients.filter(i => i.custom),
      thumbnailUrl: hasImage ? recipe.image.thumbnailUrl : '',
      image: recipe.image,
    };
    //res.status(200).end();
    RecipeService
      .create(cleanedRecipe, req.user)
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
