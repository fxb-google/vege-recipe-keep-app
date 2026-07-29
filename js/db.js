/**
 * VegePower - Database Persistence Layer (IndexedDB Engine)
 * Manages Relational Stores for Recipes, Ingredients, Instructions, and Shopping Lists.
 */

const VegeDB = {
  dbName: 'VegePowerDB',
  dbVersion: 1,
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
        // Populate initial default recipes if store is empty
        await this.seedInitialDataIfEmpty();
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB init error:', event.target.error);
        reject(event.target.error);
      };
    });
  },

  /**
   * Seed initial recipe & ingredient data into IndexedDB if empty
   */
  async seedInitialDataIfEmpty() {
    const existing = await this.getAllRecipes();
    if (existing.length === 0 && typeof VEGE_RECIPES !== 'undefined') {
      console.log('Seeding initial recipes & ingredients into IndexedDB database...');
      for (const recipe of VEGE_RECIPES) {
        await this.saveRecipe(recipe);
      }
    }
  },

  /**
   * Get all recipes with their joined ingredients and instructions
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
   * Save or Update a Recipe and its relational Ingredients & Instructions
   */
  async saveRecipe(recipe) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['recipes', 'ingredients', 'instructions'], 'readwrite');
      const recipeStore = tx.objectStore('recipes');
      const ingStore = tx.objectStore('ingredients');
      const instStore = tx.objectStore('instructions');

      // 1. Put Recipe Record
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

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * Delete Recipe and its relational ingredients/instructions
   */
  async deleteRecipe(id) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['recipes', 'ingredients', 'instructions'], 'readwrite');
      tx.objectStore('recipes').delete(id);

      // Delete relational ingredients
      const ingIndex = tx.objectStore('ingredients').index('recipeId');
      const ingReq = ingIndex.getAllKeys(id);
      ingReq.onsuccess = () => ingReq.result.forEach(k => tx.objectStore('ingredients').delete(k));

      // Delete relational instructions
      const instIndex = tx.objectStore('instructions').index('recipeId');
      const instReq = instIndex.getAllKeys(id);
      instReq.onsuccess = () => instReq.result.forEach(k => tx.objectStore('instructions').delete(k));

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * Query ingredients for a specific recipe ID
   */
  getIngredientsByRecipeId(ingStore, recipeId) {
    return new Promise((resolve) => {
      const index = ingStore.index('recipeId');
      const req = index.getAll(recipeId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  },

  /**
   * Query instructions for a specific recipe ID
   */
  getInstructionsByRecipeId(instStore, recipeId) {
    return new Promise((resolve) => {
      const index = instStore.index('recipeId');
      const req = index.getAll(recipeId);
      req.onsuccess = () => {
        const sorted = (req.result || []).sort((a, b) => a.stepNumber - b.stepNumber);
        resolve(sorted);
      };
      req.onerror = () => resolve([]);
    });
  },

  /**
   * Search database for recipes containing a specific ingredient
   */
  async searchByIngredientName(ingredientName) {
    if (!this.db) await this.initDB();
    const all = await this.getAllRecipes();
    const term = ingredientName.toLowerCase().trim();
    return all.filter(r => r.ingredients.some(ing => ing.name.toLowerCase().includes(term)));
  }
};
