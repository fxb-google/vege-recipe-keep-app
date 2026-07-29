/**
 * VegePower - Online Recipe API & Deduplication Service
 * Automatically fetches new online plant-based recipes daily,
 * checks for consistency, and filters out duplicate recipes.
 */

const RecipeApiService = {
  LAST_SYNC_KEY: 'vege_last_daily_sync',

  /**
   * Main entry point for daily automated online recipe sync & deduplication
   */
  async checkAndRunDailyAutoFetch(existingRecipes = []) {
    const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    // Run daily if 24 hours have passed or if first time
    if (!lastSync || (now - parseInt(lastSync, 10)) > TWENTY_FOUR_HOURS) {
      console.log('🌱 Running daily automated recipe fetch & consistency check...');
      
      const searchTerms = ['Tofu', 'Seitan', 'Tempeh', 'Lentil', 'Chickpea'];
      const newUniqueRecipes = [];

      for (const term of searchTerms) {
        try {
          const onlineResults = await this.searchOnlineRecipes(term);
          
          for (const candidate of onlineResults) {
            // Consistency Check: Filter out duplicates
            const isDup = this.isDuplicateRecipe(candidate, [...existingRecipes, ...newUniqueRecipes]);
            if (!isDup) {
              newUniqueRecipes.push(candidate);
            }
          }
        } catch (err) {
          console.warn(`Daily sync warning for term "${term}":`, err);
        }
      }

      // Record sync timestamp
      localStorage.setItem(this.LAST_SYNC_KEY, now.toString());

      if (newUniqueRecipes.length > 0) {
        console.log(`✅ Daily sync complete! Added ${newUniqueRecipes.length} new unique plant recipes to database.`);
        return { newRecipes: newUniqueRecipes, synced: true };
      }
    }

    return { newRecipes: [], synced: false };
  },

  /**
   * Strict Consistency & Deduplication Check
   * Verifies if candidate recipe is a duplicate of any existing recipe.
   */
  isDuplicateRecipe(candidate, existingList) {
    if (!candidate || !candidate.title) return true;

    const candTitleNorm = this.normalizeTitle(candidate.title);
    const candIngredientsNorm = (candidate.ingredients || []).map(i => i.name.toLowerCase().trim());

    for (const existing of existingList) {
      const existTitleNorm = this.normalizeTitle(existing.title);

      // 1. Direct Title Match or Substring match
      if (candTitleNorm === existTitleNorm) {
        return true;
      }

      // 2. High Title Similarity Match
      if (candTitleNorm.length > 8 && existTitleNorm.length > 8) {
        if (candTitleNorm.includes(existTitleNorm) || existTitleNorm.includes(candTitleNorm)) {
          return true;
        }
      }

      // 3. Ingredient Signature Match (If 80%+ of ingredients match, it's a duplicate)
      if (candIngredientsNorm.length > 3 && existing.ingredients && existing.ingredients.length > 3) {
        const existIngredientsNorm = existing.ingredients.map(i => i.name.toLowerCase().trim());
        let matches = 0;
        candIngredientsNorm.forEach(ing => {
          if (existIngredientsNorm.includes(ing)) matches++;
        });

        const similarityRatio = matches / Math.min(candIngredientsNorm.length, existIngredientsNorm.length);
        if (similarityRatio >= 0.8) {
          return true; // Flagged as duplicate
        }
      }
    }

    return false; // Unique recipe
  },

  /**
   * Title Normalizer helper
   */
  normalizeTitle(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  },

  /**
   * Search online vegetarian recipes by query string
   */
  async searchOnlineRecipes(query = "Tofu") {
    try {
      const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      
      if (!response.ok) return [];
      
      const data = await response.json();
      if (!data.meals) return [];

      return data.meals.map(meal => this.normalizeMealDbRecipe(meal));
    } catch (error) {
      console.warn("Online recipe fetch failed:", error);
      return [];
    }
  },

  /**
   * Normalize MealDB API schema into VegePower format
   */
  normalizeMealDbRecipe(meal) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
      const ingName = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingName && ingName.trim() !== "") {
        const parsed = this.parseMeasure(measure, ingName.trim());
        ingredients.push({
          name: ingName.trim(),
          amount: parsed.amount,
          unit: parsed.unit,
          category: this.categorizeIngredient(ingName.trim())
        });
      }
    }

    const titleLower = meal.strMeal.toLowerCase();
    let proteinSource = "legumes";
    if (titleLower.includes("tofu")) proteinSource = "tofu";
    else if (titleLower.includes("seitan")) proteinSource = "seitan";
    else if (titleLower.includes("tempeh")) proteinSource = "tempeh";
    else if (titleLower.includes("quinoa") || titleLower.includes("seed")) proteinSource = "grains";

    let estimatedProtein = 22;
    if (titleLower.includes("seitan")) estimatedProtein = 44;
    else if (titleLower.includes("tofu")) estimatedProtein = 34;
    else if (titleLower.includes("tempeh")) estimatedProtein = 36;
    else if (titleLower.includes("lentil") || titleLower.includes("chickpea")) estimatedProtein = 28;

    const instructions = meal.strInstructions
      ? meal.strInstructions.split("\r\n").filter(s => s.trim().length > 5)
      : ["Follow traditional recipe instructions."];

    return {
      id: `online-${meal.idMeal}`,
      title: meal.strMeal,
      proteinSource,
      proteinGrams: estimatedProtein,
      calories: 460,
      prepTime: "15 min",
      cookTime: "20 min",
      servings: 2,
      difficulty: "Medium",
      category: meal.strCategory || "Online Recipe",
      image: meal.strMealThumb,
      description: `Delicious ${meal.strArea || "international"} plant-based recipe online featuring ${ingredients.slice(0, 3).map(i => i.name).join(", ")}.`,
      ingredients,
      instructions,
      isOnline: true
    };
  },

  parseMeasure(measureStr) {
    if (!measureStr || measureStr.trim() === "") return { amount: 1, unit: "unit" };
    const str = measureStr.trim().toLowerCase();
    const match = str.match(/^([\d\.\/]+)\s*(.*)$/);
    if (match) {
      let num = match[1];
      if (num.includes("/")) {
        const parts = num.split("/");
        num = parseFloat(parts[0]) / parseFloat(parts[1]);
      } else {
        num = parseFloat(num);
      }
      return { amount: isNaN(num) ? 1 : num, unit: match[2] || "to taste" };
    }
    return { amount: 1, unit: str };
  },

  categorizeIngredient(name) {
    const lower = name.toLowerCase();
    if (lower.includes("tofu") || lower.includes("seitan") || lower.includes("tempeh") || lower.includes("milk") || lower.includes("cheese") || lower.includes("yogurt") || lower.includes("butter")) {
      return "Protein & Chilled";
    }
    if (lower.includes("onion") || lower.includes("garlic") || lower.includes("spinach") || lower.includes("tomato") || lower.includes("pepper") || lower.includes("carrot") || lower.includes("lemon") || lower.includes("lime") || lower.includes("cilantro") || lower.includes("avocado") || lower.includes("cabbage")) {
      return "Produce";
    }
    if (lower.includes("cumin") || lower.includes("turmeric") || lower.includes("paprika") || lower.includes("salt") || lower.includes("pepper") || lower.includes("curry") || lower.includes("garam masala") || lower.includes("chili")) {
      return "Spices";
    }
    return "Pantry";
  }
};
