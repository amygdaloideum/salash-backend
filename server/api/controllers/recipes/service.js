import logger from '../../../common/logger';
import driver from '../../../common/db-driver';

class RecipesService {

  formatRecipeResponse(record) {
    return {
      ...record.get('recipe').properties,
      ingredients: record.get('ingredients'),
      categories: record.get('categories'),
      author: record.get('author'),
      interactions: record.get('interactions'),
      loves: record.get('loves')
    };
  }

  create(recipe, user) {
    const standardIngredientsQuery = recipe.ingredients.map((entry, index) => 
    `MATCH  (i${index}:Ingredient { id: '${entry.ingredient.value}'})
    CREATE (recipe)-[:CONTAINS_INGREDIENT {amount: '${entry.amount}', unit: '${entry.unit}'}]->(i${index})`
    ).join('\n');

    const customIngredientsQuery = recipe.customIngredients.map((entry, index) => 
    `MERGE (ci${index}:CustomIngredient {id: '${entry.ingredient.value}'})
    ON CREATE SET ci${index}.name = '${entry.ingredient.label}'
    CREATE (user)-[:HAS_CUSTOM_INGREDIENT]->(ci${index})<-[:CONTAINS_CUSTOM_INGREDIENT {amount: '${entry.customAmount}'}]-(recipe)`
    ).join('\n');

    /*const categoriesQuery = recipe.categories.map((category, index) => `
      MERGE (c${index}:Category { name:'${category.name.toLowerCase()}'})
      MERGE (recipe)-[:IS]->(c${index})
    `).join('\n');*/

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
          id: {id}
        }),
        (user)-[:REGISTERED]->(recipe)
      WITH recipe, user
      ${standardIngredientsQuery}
      ${customIngredientsQuery}
    `, params)
      .then(res => {
        session.close();
        return { recipe: res };
      });
  }

  byId(id, user) {
    logger.info(`${this.constructor.name}.byId(${id})`);
    const session = driver.session();
    const params = {
      recipeId: id,
      beholderId: user || null,
    };
    return session.run(`
      MATCH (recipe:Recipe {id: {recipeId}})
      WITH recipe
      MATCH (recipe)-[:IS]->(c:Category)
      WITH recipe, COLLECT({name: c.name}) as categories
      MATCH (recipe)-[a:CONTAINS]->(i:Ingredient)
      WITH recipe, categories, COLLECT({name: i.name, amount: a.amount}) as ingredients
      OPTIONAL MATCH (recipe)<-[reactions:REACTS {love: true}]-(:User)    
      OPTIONAL MATCH (recipe)<-[:AUTHORED]-(u:User)
      OPTIONAL MATCH (recipe)<-[reaction:REACTS]-(beholder:User {id: {beholderId}})
      RETURN recipe,
      {username: u.username, id: u.id} AS author,
      COUNT(reactions) AS loves,
      {love: reaction.love, favorite: reaction.favorite} AS interactions,
      ingredients,
      categories
    `, params)
      .then(res => {
        session.close();
        return { recipe: res.records.map(this.formatRecipeResponse)[0] };
      });
  }
}

export default new RecipesService();
