/**
 * VegePower - High-Protein Vegetarian & Vegan Recipe Dataset
 * Highlighting Seitan, Tofu, Tempeh, Legumes, and Protein Grains.
 */

const VEGE_RECIPES = [
  {
    id: "recipe-seitan-satay",
    title: "Grilled Seitan Satay Skewers with Spicy Peanut Dip",
    proteinSource: "seitan",
    proteinGrams: 44,
    calories: 520,
    prepTime: "20 min",
    cookTime: "15 min",
    servings: 2,
    difficulty: "Medium",
    category: "High Protein Dinner",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    description: "Tender homemade seitan strips marinated in lemongrass, turmeric, and garlic, grilled to perfection with a rich creamy peanut dipping sauce.",
    ingredients: [
      { name: "Vital Wheat Gluten (Seitan base)", amount: 200, unit: "g", category: "Protein & Chilled" },
      { name: "Nutritional Yeast", amount: 3, unit: "tbsp", category: "Pantry" },
      { name: "Vegetable Broth", amount: 150, unit: "ml", category: "Pantry" },
      { name: "Soy Sauce or Tamari", amount: 3, unit: "tbsp", category: "Pantry" },
      { name: "Smooth Peanut Butter", amount: 4, unit: "tbsp", category: "Pantry" },
      { name: "Coconut Milk", amount: 100, unit: "ml", category: "Pantry" },
      { name: "Fresh Garlic", amount: 3, unit: "cloves", category: "Produce" },
      { name: "Ginger Root", amount: 1, unit: "thumb", category: "Produce" },
      { name: "Ground Turmeric", amount: 1, unit: "tsp", category: "Spices" },
      { name: "Lime Juice", amount: 2, unit: "tbsp", category: "Produce" },
      { name: "Maple Syrup", amount: 1, unit: "tbsp", category: "Pantry" },
      { name: "Fresh Cilantro", amount: 1, unit: "bunch", category: "Produce" }
    ],
    instructions: [
      "Mix vital wheat gluten, nutritional yeast, and turmeric in a bowl.",
      "Add vegetable broth and 1 tbsp soy sauce. Knead for 3 minutes to develop gluten structure.",
      "Cut seitan into strips and steam for 15 minutes until firm.",
      "Whisk peanut butter, coconut milk, lime juice, maple syrup, remaining soy sauce, minced garlic and ginger.",
      "Thread seitan strips onto skewers and grill or pan-sear for 3-4 minutes per side until charred.",
      "Serve warm drizzled with peanut dip and fresh cilantro."
    ]
  },
  {
    id: "recipe-crispy-tofu-bowl",
    title: "Crispy Teriyaki Tofu & Edamame Power Bowl",
    proteinSource: "tofu",
    proteinGrams: 36,
    calories: 480,
    prepTime: "15 min",
    cookTime: "15 min",
    servings: 2,
    difficulty: "Easy",
    category: "Quick Lunch",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    description: "Golden air-fried extra firm tofu tossed in sweet teriyaki glaze over warm quinoa, steamed edamame, purple cabbage, and creamy avocado.",
    ingredients: [
      { name: "Extra Firm Tofu", amount: 400, unit: "g", category: "Protein & Chilled" },
      { name: "Shelled Edamame Beans", amount: 150, unit: "g", category: "Protein & Chilled" },
      { name: "Cornstarch", amount: 2, unit: "tbsp", category: "Pantry" },
      { name: "Cooked Quinoa", amount: 250, unit: "g", category: "Pantry" },
      { name: "Teriyaki Sauce", amount: 4, unit: "tbsp", category: "Pantry" },
      { name: "Shredded Purple Cabbage", amount: 1, unit: "cup", category: "Produce" },
      { name: "Ripe Avocado", amount: 1, unit: "whole", category: "Produce" },
      { name: "Sesame Oil", amount: 1, unit: "tbsp", category: "Pantry" },
      { name: "Toasted Sesame Seeds", amount: 1, unit: "tbsp", category: "Spices" },
      { name: "Green Onions", amount: 2, unit: "stalks", category: "Produce" }
    ],
    instructions: [
      "Press extra firm tofu with paper towels for 10 minutes to remove excess moisture. Cube into bite-sized pieces.",
      "Toss tofu cubes in cornstarch and sesame oil until evenly coated.",
      "Bake or air-fry at 200°C (400°F) for 15 minutes until crispy and golden.",
      "In a small skillet, warm teriyaki sauce and toss crispy tofu until glazed.",
      "Assemble bowls: quinoa base, glazed tofu, edamame, purple cabbage, and sliced avocado.",
      "Garnish with green onions and sesame seeds."
    ]
  },
  {
    id: "recipe-tempeh-blat",
    title: "Smoky Tempeh Bacon B.L.A.T. Avocado Wrap",
    proteinSource: "tempeh",
    proteinGrams: 32,
    calories: 490,
    prepTime: "10 min",
    cookTime: "10 min",
    servings: 2,
    difficulty: "Easy",
    category: "Lunch / On The Go",
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
    description: "Smoky maple-marinated tempeh strips pan-fried crisp, wrapped in whole grain tortillas with crisp romaine, ripe tomatoes, avocado, and spicy sriracha mayo.",
    ingredients: [
      { name: "Organic Tempeh Block", amount: 250, unit: "g", category: "Protein & Chilled" },
      { name: "Liquid Smoke", amount: 1, unit: "tsp", category: "Pantry" },
      { name: "Maple Syrup", amount: 1.5, unit: "tbsp", category: "Pantry" },
      { name: "Soy Sauce", amount: 2, unit: "tbsp", category: "Pantry" },
      { name: "Smoky Paprika", amount: 1, unit: "tsp", category: "Spices" },
      { name: "Whole Wheat Tortilla Wraps", amount: 2, unit: "large", category: "Pantry" },
      { name: "Ripe Avocado", amount: 1, unit: "whole", category: "Produce" },
      { name: "Roma Tomatoes", amount: 2, unit: "medium", category: "Produce" },
      { name: "Romaine Lettuce", amount: 1, unit: "head", category: "Produce" },
      { name: "Vegan Mayonnaise", amount: 2, unit: "tbsp", category: "Pantry" },
      { name: "Sriracha Sauce", amount: 1, unit: "tsp", category: "Pantry" }
    ],
    instructions: [
      "Thinly slice tempeh block into bacon-like strips.",
      "Whisk liquid smoke, maple syrup, soy sauce, and smoked paprika in a shallow bowl.",
      "Marinate tempeh strips for 5 minutes.",
      "Pan-fry in a lightly oiled skillet over medium-high heat for 3-4 minutes each side until caramelized and crispy.",
      "Mix vegan mayo with sriracha and spread over tortillas.",
      "Layer romaine, sliced tomatoes, avocado, and smoky tempeh bacon. Roll tightly and slice in half."
    ]
  },
  {
    id: "recipe-chickpea-curry",
    title: "Creamy Chickpea & Spinach Coconut Curry",
    proteinSource: "legumes",
    proteinGrams: 28,
    calories: 460,
    prepTime: "10 min",
    cookTime: "20 min",
    servings: 3,
    difficulty: "Easy",
    category: "Comfort Food",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    description: "Rich, fragrant Indian-inspired chickpea curry simmered in coconut milk, fire-roasted tomatoes, fresh baby spinach, and Garam Masala spices.",
    ingredients: [
      { name: "Canned Chickpeas (Garbanzo)", amount: 2, unit: "cans (800g)", category: "Pantry" },
      { name: "Full Fat Coconut Milk", amount: 1, unit: "can (400ml)", category: "Pantry" },
      { name: "Diced Tomatoes", amount: 1, unit: "can (400g)", category: "Pantry" },
      { name: "Baby Spinach", amount: 150, unit: "g", category: "Produce" },
      { name: "Yellow Onion", amount: 1, unit: "large", category: "Produce" },
      { name: "Garlic", amount: 4, unit: "cloves", category: "Produce" },
      { name: "Ginger Root", amount: 1, unit: "thumb", category: "Produce" },
      { name: "Garam Masala", amount: 1.5, unit: "tbsp", category: "Spices" },
      { name: "Ground Cumin", amount: 1, unit: "tsp", category: "Spices" },
      { name: "Yellow Curry Powder", amount: 1, unit: "tbsp", category: "Spices" },
      { name: "Basmati Rice", amount: 200, unit: "g", category: "Pantry" }
    ],
    instructions: [
      "Sauté diced yellow onion, garlic, and grated ginger in olive oil until soft and golden.",
      "Add Garam Masala, cumin, and yellow curry powder. Stir for 1 minute until fragrant.",
      "Pour in diced tomatoes, coconut milk, and drained chickpeas.",
      "Simmer on medium-low heat for 15 minutes until curry thickens.",
      "Stir in baby spinach until wilted.",
      "Serve hot with basmati rice or warm garlic naan bread."
    ]
  },
  {
    id: "recipe-lentil-bolognese",
    title: "Lentil & Walnut High-Protein Bolognese",
    proteinSource: "legumes",
    proteinGrams: 30,
    calories: 510,
    prepTime: "15 min",
    cookTime: "25 min",
    servings: 4,
    difficulty: "Easy",
    category: "Pasta",
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281318?auto=format&fit=crop&w=800&q=80",
    description: "Hearty Italian-style sauce packed with brown lentils, crushed walnuts, tomato passata, garlic, and fresh basil over high-protein lentil pasta.",
    ingredients: [
      { name: "Brown Lentils (dry)", amount: 200, unit: "g", category: "Pantry" },
      { name: "Raw Walnuts", amount: 80, unit: "g", category: "Pantry" },
      { name: "High-Protein Lentil Pasta", amount: 350, unit: "g", category: "Pantry" },
      { name: "Tomato Passata / Sauce", amount: 500, unit: "ml", category: "Pantry" },
      { name: "Tomato Paste", amount: 2, unit: "tbsp", category: "Pantry" },
      { name: "Carrots", amount: 2, unit: "medium", category: "Produce" },
      { name: "Celery Stalks", amount: 2, unit: "stalks", category: "Produce" },
      { name: "Yellow Onion", amount: 1, unit: "large", category: "Produce" },
      { name: "Garlic", amount: 4, unit: "cloves", category: "Produce" },
      { name: "Italian Herb Mix", amount: 1, unit: "tbsp", category: "Spices" },
      { name: "Nutritional Yeast", amount: 4, unit: "tbsp", category: "Pantry" }
    ],
    instructions: [
      "Finely chop onion, carrots, celery, garlic, and walnuts.",
      "Sauté onion, carrots, and celery in olive oil for 6 minutes. Add garlic and walnuts.",
      "Add rinsed lentils, tomato paste, tomato passata, Italian herbs, and 300ml vegetable broth.",
      "Cover and simmer for 20-25 minutes until lentils are tender.",
      "Boil high-protein lentil pasta according to package instructions.",
      "Toss pasta with hearty lentil bolognese and top with nutritional yeast."
    ]
  },
  {
    id: "recipe-seitan-steak",
    title: "Seitan Steak with Garlic Butter & Rosemary",
    proteinSource: "seitan",
    proteinGrams: 48,
    calories: 540,
    prepTime: "25 min",
    cookTime: "20 min",
    servings: 2,
    difficulty: "Advanced",
    category: "Gourmet Dinner",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80",
    description: "Rich, savory plant-based steak crafted from vital wheat gluten, black beans, and dark soy sauce, pan-basted with garlic herb butter.",
    ingredients: [
      { name: "Vital Wheat Gluten", amount: 220, unit: "g", category: "Protein & Chilled" },
      { name: "Canned Black Beans (mashed)", amount: 150, unit: "g", category: "Pantry" },
      { name: "Vegan Butter", amount: 3, unit: "tbsp", category: "Protein & Chilled" },
      { name: "Dark Soy Sauce", amount: 2, unit: "tbsp", category: "Pantry" },
      { name: "Onion Powder", amount: 1, unit: "tbsp", category: "Spices" },
      { name: "Garlic Powder", amount: 1, unit: "tbsp", category: "Spices" },
      { name: "Smoked Paprika", amount: 1, unit: "tsp", category: "Spices" },
      { name: "Vegetable Broth", amount: 180, unit: "ml", category: "Pantry" },
      { name: "Fresh Rosemary", amount: 3, unit: "sprigs", category: "Produce" },
      { name: "Fresh Garlic", amount: 4, unit: "cloves", category: "Produce" }
    ],
    instructions: [
      "Blend black beans, soy sauce, vegetable broth, garlic powder, onion powder, and paprika.",
      "Mix liquid into vital wheat gluten and knead into two steak shapes.",
      "Steam steaks in a steamer basket for 20 minutes.",
      "Melt vegan butter in a cast-iron skillet with smashed garlic cloves and rosemary sprigs.",
      "Sear steaks for 4 minutes per side, spooning hot garlic butter over top repeatedly.",
      "Rest 2 minutes and serve with roasted veggies or mashed potatoes."
    ]
  },
  {
    id: "recipe-tofu-scramble",
    title: "High-Protein Tofu Scramble with Spinach & Mushrooms",
    proteinSource: "tofu",
    proteinGrams: 30,
    calories: 380,
    prepTime: "10 min",
    cookTime: "10 min",
    servings: 2,
    difficulty: "Easy",
    category: "Breakfast / Brunch",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    description: "Fluffy savory tofu scramble seasoned with black salt (Kala Namak) for egg flavor, turmeric, sautéed cremini mushrooms, and fresh baby spinach.",
    ingredients: [
      { name: "Firm Tofu", amount: 400, unit: "g", category: "Protein & Chilled" },
      { name: "Cremini Mushrooms", amount: 150, unit: "g", category: "Produce" },
      { name: "Baby Spinach", amount: 100, unit: "g", category: "Produce" },
      { name: "Nutritional Yeast", amount: 3, unit: "tbsp", category: "Pantry" },
      { name: "Black Salt (Kala Namak)", amount: 0.5, unit: "tsp", category: "Spices" },
      { name: "Turmeric Powder", amount: 0.5, unit: "tsp", category: "Spices" },
      { name: "Olive Oil", amount: 1, unit: "tbsp", category: "Pantry" },
      { name: "Whole Grain Sourdough Bread", amount: 4, unit: "slices", category: "Pantry" },
      { name: "Cherry Tomatoes", amount: 150, unit: "g", category: "Produce" }
    ],
    instructions: [
      "Crumble firm tofu with hands into egg-like curds.",
      "Sauté sliced mushrooms and cherry tomatoes in olive oil for 4 minutes.",
      "Add crumbled tofu, turmeric, black salt, and nutritional yeast to the skillet.",
      "Cook for 5-6 minutes until tofu is hot and fragrant.",
      "Fold in fresh baby spinach until just wilted.",
      "Serve over toasted whole grain sourdough bread."
    ]
  },
  {
    id: "recipe-blackbean-quinoa",
    title: "Spiced Black Bean & Quinoa Fiesta Power Bowl",
    proteinSource: "grains",
    proteinGrams: 27,
    calories: 450,
    prepTime: "10 min",
    cookTime: "15 min",
    servings: 2,
    difficulty: "Easy",
    category: "Power Lunch",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    description: "Nutrient-packed bowl featuring fluffy quinoa, seasoned black beans, sweet corn, hemp seeds, fresh salsa, and lime cilantro dressing.",
    ingredients: [
      { name: "Black Beans (canned)", amount: 1, unit: "can (400g)", category: "Pantry" },
      { name: "Dry Quinoa", amount: 150, unit: "g", category: "Pantry" },
      { name: "Hemp Hearts / Seeds", amount: 3, unit: "tbsp", category: "Pantry" },
      { name: "Sweet Corn", amount: 150, unit: "g", category: "Pantry" },
      { name: "Lime", amount: 2, unit: "whole", category: "Produce" },
      { name: "Cilantro", amount: 1, unit: "bunch", category: "Produce" },
      { name: "Ground Cumin", amount: 1, unit: "tsp", category: "Spices" },
      { name: "Chili Powder", amount: 1, unit: "tsp", category: "Spices" },
      { name: "Ripe Avocado", amount: 1, unit: "whole", category: "Produce" }
    ],
    instructions: [
      "Cook quinoa in vegetable broth according to package instructions.",
      "Warm black beans with cumin, chili powder, and sea salt.",
      "Assemble bowl: cooked quinoa, spiced black beans, sweet corn, sliced avocado, and hemp seeds.",
      "Drizzle with fresh lime juice and top with chopped cilantro."
    ]
  }
];
