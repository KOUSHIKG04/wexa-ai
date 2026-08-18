import dotenv from "dotenv";
import neo4j from "neo4j-driver";

dotenv.config({ path: ".env.local" });

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error(
    "Missing COGNODB_URI, COGNODB_USERNAME, or COGNODB_PASSWORD in .env.local",
  );
}

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password),
  {
    maxConnectionPoolSize: 5,
    maxTransactionRetryTime: 5_000,
  },
);

type IngredientSeed = {
  id: string;
  name: string;
  allergen: string | null;
};

type RecipeIngredientSeed = readonly [
  ingredientId: string,
  quantity: string,
  unit: string,
  optional: boolean,
];

type RecipeSeed = {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prepMinutes: number;
  cuisine: string;
  ingredients: readonly RecipeIngredientSeed[];
};

type SubstitutionSeed = readonly [
  replacementId: string,
  originalId: string,
  notes: string,
];

const allergens = [
  { id: "peanut", name: "Peanut" },
  { id: "dairy", name: "Dairy" },
  { id: "gluten", name: "Gluten" },
  { id: "egg", name: "Egg" },
  { id: "soy", name: "Soy" },
  { id: "shellfish", name: "Shellfish" },
  { id: "sesame", name: "Sesame" },
  { id: "tree-nut", name: "Tree Nut" },
] as const;

const cuisines = [
  { id: "thai", name: "Thai" },
  { id: "italian", name: "Italian" },
  { id: "indian", name: "Indian" },
  { id: "mexican", name: "Mexican" },
  { id: "mediterranean", name: "Mediterranean" },
] as const;

const ingredients = [
  { id: "rice-noodles", name: "Rice Noodles", allergen: null },
  { id: "peanuts", name: "Peanuts", allergen: "peanut" },
  { id: "peanut-butter", name: "Peanut Butter", allergen: "peanut" },
  { id: "sunflower-butter", name: "Sunflower Butter", allergen: null },
  { id: "sunflower-seeds", name: "Sunflower Seeds", allergen: null },
  { id: "shrimp", name: "Shrimp", allergen: "shellfish" },
  { id: "tofu", name: "Tofu", allergen: "soy" },
  { id: "chickpeas", name: "Chickpeas", allergen: null },
  { id: "soy-sauce", name: "Soy Sauce", allergen: "soy" },
  { id: "coconut-aminos", name: "Coconut Aminos", allergen: null },
  { id: "sesame-oil", name: "Sesame Oil", allergen: "sesame" },
  { id: "olive-oil", name: "Olive Oil", allergen: null },
  { id: "wheat-pasta", name: "Wheat Pasta", allergen: "gluten" },
  { id: "tomato", name: "Tomato", allergen: null },
  { id: "parmesan", name: "Parmesan", allergen: "dairy" },
  { id: "nutritional-yeast", name: "Nutritional Yeast", allergen: null },
  { id: "milk", name: "Milk", allergen: "dairy" },
  { id: "oat-milk", name: "Oat Milk", allergen: null },
  { id: "egg", name: "Egg", allergen: "egg" },
  { id: "flax-egg", name: "Flax Egg", allergen: null },
  { id: "butter", name: "Butter", allergen: "dairy" },
  { id: "avocado", name: "Avocado", allergen: null },
  { id: "black-beans", name: "Black Beans", allergen: null },
  { id: "corn-tortilla", name: "Corn Tortilla", allergen: null },
  { id: "wheat-tortilla", name: "Wheat Tortilla", allergen: "gluten" },
  { id: "paneer", name: "Paneer", allergen: "dairy" },
  { id: "potato", name: "Potato", allergen: null },
  { id: "spinach", name: "Spinach", allergen: null },
  { id: "coconut-milk", name: "Coconut Milk", allergen: null },
  { id: "garlic", name: "Garlic", allergen: null },
  { id: "onion", name: "Onion", allergen: null },
] satisfies readonly IngredientSeed[];

const recipes = [
  {
    id: "pad-thai",
    name: "Classic Pad Thai",
    description: "Rice noodles with shrimp, peanuts and a savory sauce.",
    difficulty: "Medium",
    prepMinutes: 35,
    cuisine: "thai",
    ingredients: [
      ["rice-noodles", "200", "g", false],
      ["shrimp", "150", "g", false],
      ["peanuts", "40", "g", false],
      ["soy-sauce", "2", "tbsp", false],
      ["egg", "1", "piece", false],
    ],
  },
  {
    id: "vegan-pad-thai",
    name: "Vegan Pad Thai",
    description: "A plant-based noodle dish with chickpeas and coconut aminos.",
    difficulty: "Easy",
    prepMinutes: 25,
    cuisine: "thai",
    ingredients: [
      ["rice-noodles", "200", "g", false],
      ["chickpeas", "150", "g", false],
      ["coconut-aminos", "2", "tbsp", false],
      ["sunflower-seeds", "30", "g", true],
    ],
  },
  {
    id: "tomato-pasta",
    name: "Tomato Parmesan Pasta",
    description: "A simple Italian pasta with tomato and parmesan.",
    difficulty: "Easy",
    prepMinutes: 25,
    cuisine: "italian",
    ingredients: [
      ["wheat-pasta", "200", "g", false],
      ["tomato", "3", "pieces", false],
      ["parmesan", "50", "g", false],
      ["olive-oil", "1", "tbsp", false],
      ["garlic", "2", "cloves", false],
    ],
  },
  {
    id: "creamy-spinach-pasta",
    name: "Creamy Spinach Pasta",
    description: "Creamy pasta with spinach, milk and butter.",
    difficulty: "Medium",
    prepMinutes: 30,
    cuisine: "italian",
    ingredients: [
      ["wheat-pasta", "200", "g", false],
      ["spinach", "100", "g", false],
      ["milk", "150", "ml", false],
      ["butter", "1", "tbsp", false],
    ],
  },
  {
    id: "paneer-curry",
    name: "Spinach Paneer Curry",
    description: "Paneer cooked in a flavorful spinach sauce.",
    difficulty: "Medium",
    prepMinutes: 40,
    cuisine: "indian",
    ingredients: [
      ["paneer", "200", "g", false],
      ["spinach", "200", "g", false],
      ["onion", "1", "piece", false],
      ["garlic", "3", "cloves", false],
      ["butter", "1", "tbsp", true],
    ],
  },
  {
    id: "potato-coconut-curry",
    name: "Potato Coconut Curry",
    description: "A dairy-free curry with potato and coconut milk.",
    difficulty: "Easy",
    prepMinutes: 35,
    cuisine: "indian",
    ingredients: [
      ["potato", "3", "pieces", false],
      ["coconut-milk", "250", "ml", false],
      ["spinach", "100", "g", true],
      ["onion", "1", "piece", false],
    ],
  },
  {
    id: "black-bean-tacos",
    name: "Black Bean Tacos",
    description: "Corn tacos filled with black beans and avocado.",
    difficulty: "Easy",
    prepMinutes: 20,
    cuisine: "mexican",
    ingredients: [
      ["corn-tortilla", "6", "pieces", false],
      ["black-beans", "200", "g", false],
      ["avocado", "1", "piece", false],
      ["tomato", "2", "pieces", false],
    ],
  },
  {
    id: "breakfast-wrap",
    name: "Breakfast Egg Wrap",
    description: "A wheat wrap filled with egg and avocado.",
    difficulty: "Easy",
    prepMinutes: 15,
    cuisine: "mexican",
    ingredients: [
      ["wheat-tortilla", "1", "piece", false],
      ["egg", "2", "pieces", false],
      ["avocado", "1", "piece", false],
      ["butter", "1", "tsp", false],
    ],
  },
] satisfies readonly RecipeSeed[];

const substitutions = [
  ["sunflower-butter", "peanut-butter", "Nut-free spread alternative"],
  ["sunflower-seeds", "sunflower-butter", "Crunchy seed alternative"],
  ["chickpeas", "peanuts", "Roasted chickpeas provide crunch"],
  ["tofu", "shrimp", "Plant-based protein replacement"],
  ["chickpeas", "tofu", "Soy-free plant protein"],
  ["coconut-aminos", "soy-sauce", "Soy-free savory seasoning"],
  ["olive-oil", "sesame-oil", "Sesame-free cooking oil"],
  ["rice-noodles", "wheat-pasta", "Gluten-free noodle replacement"],
  ["nutritional-yeast", "parmesan", "Dairy-free savory topping"],
  ["oat-milk", "milk", "Dairy-free milk replacement"],
  ["flax-egg", "egg", "Plant-based egg replacement"],
  ["olive-oil", "butter", "Dairy-free cooking fat"],
  ["tofu", "paneer", "Plant-based paneer replacement"],
  ["corn-tortilla", "wheat-tortilla", "Gluten-free wrap replacement"],
] satisfies readonly SubstitutionSeed[];

function assertUniqueIds(label: string, ids: readonly string[]): void {
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    throw new Error(`${label} contains duplicate IDs: ${[...new Set(duplicates)].join(", ")}`);
  }
}

function validateSeedData(): void {
  assertUniqueIds("Allergens", allergens.map(({ id }) => id));
  assertUniqueIds("Cuisines", cuisines.map(({ id }) => id));
  assertUniqueIds("Ingredients", ingredients.map(({ id }) => id));
  assertUniqueIds("Recipes", recipes.map(({ id }) => id));

  const allergenIds = new Set<string>(allergens.map(({ id }) => id));
  const cuisineIds = new Set<string>(cuisines.map(({ id }) => id));
  const ingredientIds = new Set(ingredients.map(({ id }) => id));

  for (const ingredient of ingredients) {
    if (ingredient.allergen && !allergenIds.has(ingredient.allergen)) {
      throw new Error(
        `Ingredient ${ingredient.id} references unknown allergen ${ingredient.allergen}`,
      );
    }
  }

  for (const recipe of recipes) {
    if (!cuisineIds.has(recipe.cuisine)) {
      throw new Error(`Recipe ${recipe.id} references unknown cuisine ${recipe.cuisine}`);
    }

    for (const [ingredientId] of recipe.ingredients) {
      if (!ingredientIds.has(ingredientId)) {
        throw new Error(
          `Recipe ${recipe.id} references unknown ingredient ${ingredientId}`,
        );
      }
    }
  }

  for (const [replacementId, originalId] of substitutions) {
    if (!ingredientIds.has(replacementId) || !ingredientIds.has(originalId)) {
      throw new Error(
        `Invalid substitution: ${replacementId} -> ${originalId}`,
      );
    }
  }
}

async function seed(): Promise<void> {
  validateSeedData();
  await driver.verifyConnectivity();

  const shouldReset = process.argv.includes("--reset");

  if (shouldReset) {
    console.warn("Reset requested: deleting all existing graph data.");
    await driver.executeQuery("MATCH (n) DETACH DELETE n");
  }

  await driver.executeQuery(
    `
    UNWIND $allergens AS allergen
    MERGE (a:Allergen {id: allergen.id})
    SET a.name = allergen.name
    `,
    { allergens: allergens.map((item) => ({ ...item })) },
  );

  await driver.executeQuery(
    `
    UNWIND $cuisines AS cuisine
    MERGE (c:Cuisine {id: cuisine.id})
    SET c.name = cuisine.name
    `,
    { cuisines: cuisines.map((item) => ({ ...item })) },
  );

  await driver.executeQuery(
    `
    UNWIND $ingredients AS ingredient
    MERGE (i:Ingredient {id: ingredient.id})
    SET i.name = ingredient.name
    `,
    { ingredients: ingredients.map(({ id, name }) => ({ id, name })) },
  );

  const ingredientAllergens = ingredients.flatMap(
    ({ id: ingredientId, allergen: allergenId }) =>
      allergenId === null ? [] : [{ ingredientId, allergenId }],
  );

  await driver.executeQuery(
    `
    UNWIND $ingredientAllergens AS item
    MATCH (i:Ingredient {id: item.ingredientId})
    MATCH (a:Allergen {id: item.allergenId})
    MERGE (i)-[:TRIGGERS]->(a)
    `,
    { ingredientAllergens },
  );

  const normalizedRecipes = recipes.map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    difficulty: recipe.difficulty,
    prepMinutes: recipe.prepMinutes,
    cuisineId: recipe.cuisine,
  }));

  await driver.executeQuery(
    `
    UNWIND $recipes AS recipe
    MERGE (r:Recipe {id: recipe.id})
    SET
      r.name = recipe.name,
      r.description = recipe.description,
      r.difficulty = recipe.difficulty,
      r.prepMinutes = recipe.prepMinutes

    WITH r, recipe
    MATCH (c:Cuisine {id: recipe.cuisineId})
    MERGE (r)-[:BELONGS_TO]->(c)
    `,
    { recipes: normalizedRecipes },
  );

  const recipeIngredients = recipes.flatMap((recipe) =>
    recipe.ingredients.map(
      ([ingredientId, quantity, unit, optional]) => ({
        recipeId: recipe.id,
        ingredientId,
        quantity,
        unit,
        optional,
      }),
    ),
  );

  await driver.executeQuery(
    `
    UNWIND $recipeIngredients AS item
    MATCH (r:Recipe {id: item.recipeId})
    MATCH (i:Ingredient {id: item.ingredientId})
    MERGE (r)-[contains:CONTAINS]->(i)
    SET
      contains.quantity = item.quantity,
      contains.unit = item.unit,
      contains.optional = item.optional
    `,
    { recipeIngredients },
  );

  const normalizedSubstitutions = substitutions.map(
    ([replacementId, originalId, notes]) => ({
      replacementId,
      originalId,
      notes,
    }),
  );

  await driver.executeQuery(
    `
    UNWIND $substitutions AS substitution
    MATCH (replacement:Ingredient {id: substitution.replacementId})
    MATCH (original:Ingredient {id: substitution.originalId})
    MERGE (replacement)-[relation:CAN_REPLACE]->(original)
    SET relation.notes = substitution.notes
    `,
    { substitutions: normalizedSubstitutions },
  );

  /*
  const nodeCount =
    allergens.length + cuisines.length + ingredients.length + recipes.length;
  const relationshipCount =
    ingredientAllergens.length +
    recipes.length +
    recipeIngredients.length +
    substitutions.length;

  console.log("SafePlate seed data loaded successfully.");
  console.log(`Nodes represented by this seed: ${nodeCount}`);
  console.log(`Relationships represented by this seed: ${relationshipCount}`);
  console.log(
    shouldReset
      ? "The database was reset before seeding."
      : "Existing matching data was updated without deleting the database.",
  );*/
}

seed()
  .catch((error: unknown) => {
    console.error("SafePlate seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await driver.close();
  });
