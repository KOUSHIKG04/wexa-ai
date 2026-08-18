export const LIST_RECIPES_QUERY = `
  MATCH (r:Recipe)
  OPTIONAL MATCH (r)-[:BELONGS_TO]->(c:Cuisine)
  OPTIONAL MATCH (r)-[:CONTAINS]->(:Ingredient)-[:TRIGGERS]->(a:Allergen)

  WITH
    r,
    c,
    collect(DISTINCT a.name) AS recipeAllergens

  RETURN
    r.id AS id,
    r.name AS name,
    r.description AS description,
    r.difficulty AS difficulty,
    r.prepMinutes AS prepMinutes,
    coalesce(c.name, "Other") AS cuisine,
    recipeAllergens AS allergens,
    any(
      allergen IN recipeAllergens
      WHERE allergen IN $excludedAllergens
    ) AS hasConflict,
    [
      allergen IN recipeAllergens
      WHERE allergen IN $excludedAllergens
    ] AS matchedAllergens

  ORDER BY hasConflict DESC, r.name
  LIMIT $limit
`;

export const RECIPE_DETAILS_QUERY = `
  MATCH (r:Recipe {id: $recipeId})
  MATCH (r)-[contains:CONTAINS]->(i:Ingredient)
  OPTIONAL MATCH (i)-[:TRIGGERS]->(a:Allergen)

  WITH
    r,
    i,
    contains,
    collect(DISTINCT a.name) AS ingredientAllergens

  WITH
    r,
    collect({
      id: i.id,
      name: i.name,
      quantity: contains.quantity,
      unit: contains.unit,
      optional: contains.optional,
      allergens: ingredientAllergens
    }) AS ingredients

  OPTIONAL MATCH (r)-[:BELONGS_TO]->(c:Cuisine)

  RETURN
    r.id AS id,
    r.name AS name,
    r.description AS description,
    r.difficulty AS difficulty,
    r.prepMinutes AS prepMinutes,
    coalesce(c.name, "Other") AS cuisine,
    ingredients
`;

export const SAFE_SUBSTITUTIONS_QUERY = `
  MATCH (r:Recipe {id: $recipeId})-[:CONTAINS]->(unsafe:Ingredient)
  MATCH (unsafe)-[:TRIGGERS]->(blocked:Allergen)

  WHERE blocked.name IN $excludedAllergens

  MATCH path = (replacement:Ingredient)-[:CAN_REPLACE*1..2]->(unsafe)

  WHERE NOT EXISTS {
    MATCH (replacement)-[:TRIGGERS]->(replacementAllergen:Allergen)
    WHERE replacementAllergen.name IN $excludedAllergens
  }

  RETURN DISTINCT
    unsafe.name AS unsafeIngredient,
    blocked.name AS allergen,
    replacement.name AS replacement,
    length(path) AS hops

  ORDER BY hops, replacement
  LIMIT 20
`;
