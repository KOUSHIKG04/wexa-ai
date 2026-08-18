import { driver } from "@/lib/db";
import { RECIPE_DETAILS_QUERY, SAFE_SUBSTITUTIONS_QUERY } from "@/lib/queries";
import type {
  RecipeDetailsData,
  RecipeDetailsResponse,
  RecipeIngredient,
  Substitute,
} from "@/lib/types";
import { isInt } from "neo4j-driver";

export const dynamic = "force-dynamic";

function convertNumber(value: unknown): number {
  if (isInt(value)) {
    return value.toNumber();
  }

  return Number(value);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);

    const excludedAllergens = searchParams.getAll("allergen").filter(Boolean);

    const recipeResult = await driver.executeQuery(RECIPE_DETAILS_QUERY, {
      recipeId: id,
    });

    if (recipeResult.records.length === 0) {
      return Response.json({ message: "Recipe not found." }, { status: 404 });
    }

    const record = recipeResult.records[0];

    const rawIngredients = record.get("ingredients") as Array<{
      id: string;
      name: string;
      quantity: string;
      unit: string;
      optional: boolean;
      allergens: string[];
    }>;

    const ingredients: RecipeIngredient[] = rawIngredients.map(
      (ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        optional: ingredient.optional,
        allergens: ingredient.allergens ?? [],
      }),
    );

    const recipe: RecipeDetailsData = {
      id: record.get("id"),
      name: record.get("name"),
      description: record.get("description"),
      difficulty: record.get("difficulty"),
      prepMinutes: convertNumber(record.get("prepMinutes")),
      cuisine: record.get("cuisine"),
      ingredients,
    };

    const substitutionResult =
      excludedAllergens.length === 0
        ? { records: [] }
        : await driver.executeQuery(SAFE_SUBSTITUTIONS_QUERY, {
            recipeId: id,
            excludedAllergens,
          });

    const substitutions: Substitute[] = substitutionResult.records.map(
      (substitutionRecord) => ({
        unsafeIngredient: substitutionRecord.get("unsafeIngredient"),
        allergen: substitutionRecord.get("allergen"),
        replacement: substitutionRecord.get("replacement"),
        hops: convertNumber(substitutionRecord.get("hops")),
      }),
    );

    const response: RecipeDetailsResponse = {
      recipe,
      substitutions,
    };

    return Response.json(response);
  } catch (error) {
    console.error("Unable to load recipe:", error);

    return Response.json(
      {
        message:
          "The recipe database is temporarily unavailable. Please try again.",
      },
      { status: 503 },
    );
  }
}
