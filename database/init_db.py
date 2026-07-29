#!/usr/bin/env python3
"""
VegePower SQL Database Seeder Script
Initializes SQLite database 'vegepower.db' and populates all recipes, ingredients, and steps.
"""

import sqlite3
import os
import json

# Database File
DB_FILE = os.path.join(os.path.dirname(__file__), "vegepower.db")
SCHEMA_FILE = os.path.join(os.path.dirname(__file__), "schema.sql")

# Seed Recipes Data
INITIAL_RECIPES = [
  {
    "id": "recipe-seitan-satay",
    "title": "Grilled Seitan Satay Skewers with Spicy Peanut Dip",
    "proteinSource": "seitan",
    "proteinGrams": 44,
    "calories": 520,
    "prepTime": "20 min",
    "cookTime": "15 min",
    "servings": 2,
    "difficulty": "Medium",
    "category": "High Protein Dinner",
    "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    "description": "Tender homemade seitan strips marinated in lemongrass, turmeric, and garlic, grilled with rich peanut sauce.",
    "ingredients": [
      { "name": "Vital Wheat Gluten (Seitan base)", "amount": 200, "unit": "g", "category": "Protein & Chilled" },
      { "name": "Nutritional Yeast", "amount": 3, "unit": "tbsp", "category": "Pantry" },
      { "name": "Vegetable Broth", "amount": 150, "unit": "ml", "category": "Pantry" },
      { "name": "Soy Sauce or Tamari", "amount": 3, "unit": "tbsp", "category": "Pantry" },
      { "name": "Smooth Peanut Butter", "amount": 4, "unit": "tbsp", "category": "Pantry" },
      { "name": "Coconut Milk", "amount": 100, "unit": "ml", "category": "Pantry" },
      { "name": "Fresh Garlic", "amount": 3, "unit": "cloves", "category": "Produce" },
      { "name": "Ginger Root", "amount": 1, "unit": "thumb", "category": "Produce" },
      { "name": "Ground Turmeric", "amount": 1, "unit": "tsp", "category": "Spices" }
    ],
    "instructions": [
      "Mix vital wheat gluten, nutritional yeast, and turmeric in a bowl.",
      "Add vegetable broth and soy sauce. Knead for 3 minutes to develop gluten structure.",
      "Cut seitan into strips and steam for 15 minutes.",
      "Thread onto skewers and grill for 3-4 minutes per side. Serve warm with peanut dip."
    ]
  },
  {
    "id": "recipe-crispy-tofu-bowl",
    "title": "Crispy Teriyaki Tofu & Edamame Power Bowl",
    "proteinSource": "tofu",
    "proteinGrams": 36,
    "calories": 480,
    "prepTime": "15 min",
    "cookTime": "15 min",
    "servings": 2,
    "difficulty": "Easy",
    "category": "Quick Lunch",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    "description": "Golden crispy extra firm tofu tossed in teriyaki glaze over warm quinoa and steamed edamame.",
    "ingredients": [
      { "name": "Extra Firm Tofu", "amount": 400, "unit": "g", "category": "Protein & Chilled" },
      { "name": "Shelled Edamame Beans", "amount": 150, "unit": "g", "category": "Protein & Chilled" },
      { "name": "Cornstarch", "amount": 2, "unit": "tbsp", "category": "Pantry" },
      { "name": "Cooked Quinoa", "amount": 250, "unit": "g", "category": "Pantry" },
      { "name": "Teriyaki Sauce", "amount": 4, "unit": "tbsp", "category": "Pantry" },
      { "name": "Ripe Avocado", "amount": 1, "unit": "whole", "category": "Produce" }
    ],
    "instructions": [
      "Press extra firm tofu to remove excess moisture. Cube into bite-sized pieces.",
      "Toss tofu in cornstarch and bake at 200°C for 15 minutes until crispy.",
      "Toss crispy tofu in teriyaki glaze.",
      "Assemble power bowl with quinoa base, edamame, and sliced avocado."
    ]
  }
]

def init_db():
    print(f"Connecting to SQLite database: {DB_FILE}")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Read and execute schema.sql
    with open(SCHEMA_FILE, "r") as f:
        cursor.executescript(f.read())
    print("Schema created successfully.")

    # Seed recipes, ingredients, and instructions
    for r in INITIAL_RECIPES:
        cursor.execute("""
            INSERT OR REPLACE INTO recipes (id, title, protein_source, protein_grams, calories, prep_time, cook_time, servings, difficulty, category, image, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r["id"], r["title"], r["proteinSource"], r["proteinGrams"], r["calories"],
            r["prepTime"], r["cookTime"], r["servings"], r["difficulty"], r["category"],
            r["image"], r["description"]
        ))

        # Delete existing ingredients for recipe
        cursor.execute("DELETE FROM ingredients WHERE recipe_id = ?", (r["id"],))
        for ing in r["ingredients"]:
            cursor.execute("""
                INSERT INTO ingredients (recipe_id, name, amount, unit, category)
                VALUES (?, ?, ?, ?, ?)
            """, (r["id"], ing["name"], ing["amount"], ing["unit"], ing["category"]))

        # Delete existing instructions for recipe
        cursor.execute("DELETE FROM instructions WHERE recipe_id = ?", (r["id"],))
        for idx, step in enumerate(r["instructions"]):
            cursor.execute("""
                INSERT INTO instructions (recipe_id, step_number, instruction_text)
                VALUES (?, ?, ?)
            """, (r["id"], idx + 1, step))

    conn.commit()
    conn.close()
    print("Database seeding completed successfully! sqlite database 'vegepower.db' ready.")

if __name__ == "__main__":
    init_db()
