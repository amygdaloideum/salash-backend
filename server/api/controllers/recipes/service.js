import logger from '../../../common/logger';
import driver from '../../../common/db-driver';
import { queries, formatRecipeResponse } from './utils';
import ImagesService from '../images/service';

class RecipesService {

  create(recipe, user) {

    const standardIngredientsQuery = queries.standardIngredients(recipe);
    const customIngredientsQuery = queries.customIngredients(recipe);
    const categoriesQuery = queries.categories(recipe);
    const imageQuery = queries.image(recipe);

    const params = {
      id: recipe.id,
      createdAt: recipe.createdAt,
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description,
      instructions: recipe.instructions,
    };
    const session = driver.session();
    return session.run(`
      MATCH (user:User {id: '${user.id}'})
      CREATE
        (recipe:Recipe {
          title: {title},
          description: {description},
          instructions: {instructions},
          slug: {slug},
          createdAt: timestamp(),
          id: {id}
        }),
        (user)-[:REGISTERED]->(recipe)
      ${standardIngredientsQuery}
      ${customIngredientsQuery}
      ${categoriesQuery}
      ${imageQuery}
    `, params)
      .then(res => {
        session.close();
        return { recipe: res };
      });
  }

  update(id, recipe, user) {
    logger.info(`${this.constructor.name}.update(${id})`);
    const standardIngredientsQuery = queries.standardIngredients(recipe);
    const customIngredientsQuery = queries.customIngredients(recipe);
    const categoriesQuery = queries.categories(recipe);
    const imageQuery = queries.image(recipe);

    const params = {
      id,
      createdAt: recipe.createdAt,
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description,
      instructions: recipe.instructions,
    };
    const session = driver.session();
    return session.run(`
      MATCH (user:User {id: '${user.id}'})
      WITH user
      MATCH (recipe:Recipe {id: {id}})
      WITH user, recipe
      SET recipe.title = {title}
      SET recipe.description = {description}
      SET recipe.instructions = {instructions}
      SET recipe.slug = {slug}
      ${standardIngredientsQuery}
      ${customIngredientsQuery}
      ${categoriesQuery}
      ${imageQuery}
    `, params)
      .then(res => {
        session.close();
        return res.records.map(formatRecipeResponse)[0];
      });
  }

  delete(id) {
    logger.info(`${this.constructor.name}.delete(${id})`);
    const session = driver.session();
    const params = {
      recipeId: id,
    };
    return session.run(`
    MATCH (recipe:Recipe {id: {recipeId}})
    WITH recipe
    OPTIONAL MATCH (recipe)-[ci:CONTAINS_IMAGE]->(image:Image)
    WITH recipe, image, image.cloudinaryId as imageId
    DETACH DELETE recipe, image
    RETURN imageId
  `, params)
    .then(res => {
      session.close();
      return res.records[0] ? res.records[0].get('imageId') : null;
    })
    .then(imageId => {
      return ImagesService.deleteFromCloud(imageId);
    });
  }

  // Just delete all existing ingredients and categories before saving new ones
  deleteCatsAndIngredients(id) {
    logger.info(`${this.constructor.name}.deleteCatsAndIngredients(${id})`);
    const session = driver.session();
    const params = {
      recipeId: id,
    };
    return session.run(`
      MATCH (recipe:Recipe {id: {recipeId}})
      WITH recipe
      OPTIONAL MATCH (recipe)-[categoryRelation:HAS_CATEGORY]->(:Category)
      OPTIONAL MATCH (recipe)-[standardIngredientRelation:CONTAINS_INGREDIENT]->(:Ingredient)
      OPTIONAL MATCH (recipe)-[customIngredientRelation:CONTAINS_CUSTOM_INGREDIENT]->(customIngredient:CustomIngredient)
      DELETE categoryRelation, standardIngredientRelation, customIngredientRelation
    `, params)
      .then(res => {
        session.close();
        return {message: `categories and ingredients removed from recipe ${id}`};
      });
  }

  byId(id, user) {
    logger.info(`${this.constructor.name}.byId(${id})`);
    user && user.id ? logger.info(`Requested by user ${user.username}, id: ${user.id})`) : logger.info(`Requested by anonymous`);
    const session = driver.session();
    const params = {
      recipeId: id,
      beholderId: user ? user.id : null,
    };
    return session.run(`
      MATCH (recipe:Recipe {id: {recipeId}})
      WITH recipe
      MATCH (recipe)-[:HAS_CATEGORY]->(c:Category)
      WITH recipe, COLLECT(c) as categories
      OPTIONAL MATCH (recipe)-[a:CONTAINS_INGREDIENT]->(i:Ingredient)
      WITH recipe, categories, COLLECT({name: i.name, id: i.id, amount: a.amount, unit: a.unit}) as ingredients
      OPTIONAL MATCH (recipe)-[ca:CONTAINS_CUSTOM_INGREDIENT]->(ci:CustomIngredient)
      WITH recipe, categories, ingredients, COLLECT({name: ci.name, id: ci.id, amount: ca.amount}) as customIngredients
      OPTIONAL MATCH (recipe)<-[likes:LIKES]-(:User)    
      OPTIONAL MATCH (recipe)<-[:REGISTERED]-(u:User)
      OPTIONAL MATCH (recipe)-[:CONTAINS_IMAGE]->(img:Image)
      OPTIONAL MATCH (beholder:User {id: {beholderId}})
      RETURN recipe,
      {username: u.username, id: u.id} AS uploader,
      COUNT(likes) AS likes,
      {like: EXISTS( (recipe)<-[:LIKES]-(beholder) )} AS interactions,
      ingredients,
      customIngredients,
      categories,
      img
    `, params)
      .then(res => {
        session.close();
        return res.records.map(record => formatRecipeResponse(record, true))[0];
      });
  }

  getLatest() {
    logger.info(`${this.constructor.name}.getLatest()`);
    const session = driver.session();
    return session.run(`
      MATCH (recipe:Recipe)
      WITH recipe
      MATCH (recipe)-[:HAS_CATEGORY]->(c:Category)
      WITH recipe, COLLECT(c) as categories
      OPTIONAL MATCH (recipe)-[a:CONTAINS_INGREDIENT]->(i:Ingredient)
      WITH recipe, categories, COLLECT({name: i.name, id: i.id, amount: a.amount, unit: a.unit}) as ingredients
      OPTIONAL MATCH (recipe)-[ca:CONTAINS_CUSTOM_INGREDIENT]->(ci:CustomIngredient)
      WITH recipe, categories, ingredients, COLLECT({name: ci.name, id: ci.id, amount: ca.amount}) as customIngredients
      OPTIONAL MATCH (recipe)<-[reactions:LIKES]-(:User)    
      OPTIONAL MATCH (recipe)<-[:REGISTERED]-(u:User)
      OPTIONAL MATCH (recipe)-[:CONTAINS_IMAGE]->(img:Image)
      RETURN recipe,
      {username: u.username, id: u.id} AS uploader,
      COUNT(reactions) AS likes,
      ingredients,
      customIngredients,
      categories,
      img
      ORDER BY recipe.createdAt DESC
      LIMIT 15
    `)
      .then(res => {
        session.close();
        return res.records.map(formatRecipeResponse);
      });
  }

  searchRecipes(req, res) {
    const formattedQuery = formatQueryArray(req.query);
    const params = {
      ...formattedQuery,
      beholderCuid: req.user ? req.user.cuid : null
    };
    console.log(params);
    getSession(req).run(`
      MATCH (cat:Category) 
      WHERE cat.name IN {categories}
      WITH COLLECT(cat) as desiredCategories
      OPTIONAL MATCH (i:Ingredient)
      WHERE i.name IN {ingredients}
      WITH desiredCategories, COLLECT(i) as desiredIngredients
      MATCH (recipe:Recipe)
      WHERE ALL(
        category IN desiredCategories
        WHERE (recipe)-[:HAS_CATEGORY]->(category)
      )
      AND ALL(
        ingredient IN desiredIngredients
        WHERE (recipe)-[:CONTAINS_INGREDIENT]->(ingredient)
      )
      WITH recipe
      MATCH (recipe)-[:HAS_CATEGORY]->(c:Category)
      WITH recipe, COLLECT(c) as categories
      MATCH (recipe)-[a:CONTAINS_INGREDIENT]->(i:Ingredient)
      WITH recipe, categories, COLLECT({name: i.name, id: i.id, amount: a.amount, unit: a.unit}) as ingredients
      OPTIONAL MATCH (recipe)<-[reactions:REACTS {love: true}]-(:User)
      OPTIONAL MATCH (recipe)<-[:AUTHORED]-(u:User)
      OPTIONAL MATCH (recipe)<-[reaction:REACTS]-(beholder:User {cuid: {beholderCuid}})
      RETURN recipe,
      {username: u.username, cuid: u.cuid} AS author,
      COUNT(reactions) AS loves,
      {love: reaction.love, favorite: reaction.favorite} AS interactions,
      ingredients,
      categories
      ORDER BY loves DESC
      LIMIT 15
    `, params).then(results => res.json({ recipes: results.records.map(formatRecipeResponse)}));
  }
}

export default new RecipesService();
