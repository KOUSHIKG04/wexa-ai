import RecipeDetails from "@/components/RecipeDetails";

interface RecipePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    allergen?: string | string[];
  }>;
}

export default async function RecipePage({
  params,
  searchParams,
}: RecipePageProps) {
  const { id } = await params;
  const filters = await searchParams;

  const excludedAllergens = Array.isArray(filters.allergen)
    ? filters.allergen
    : filters.allergen
      ? [filters.allergen]
      : [];

  return <RecipeDetails recipeId={id} excludedAllergens={excludedAllergens} />;
}
