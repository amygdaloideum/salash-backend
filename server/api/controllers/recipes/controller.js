import RecipeService from './service';
import logger from '../../../common/logger';
import cloudinary from 'cloudinary';
import { validateRecipeWriteRequest, cleanRecipeWriteData } from './utils';

export class Controller {

  query(req, res) {

  }

  byId(req, res) {
    RecipeService
      .byId(req.params.id, req.user)
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      }).catch(err => {
        logger.error(err);
        res.status(500).end();
      });
  }

  getLatest(req, res) {
    RecipeService
      .getLatest()
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      }).catch(err => {
        logger.error(err);
        res.status(500).end();
      });
  }

  create(req, res) {
    const validation = validateRecipeWriteRequest(req);
    if (validation.status !== 200) {
      return res.status(validation.status).json(validation);
    }

    const recipe = req.body;
    const hasImage = recipe.image && recipe.image.id;

    const cleanedRecipe = cleanRecipeWriteData(recipe);

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
    const validation = validateRecipeWriteRequest(req);
    if (validation.status !== 200) {
      return res.status(validation.status).json(validation);
    }
    const recipeId = req.params.id;
    const recipe = req.body;
    const cleanedRecipe = cleanRecipeWriteData(recipe);
    RecipeService.deleteCatsAndIngredients(recipeId)
      .then(() => RecipeService.update(recipeId, cleanedRecipe, req.user))
      .then(r => {
        if (r) res.json(r);
        else res.status(404).end();
      }).catch(err => {
        logger.error(err);
        res.status(500).end();
      });
  }

  delete(req, res) {
    const recipeId = req.params.id;
    RecipeService.delete(recipeId)
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
