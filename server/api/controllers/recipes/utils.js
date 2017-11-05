import sanitizeHtml from 'sanitize-html';
import slug from 'limax';
import cuid from 'cuid';

const instructionsHtmlConfig = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2'])
};

const standardIngredients = (recipe) => recipe.ingredients.map((entry, index) => `
  WITH recipe, user
  MATCH  (i${index}:Ingredient { id: '${entry.ingredient.value}'})
  CREATE (recipe)-[:CONTAINS_INGREDIENT {amount: '${entry.amount}', unit: '${entry.unit}'}]->(i${index})
`).join('\n');

const customIngredients = (recipe) => recipe.customIngredients.map((entry, index) => `
  WITH recipe, user
  MERGE (ci${index}:CustomIngredient {id: '${entry.ingredient.value}'})
  ON CREATE SET ci${index}.name = '${entry.ingredient.label}'
  MERGE (user)-[hci:HAS_CUSTOM_INGREDIENT]->(ci${index})
  MERGE (ci${index})<-[:CONTAINS_CUSTOM_INGREDIENT {amount: '${entry.customAmount}'}]-(recipe)
`).join('\n');

const categories = (recipe) => recipe.categories.map((category, index) => `
  WITH recipe, user
  MATCH (c${index}:Category { id:'${category.id}'})
  MERGE (recipe)-[:HAS_CATEGORY]->(c${index})
`).join('\n');

const image = (recipe) => (recipe.image && recipe.image.id) ? `
  WITH recipe, user
  MATCH (img:Image {id: '${recipe.image.id}'})
  CREATE (recipe)-[:CONTAINS_IMAGE]->(img)
` : '';

export const queries = {
  standardIngredients,
  customIngredients,
  categories,
  image,
};


export function validateRecipeWriteRequest(req) {
  if (!req.user || !req.user.id) {
    return { message: 'permission denied', status: 401 }
  }

  const recipe = req.body;

  if (!recipe.title
    || (!recipe.ingredients && recipe.ingredients.length)
    || (!recipe.categories && recipe.categories.length)) {
    return { message: 'missing required params', status: 400 }
  }

  return { message: 'recipe is valid', status: 200 };
}


export function cleanRecipeWriteData(recipe) {
  return {
    id: cuid(),
    createdAt: Date.now(),
    title: sanitizeHtml(recipe.title),
    slug: slug(recipe.title.toLowerCase(), { lowercase: true }),
    description: sanitizeHtml(recipe.description),
    instructions: sanitizeHtml(recipe.instructions, instructionsHtmlConfig),
    categories: recipe.categories,
    ingredients: recipe.ingredients.filter(i => !i.custom),
    customIngredients: recipe.ingredients.filter(i => i.custom),
    image: recipe.image,
  };
}

export function formatRecipeResponse(record) {
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