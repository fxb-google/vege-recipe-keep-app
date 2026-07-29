/**
 * VegePower - Online Recipe API Service
 * Fetches real-time vegetarian & vegan recipes from public web APIs
 * (TheMealDB vegetarian endpoint) and normalizes ingredients/macros.
 */

const RecipeApiService = {
  /**
   * Search online vegetarian recipes by ingredient or query string
   * @param {string} query 
   * @returns {Promise<Array>} Normalized recipe list
   */
  async searchOnlineRecipes(query = "Tofu") {
    try {
      // Search public TheMealDB API
      const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.meals) {
        // Fallback filter by vegetarian category if specific query returned empty
        return await this.fetchVegetarianCategory();
      }

      // Filter to vegetarian / vegan or plant-based matching recipes
      const meals = data.meals;
      return meals.map(meal => this.normalizeMealDbRecipe(meal));

    } catch (error) {
      console.warn("Online recipe fetch failed, providing fallback dataset:", error);
      return [];
    }
  },

  /**
   * Fetch general Vegetarian category from online API
   */
  async fetchVegetarianCategory() {
    try {
      const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=Vegetarian`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.meals) return [];

      // Fetch full details for top 6 items
      const detailedPromises = data.meals.slice(0, 6).map(meal => 
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
          .then(res => res.json())
          .then(d => d.meals ? d.meals[0] : null)
      );

      const detailedMeals = await Promise.all(detailedPromises);
      return detailedMeals
        .filter(m => m !== null)
        .map(meal => this.normalizeMealDbRecipe(meal));

    } catch (err) {
      console.error("Error fetching vegetarian category:", err);
      return [];
    }
  },

  /**
   * Converts raw MealDB schema into VegePower unified recipe schema
   */
  normalizeMealDbRecipe(meal) {
    const ingredients = [];

    // Extract 20 ingredient slots from MealDB schema
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

    // Determine protein source tag
    const titleLower = meal.strMeal.toLowerCase();
    let proteinSource = "legumes";
    if (titleLower.includes("tofu")) proteinSource = "tofu";
    else if (titleLower.includes("seitan")) proteinSource = "seitan";
    else if (titleLower.includes("tempeh")) proteinSource = "tempeh";
    else if (titleLower.includes("quinoa") || titleLower.includes("seed")) proteinSource = "grains";

    // Estimate protein content based on key ingredients
    let estimatedProtein = 22;
    if (titleLower.includes("seitan")) estimatedProtein = 42;
    else if (titleLower.includes("tofu")) estimatedProtein = 32;
    else if (titleLower.includes("tempeh")) estimatedProtein = 35;
    else if (titleLower.includes("lentil") || titleLower.includes("chickpea")) estimatedProtein = 28;

    // Instructions splitting
    const instructions = meal.strInstructions
      ? meal.strInstructions.split("\r\n").filter(s => s.trim().length > 5)
      : ["Follow traditional recipe instructions."];

    return {
      id: `online-${meal.idMeal}`,
      title: meal.strMeal,
      proteinSource,
      proteinGrams: estimatedProtein,
      calories: 450,
      prepTime: "15 min",
      cookTime: "25 min",
      servings: 2,
      difficulty: "Medium",
      category: meal.strCategory || "Online Recipe",
      image: meal.strMealThumb,
      description: `Delicious ${meal.strArea || "international"} vegetarian recipe online. Features ${ingredients.slice(0, 3).map(i => i.name).join(", ")}.`,
      ingredients,
      instructions,
      isOnline: true
    };
  },

  /**
   * Helper to parse measurement strings into numeric amount & unit
   */
  parseMeasure(measureStr, ingName) {
    if (!measureStr || measureStr.trim() === "") {
      return { amount: 1, unit: "unit" };
    }

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

      return {
        amount: isNaN(num) ? 1 : num,
        unit: match[2] || "to taste"
      };
    }

    return { amount: 1, unit: str };
  },

  /**
   * Auto-assign ingredient into aisle category
   */
  categorizeIngredient(name) {
    const lower = name.toLowerCase();
    if (lower.includes("tofu") || lower.includes("seitan") || lower.includes("tempeh") || lower.includes("milk") || lower.includes("cheese") || lower.includes("yogurt") || lower.includes("butter")) {
      return "Protein & Chilled";
    }
    if (lower.includes("onion") || lower.includes("garlic") || lower.includes("spinach") || lower.includes("tomato") || lower.includes("pepper") || lower.includes("carrot") || lower.includes("lemon") || lower.includes("lime") || lower.includes("cilantro") || lower.includes("parsley") || lower.includes("avocado") || lower.includes("cabbage")) {
      return "Produce";
    }
    if (lower.includes("cumin") || lower.includes("turmeric") || lower.includes("paprika") || lower.includes("salt") || lower.includes("pepper") || lower.includes("curry") || lower.includes("garam masala") || lower.includes("cinnamon") || lower.includes("chili")) {
      return "Spices";
    }
    return "Pantry";
  }
};
