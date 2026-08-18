import dotenv from "dotenv"; import neo4j from "neo4j-driver";

dotenv.config({ path: ".env.local" });

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error("CognoDB environment variables are missing");
}

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

const allergens = [
  { id: "peanut", name: "Peanut" },
  { id: "dairy", name: "Dairy" },
  { id: "gluten", name: "Gluten" },
  { id: "egg", name: "Egg" },
  { id: "soy", name: "Soy" },
  { id: "shellfish", name: "Shellfish" },
  { id: "sesame", name: "Sesame" },
  { id: "tree-nut", name: "Tree Nut" },
];

const cuisines = [
  { id: "thai", name: "Thai" },
  { id: "italian", name: "Italian" },
  { id: "indian", name: "Indian" },
  { id: "mexican", name: "Mexican" },
  { id: "mediterranean", name: "Mediterranean" },
];

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
];

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
] as const;

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
] as const;

async function seed() {
  await driver.verifyConnectivity();

  await driver.executeQuery(`MATCH (n) DETACH DELETE n`);

  await driver.executeQuery(
    `
    UNWIND $allergens AS allergen
    CREATE (:Allergen {
      id: allergen.id,
      name: allergen.name
    })
    `,
    { allergens },
  );

  await driver.executeQuery(
    `
    UNWIND $cuisines AS cuisine
    CREATE (:Cuisine {
      id: cuisine.id,
      name: cuisine.name
    })
    `,
    { cuisines },
  );

  await driver.executeQuery(
    `
    UNWIND $ingredients AS ingredient

    CREATE (i:Ingredient {
      id: ingredient.id,
      name: ingredient.name
    })

    WITH i, ingredient
    WHERE ingredient.allergen IS NOT NULL

    MATCH (a:Allergen {id: ingredient.allergen})
    CREATE (i)-[:TRIGGERS]->(a)
    `,
    { ingredients },
  );

  for (const recipe of recipes) {
    await driver.executeQuery(
      `
      CREATE (r:Recipe {
        id: $id,
        name: $name,
        description: $description,
        difficulty: $difficulty,
        prepMinutes: $prepMinutes
      })

      WITH r
      MATCH (c:Cuisine {id: $cuisine})
      CREATE (r)-[:BELONGS_TO]->(c)

      WITH r
      UNWIND $ingredients AS recipeIngredient

      MATCH (i:Ingredient {id: recipeIngredient.id})

      CREATE (r)-[:CONTAINS {
        quantity: recipeIngredient.quantity,
        unit: recipeIngredient.unit,
        optional: recipeIngredient.optional
      }]->(i)
      `,
      {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        difficulty: recipe.difficulty,
        prepMinutes: recipe.prepMinutes,
        cuisine: recipe.cuisine,
        ingredients: recipe.ingredients.map(
          ([id, quantity, unit, optional]) => ({
            id,
            quantity,
            unit,
            optional,
          }),
        ),
      },
    );
  }

  await driver.executeQuery(
    `
    UNWIND $substitutions AS substitution

    MATCH (replacement:Ingredient {
      id: substitution.replacementId
    })

    MATCH (original:Ingredient {
      id: substitution.originalId
    })

    CREATE (replacement)-[:CAN_REPLACE {
      notes: substitution.notes
    }]->(original)
    `,
    {
      substitutions: substitutions.map(
        ([replacementId, originalId, notes]) => ({
          replacementId,
          originalId,
          notes,
        }),
      ),
    },
  );

  console.log("SafePlate seed data loaded successfully.");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await driver.close();
  });
