/**
 * VegePower - Database Persistence Layer (IndexedDB Engine)
 * Manages Relational Stores for Recipes, Ingredients, Instructions, Shopping Lists, and Votes.
 */

const VegeDB = {
  dbName: 'VegePowerDB_v2',
  dbVersion: 2,
  db: null,

  /**
   * Initialize IndexedDB database, create schema object stores & indexes
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Recipes Store
        if (!db.objectStoreNames.contains('recipes')) {
          const recipeStore = db.createObjectStore('recipes', { keyPath: 'id' });
          recipeStore.createIndex('proteinSource', 'proteinSource', { unique: false });
          recipeStore.createIndex('proteinGrams', 'proteinGrams', { unique: false });
          recipeStore.createIndex('title', 'title', { unique: false });
        }

        // 2. Relational Ingredients Store
        if (!db.objectStoreNames.contains('ingredients')) {
          const ingStore = db.createObjectStore('ingredients', { keyPath: 'id', autoIncrement: true });
          ingStore.createIndex('recipeId', 'recipeId', { unique: false });
          ingStore.createIndex('name', 'name', { unique: false });
          ingStore.createIndex('category', 'category', { unique: false });
        }

        // 3. Relational Instructions Store
        if (!db.objectStoreNames.contains('instructions')) {
          const instStore = db.createObjectStore('instructions', { keyPath: 'id', autoIncrement: true });
          instStore.createIndex('recipeId', 'recipeId', { unique: false });
          instStore.createIndex('stepNumber', 'stepNumber', { unique: false });
        }

        // 4. Shopping List Store
        if (!db.objectStoreNames.contains('shopping_list')) {
          db.createObjectStore('shopping_list', { keyPath: 'recipeId' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = event.target.result;
        await this.syncAndSanitizeDatabase();
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB init error:', event.target.error);
        reject(event.target.error);
      };
    });
  },

  /**
   * Sync default recipes and purge any non-vegetarian/meat-based items
   */
  async syncAndSanitizeDatabase() {
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
    if (typeof VEGE_RECIPES !== 'undefined') {
      for (const defaultRecipe of VEGE_RECIPES) {
        const found = refreshed.find(r => r.id === defaultRecipe.id);
        if (!found) {
          await this.saveRecipe(defaultRecipe);
        }
      }
    }
  },

  /**
   * Delete a recipe and its ingredients/instructions
   */
  async deleteRecipe(recipeId) {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['recipes'], 'readwrite');
      const store = tx.objectStore('recipes');
      const req = store.delete(recipeId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Get all recipes with their joined ingredients, instructions, and voting counts
   */
  async getAllRecipes() {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['recipes', 'ingredients', 'instructions'], 'readonly');
      const recipeStore = tx.objectStore('recipes');
      const ingStore = tx.objectStore('ingredients');
      const instStore = tx.objectStore('instructions');

      const recipesReq = recipeStore.getAll();

      recipesReq.onsuccess = async () => {
        const recipes = recipesReq.result || [];
        const fullRecipes = [];

        for (const recipe of recipes) {
          const ingredients = await this.getIngredientsByRecipeId(ingStore, recipe.id);
          const instructions = await this.getInstructionsByRecipeId(instStore, recipe.id);

          fullRecipes.push({
            ...recipe,
            likesCount: recipe.likesCount !== undefined ? recipe.likesCount : 120,
            dislikesCount: recipe.dislikesCount !== undefined ? recipe.dislikesCount : 3,
            ingredients,
            instructions: instructions.map(i => i.instructionText)
          });
        }

        resolve(fullRecipes);
      };

      recipesReq.onerror = () => reject(recipesReq.error);
    });
  },

  /**
   * Save or Update a Recipe with likesCount and dislikesCount persistence
   */
  async saveRecipe(recipe) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['recipes', 'ingredients', 'instructions'], 'readwrite');
      const recipeStore = tx.objectStore('recipes');
      const ingStore = tx.objectStore('ingredients');
      const instStore = tx.objectStore('instructions');

      // 1. Put Recipe Record with Vote Counts
      recipeStore.put({
        id: recipe.id,
        title: recipe.title,
        proteinSource: recipe.proteinSource,
        proteinGrams: recipe.proteinGrams,
        calories: recipe.calories,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        category: recipe.category,
        image: recipe.image,
        description: recipe.description,
        likesCount: recipe.likesCount !== undefined ? recipe.likesCount : 120,
        dislikesCount: recipe.dislikesCount !== undefined ? recipe.dislikesCount : 3,
        isOnline: !!recipe.isOnline
      });

      // 2. Clear old relational ingredients & save new ones
      const ingIndex = ingStore.index('recipeId');
      const ingKeyReq = ingIndex.getAllKeys(recipe.id);

      ingKeyReq.onsuccess = () => {
        ingKeyReq.result.forEach(key => ingStore.delete(key));

        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach(ing => {
            ingStore.add({
              recipeId: recipe.id,
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              category: ing.category || 'Pantry'
            });
          });
        }
      };

      // 3. Clear old instructions & save new ones
      const instIndex = instStore.index('recipeId');
      const instKeyReq = instIndex.getAllKeys(recipe.id);

      instKeyReq.onsuccess = () => {
        instKeyReq.result.forEach(key => instStore.delete(key));

        if (recipe.instructions && Array.isArray(recipe.instructions)) {
          recipe.instructions.forEach((stepText, idx) => {
            instStore.add({
              recipeId: recipe.id,
              stepNumber: idx + 1,
              instructionText: stepText
            });
          });
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  getIngredientsByRecipeId(ingStore, recipeId) {
    return new Promise((resolve) => {
      const index = ingStore.index('recipeId');
      const req = index.getAll(recipeId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  },

  getInstructionsByRecipeId(instStore, recipeId) {
    return new Promise((resolve) => {
      const index = instStore.index('recipeId');
      const req = index.getAll(recipeId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }
};
