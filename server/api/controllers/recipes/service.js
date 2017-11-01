import logger from '../../../common/logger';
import driver from '../../../common/db-driver';

class RecipesService {

  formatRecipeResponse(record) {
    const image = record.get('img');
    const formatted = {
      ...record.get('recipe').properties,
      ingredients: record.get('ingredients'),
      customIngredients: record.get('customIngredients'),
      categories: record.get('categories').map(c => c.properties),
      uploader: record.get('uploader'),
      loves: record.get('loves'),
      image: image ? image.properties : null,
    };

    if(formatted.customIngredients.length === 1 && formatted.customIngredients[0].id === null){
      formatted.customIngredients = [];
    }
    if(formatted.ingredients.length === 1 && formatted.ingredients[0].id === null){
      formatted.ingredients = [];
    }

    return formatted;
  }

  create(recipe, user) {
    const standardIngredientsQuery = recipe.ingredients.map((entry, index) => `
      WITH recipe, user
      MATCH  (i${index}:Ingredient { id: '${entry.ingredient.value}'})
      CREATE (recipe)-[:CONTAINS_INGREDIENT {amount: '${entry.amount}', unit: '${entry.unit}'}]->(i${index})
    `).join('\n');

    const customIngredientsQuery = recipe.customIngredients.map((entry, index) => `
      WITH recipe, user
      MERGE (ci${index}:CustomIngredient {id: '${entry.ingredient.value}'})
      ON CREATE SET ci${index}.name = '${entry.ingredient.label}'
      CREATE (user)-[:HAS_CUSTOM_INGREDIENT]->(ci${index})<-[:CONTAINS_CUSTOM_INGREDIENT {amount: '${entry.customAmount}'}]-(recipe)
    `).join('\n');

    const categoriesQuery = recipe.categories.map((category, index) => `
      WITH recipe, user
      MATCH (c${index}:Category { id:'${category.id}'})
      MERGE (recipe)-[:HAS_CATEGORY]->(c${index})
    `).join('\n');

    const imageQuery = (recipe.image && recipe.image.id) ? `
      WITH recipe, user
      MATCH (img:Image {id: '${recipe.image.id}'})
      CREATE (recipe)-[:CONTAINS_IMAGE]->(img)
    ` : '';

    const params = {
      id: recipe.id,
      createdAt: recipe.createdAt,
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description,
      instructions: recipe.instructions,
      //thumbnailUrl: hasImage ? recipe.image.thumbnailUrl : '',
      //image: recipe.image,
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

  byId(id, user) {
    logger.info(`${this.constructor.name}.byId(${id})`);
    user && user.id ? logger.info(`Requested by user ${user.username}, id: ${user.id})`) : logger.info(`Requested by anonymous)`);
    const session = driver.session();
    const params = {
      recipeId: id,
      beholderId: user || null,
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
      OPTIONAL MATCH (recipe)<-[reactions:REACTS {love: true}]-(:User)    
      OPTIONAL MATCH (recipe)<-[:REGISTERED]-(u:User)
      OPTIONAL MATCH (recipe)-[:CONTAINS_IMAGE]->(img:Image)
      RETURN recipe,
      {username: u.username, id: u.id} AS uploader,
      COUNT(reactions) AS loves,
      ingredients,
      customIngredients,
      categories,
      img
    `, params)
      .then(res => {
        session.close();
        return res.records.map(this.formatRecipeResponse)[0];
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
      OPTIONAL MATCH (recipe)<-[reactions:REACTS {love: true}]-(:User)    
      OPTIONAL MATCH (recipe)<-[:REGISTERED]-(u:User)
      OPTIONAL MATCH (recipe)-[:CONTAINS_IMAGE]->(img:Image)
      RETURN recipe,
      {username: u.username, id: u.id} AS uploader,
      COUNT(reactions) AS loves,
      ingredients,
      customIngredients,
      categories,
      img
      ORDER BY recipe.createdAt DESC
      LIMIT 15
    `)
      .then(res => {
        session.close();
        return res.records.map(this.formatRecipeResponse);
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
