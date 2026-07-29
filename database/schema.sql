-- ============================================================================
-- VegePower Relational Database Schema (SQL)
-- Standard SQL schema for SQLite, PostgreSQL, GCP Cloud SQL, or Spanner
-- ============================================================================

-- 1. Recipes Master Table
CREATE TABLE IF NOT EXISTS recipes (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    protein_source VARCHAR(50) NOT NULL, -- 'seitan', 'tofu', 'tempeh', 'legumes', 'grains'
    protein_grams INT NOT NULL DEFAULT 0,
    calories INT NOT NULL DEFAULT 0,
    prep_time VARCHAR(50),
    cook_time VARCHAR(50),
    servings INT NOT NULL DEFAULT 2,
    difficulty VARCHAR(50) DEFAULT 'Medium',
    category VARCHAR(100) DEFAULT 'Vegetarian',
    image TEXT,
    description TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ingredients Relational Table
CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount REAL NOT NULL,
    unit VARCHAR(50),
    category VARCHAR(100) NOT NULL, -- 'Produce', 'Protein & Chilled', 'Pantry', 'Spices'
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- 3. Instructions Relational Table
CREATE TABLE IF NOT EXISTS instructions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id VARCHAR(64) NOT NULL,
    step_number INT NOT NULL,
    instruction_text TEXT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Indexing for high-performance searches
CREATE INDEX IF NOT EXISTS idx_recipes_protein_source ON recipes(protein_source);
CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);
CREATE INDEX IF NOT EXISTS idx_instructions_recipe_id ON instructions(recipe_id);
