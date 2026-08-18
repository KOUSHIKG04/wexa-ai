export const ALLERGENS = [
  "Peanut",
  "Dairy",
  "Gluten",
  "Egg",
  "Soy",
  "Shellfish",
  "Sesame",
  "Tree Nut",
] as const;

export interface RecipeSummary {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  prepMinutes: number;
  cuisine: string;
  allergens: string[];
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  optional: boolean;
  allergens: string[];
}

export interface RecipeDetailsData {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  prepMinutes: number;
  cuisine: string;
  ingredients: RecipeIngredient[];
}

export interface Substitute {
  unsafeIngredient: string;
  allergen: string;
  replacement: string;
  hops: number;
}

export interface RecipeDetailsResponse {
  recipe: RecipeDetailsData;
  substitutions: Substitute[];
}
