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

  byId(id, user) {
    logger.info(`${this.constructor.name}.byId(${id})`);
    const session = driver.session();
    const params = {
      recipeCuid: id,
      beholderCuid: user || null,
    };
    return session.run(`
      MATCH (recipe:Recipe {cuid: {recipeCuid}})
      WITH recipe
      MATCH (recipe)-[:IS]->(c:Category)
      WITH recipe, COLLECT({name: c.name}) as categories
      MATCH (recipe)-[a:CONTAINS]->(i:Ingredient)
      WITH recipe, categories, COLLECT({name: i.name, amount: a.amount}) as ingredients
      OPTIONAL MATCH (recipe)<-[reactions:REACTS {love: true}]-(:User)    
      OPTIONAL MATCH (recipe)<-[:AUTHORED]-(u:User)
      OPTIONAL MATCH (recipe)<-[reaction:REACTS]-(beholder:User {cuid: {beholderCuid}})
      RETURN recipe,
      {username: u.username, cuid: u.cuid} AS author,
      COUNT(reactions) AS loves,
      {love: reaction.love, favorite: reaction.favorite} AS interactions,
      ingredients,
      categories
    `, params)
    .then(res => {
      session.close();
      return { recipe: res.records.map(this.formatRecipeResponse)[0]};
    });
  }
}

export default new RecipesService();
