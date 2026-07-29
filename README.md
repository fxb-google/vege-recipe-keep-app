# 🌿 VegePower — Mobile Vegetarian Recipe & Google Keep Sync

A modern, mobile-adaptable web application to explore plant-protein recipes (**Seitan, Tofu, Tempeh, Legumes, Grains**) and export aggregated ingredient shopping lists directly to **Google Keep**.

![VegePower App](https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80)

## ✨ Key Features
- **Power Food Recipes**: High-protein plant recipes with complete macros (protein grams, calories, prep time, cook time, step-by-step instructions).
- **Live Online Fetch Engine**: Search public online recipe APIs in real-time and import recipes into your list.
- **Google Keep Integration**:
  - **Native Web Share API**: Shares checklist notes straight into the installed Google Keep app on mobile phones (iOS & Android).
  - **`keep.new` Launcher**: Opens Google Keep with pre-formatted checklist.
  - **1-Click Smart Copy**: Formats checklist with `[ ]` checkboxes ready to paste.
- **Smart Ingredient Aggregator**: Combines duplicate ingredients, scales servings (1x, 2x, 3x, 4x), and organizes by grocery aisles (Produce 🥦, Protein & Chilled 🫘, Pantry 🏺, Spices 🧂).
- **Dual Database Persistence**:
  - Client-side browser **IndexedDB** (`VegePowerDB`).
  - Relational **SQL schema** & SQLite (`database/vegepower.db`).

## 🛠️ Stack
- HTML5, CSS3 (Glassmorphism, Obsidian Dark Theme, Touch Mobile UI), ES6 Modules.
- IndexedDB + SQLite database persistence.
- Docker & GCP Cloud Run / Firebase deployment configs.
# vege-recipe-keep-app
