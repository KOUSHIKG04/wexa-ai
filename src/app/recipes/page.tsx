import RecipeExplorer from "@/components/RecipeExplorer";
import { ALLERGENS } from "@/lib/types";

interface RecipeNetworkPageProps {
  searchParams: Promise<{ allergen?: string | string[] }>;
}

export default async function RecipeNetworkPage({
  searchParams,
}: RecipeNetworkPageProps) {
  const filters = await searchParams;
  const requested = Array.isArray(filters.allergen)
    ? filters.allergen
    : filters.allergen
      ? [filters.allergen]
      : [];
  const supported = new Set<string>(ALLERGENS);
  const initialAllergens = requested.filter((allergen) =>
    supported.has(allergen),
  );

  return <RecipeExplorer initialAllergens={initialAllergens} />;
}
