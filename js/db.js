/**
 * VegePower - Database Persistence Layer (Firestore Engine)
 * Replaces IndexedDB to provide real-time global syncing and secure storage on GCP.
 */

const VegeDB = {
  /**
   * Initialize Database - now just ensures Firestore is ready and seeds default data if empty.
   */
  async initDB() {
    if (!db) {
      console.warn("Firestore not initialized, relying on local recipesData.");
      return;
    }

    try {
      // Enable offline persistence
      await db.enablePersistence({ synchronizeTabs: true });
    } catch (err) {
      console.warn("Firestore offline persistence failed (may be multiple tabs open)", err);
    }

    await this.syncAndSanitizeDatabase();
  },

  /**
   * Sync default recipes and purge any non-vegetarian/meat-based items
   */
  async syncAndSanitizeDatabase() {
    if (!db) return;

    const existing = await this.getAllRecipes();
    const meatRegex = /chorizo|sausage|chicken|beef|pork|mutton|lamb|ham|fish|shrimp|seafood|meat/i;

    // Purge any existing meat or chorizo recipe
    for (const recipe of existing) {
      const isMeat = meatRegex.test(recipe.title) || 
                     meatRegex.test(recipe.description || '') ||
                     (recipe.ingredients && recipe.ingredients.some(ing => meatRegex.test(ing.name)));

      if (isMeat) {
        console.log(`Purging non-vegetarian recipe: ${recipe.title}`);
        await this.deleteRecipe(recipe.id);
      }
    }

    // Seed default recipes if dataset missing
    const refreshed = await this.getAllRecipes();
    if (typeof VEGE_RECIPES !== 'undefined' && refreshed.length === 0) {
      console.log("Seeding initial recipes to Firestore...");
      const batch = db.batch();
      
      VEGE_RECIPES.forEach(defaultRecipe => {
        // Initialize vote counts if missing
        defaultRecipe.likesCount = defaultRecipe.likesCount || 120;
        defaultRecipe.dislikesCount = defaultRecipe.dislikesCount || 3;
        
        const docRef = db.collection("recipes").doc(defaultRecipe.id);
        batch.set(docRef, defaultRecipe);
      });

      await batch.commit();
      console.log("Seeding complete.");
    }
  },

  /**
   * Delete a recipe
   */
  async deleteRecipe(recipeId) {
    if (!db) return;
    try {
      await db.collection("recipes").doc(recipeId).delete();
    } catch (e) {
      console.error("Error deleting recipe:", e);
    }
  },

  /**
   * Get all recipes
   */
  async getAllRecipes() {
    if (!db) {
      return typeof VEGE_RECIPES !== 'undefined' ? VEGE_RECIPES : [];
    }

    try {
      const snapshot = await db.collection("recipes").get();
      const recipes = [];
      snapshot.forEach(doc => {
        recipes.push({ id: doc.id, ...doc.data() });
      });
      return recipes;
    } catch (e) {
      console.error("Error fetching recipes from Firestore:", e);
      return typeof VEGE_RECIPES !== 'undefined' ? VEGE_RECIPES : [];
    }
  },

  /**
   * Save or Update a Recipe
   */
  async saveRecipe(recipe) {
    if (!db) return;
    
    // Ensure vote fields exist to prevent undefined errors in Firestore
    if (recipe.likesCount === undefined) recipe.likesCount = 120;
    if (recipe.dislikesCount === undefined) recipe.dislikesCount = 3;

    try {
      await db.collection("recipes").doc(recipe.id).set(recipe);
    } catch (e) {
      console.error("Error saving recipe to Firestore:", e);
    }
  }
};
