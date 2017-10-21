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

  create(recipe) {
    const ingredientsQuery = recipe.ingredients.map((ingredient, index) => `
      MERGE (i${index}:Ingredient { name:'${ingredient.name.toLowerCase()}'})
      MERGE (recipe)-[:CONTAINS {amount: '${ingredient.amount}'}]->(i${index})
    `).join('\n');

    const categoriesQuery = recipe.categories.map((category, index) => `
      MERGE (c${index}:Category { name:'${category.name.toLowerCase()}'})
      MERGE (recipe)-[:IS]->(c${index})
    `).join('\n');

    return session.run(`
      MATCH (user:User {id: '${req.user.id}'})
      CREATE
        (recipe:Recipe {
          title: {title},
          description: {description},
          instructions: {instructions},
          slug: {slug},
          id: {id}
        }),
        (user)-[:REGISTERED]->(recipe)
    ${ingredientsQuery}
    ${categoriesQuery}
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
