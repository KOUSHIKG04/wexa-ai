import { driver } from "@/lib/db";
import { LIST_RECIPES_QUERY } from "@/lib/queries";
import { ALLERGENS, type RecipeSummary } from "@/lib/types";
import { isInt } from "neo4j-driver";

export const dynamic = "force-dynamic";

function convertNumber(value: unknown): number {
  if (isInt(value)) {
    return value.toNumber();
  }

  return Number(value);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const supportedAllergens = new Set<string>(ALLERGENS);
    const excludedAllergens = searchParams
      .getAll("allergen")
      .filter((allergen) => supportedAllergens.has(allergen));

    const result = await driver.executeQuery(LIST_RECIPES_QUERY, {
      excludedAllergens,
      limit: 50,
    });

    const recipes: RecipeSummary[] = result.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
      description: record.get("description"),
      difficulty: record.get("difficulty"),
      prepMinutes: convertNumber(record.get("prepMinutes")),
      cuisine: record.get("cuisine"),
      allergens: record.get("allergens") ?? [],
      hasConflict: Boolean(record.get("hasConflict")),
      matchedAllergens: record.get("matchedAllergens") ?? [],
    }));

    return Response.json({ recipes });
  } catch (error) {
    console.error("Unable to list recipes:", error);

    return Response.json(
      {
        message:
          "The recipe database is temporarily unavailable. Please try again.",
      },
      { status: 503 },
    );
  }
}
