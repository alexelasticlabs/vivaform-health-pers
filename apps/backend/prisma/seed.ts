import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

const mealTemplates = [
  // ===== MEDITERRANEAN - BREAKFAST =====
  {
    name: "Greek Yogurt with Honey & Walnuts",
    category: "breakfast",
    dietPlans: ["mediterranean", "anti-inflammatory"],
    calories: 320,
    protein: 18,
    fat: 14,
    carbs: 32,
    cookingTimeMinutes: 5,
    complexity: "simple",
    allergens: ["dairy", "nuts"],
    avoidedIngredients: [],
    ingredients: ["Greek yogurt", "Honey", "Walnuts", "Berries"],
    instructions: "Mix yogurt with honey, top with walnuts and fresh berries."
  },
  {
    name: "Mediterranean Omelette",
    category: "breakfast",
    dietPlans: ["mediterranean"],
    calories: 280,
    protein: 22,
    fat: 18,
    carbs: 8,
    cookingTimeMinutes: 10,
    complexity: "simple",
    allergens: ["eggs", "dairy"],
    avoidedIngredients: [],
    ingredients: ["Eggs", "Feta cheese", "Tomatoes", "Spinach", "Olive oil"],
    instructions: "Whisk eggs, cook with vegetables and feta in olive oil."
  },
  {
    name: "Avocado Toast with Poached Egg",
    category: "breakfast",
    dietPlans: ["mediterranean", "anti-inflammatory"],
    calories: 350,
    protein: 14,
    fat: 20,
    carbs: 30,
    cookingTimeMinutes: 10,
    complexity: "medium",
    allergens: ["eggs", "gluten"],
    avoidedIngredients: [],
    ingredients: ["Whole grain bread", "Avocado", "Eggs", "Cherry tomatoes", "Olive oil"],
    instructions: "Toast bread, mash avocado, top with poached egg and tomatoes."
  },

  // ===== MEDITERRANEAN - LUNCH =====
  {
    name: "Grilled Chicken Salad",
    category: "lunch",
    dietPlans: ["mediterranean", "anti-inflammatory"],
    calories: 420,
    protein: 38,
    fat: 18,
    carbs: 28,
    cookingTimeMinutes: 20,
    complexity: "medium",
    allergens: [],
    avoidedIngredients: [],
    ingredients: ["Chicken breast", "Mixed greens", "Cucumber", "Tomatoes", "Olive oil", "Lemon", "Chickpeas"],
    instructions: "Grill chicken, toss with greens and vegetables, dress with olive oil and lemon."
  },
  {
    name: "Salmon with Quinoa & Vegetables",
    category: "lunch",
    dietPlans: ["mediterranean", "anti-inflammatory"],
    calories: 480,
    protein: 36,
    fat: 22,
    carbs: 38,
    cookingTimeMinutes: 25,
    complexity: "medium",
    allergens: ["fish"],
    avoidedIngredients: [],
    ingredients: ["Salmon fillet", "Quinoa", "Broccoli", "Bell peppers", "Olive oil", "Garlic"],
    instructions: "Bake salmon, cook quinoa, steam vegetables, combine with olive oil."
  },
  {
    name: "Lentil & Vegetable Soup",
    category: "lunch",
    dietPlans: ["mediterranean", "anti-inflammatory"],
    calories: 340,
    protein: 18,
    fat: 8,
    carbs: 52,
    cookingTimeMinutes: 35,
    complexity: "simple",
    allergens: [],
    avoidedIngredients: ["meat"],
    ingredients: ["Red lentils", "Carrots", "Celery", "Onion", "Tomatoes", "Vegetable broth", "Spices"],
    instructions: "Sauté vegetables, add lentils and broth, simmer 25 minutes."
  },

  // ===== MEDITERRANEAN - DINNER =====
  {
    name: "Mediterranean Baked Fish",
    category: "dinner",
    dietPlans: ["mediterranean", "anti-inflammatory"],
    calories: 380,
    protein: 42,
    fat: 16,
    carbs: 18,
    cookingTimeMinutes: 30,
    complexity: "medium",
    allergens: ["fish"],
    avoidedIngredients: [],
    ingredients: ["White fish", "Tomatoes", "Olives", "Capers", "Olive oil", "Garlic", "Herbs"],
    instructions: "Place fish in baking dish, top with tomatoes and olives, bake at 180°C for 25 min."
  },
  {
    name: "Chicken Souvlaki with Tzatziki",
    category: "dinner",
    dietPlans: ["mediterranean"],
    calories: 450,
    protein: 44,
    fat: 20,
    carbs: 26,
    cookingTimeMinutes: 25,
    complexity: "medium",
    allergens: ["dairy"],
    avoidedIngredients: [],
    ingredients: ["Chicken breast", "Greek yogurt", "Cucumber", "Garlic", "Lemon", "Pita bread", "Spices"],
    instructions: "Marinate and grill chicken, prepare tzatziki sauce, serve with pita."
  },

  // ===== CARNIVORE - BREAKFAST =====
  {
    name: "Ribeye Steak with Eggs",
    category: "breakfast",
    dietPlans: ["carnivore"],
    calories: 620,
    protein: 54,
    fat: 44,
    carbs: 2,
    cookingTimeMinutes: 15,
    complexity: "simple",
    allergens: ["eggs"],
    avoidedIngredients: [],
    ingredients: ["Ribeye steak", "Eggs", "Butter", "Salt"],
    instructions: "Pan-sear steak in butter, fry eggs in same pan."
  },
  {
    name: "Bacon & Sausage Breakfast",
    category: "breakfast",
    dietPlans: ["carnivore"],
    calories: 580,
    protein: 38,
    fat: 48,
    carbs: 0,
    cookingTimeMinutes: 12,
    complexity: "simple",
    allergens: [],
    avoidedIngredients: [],
    ingredients: ["Bacon strips", "Pork sausages", "Butter"],
    instructions: "Cook bacon and sausages in butter until crispy."
  },

  // ===== CARNIVORE - LUNCH =====
  {
    name: "Grilled Beef Burger Patties",
    category: "lunch",
    dietPlans: ["carnivore"],
    calories: 540,
    protein: 46,
    fat: 38,
    carbs: 0,
    cookingTimeMinutes: 15,
    complexity: "simple",
    allergens: [],
    avoidedIngredients: [],
    ingredients: ["Ground beef", "Salt", "Butter"],
    instructions: "Form patties, grill or pan-fry in butter."
  },
  {
    name: "Grilled Chicken Thighs",
    category: "lunch",
    dietPlans: ["carnivore"],
    calories: 480,
    protein: 42,
    fat: 34,
    carbs: 0,
    cookingTimeMinutes: 20,
    complexity: "simple",
    allergens: [],
    avoidedIngredients: [],
    ingredients: ["Chicken thighs", "Salt", "Butter"],
    instructions: "Season chicken, grill or bake until cooked through."
  },

  // ===== CARNIVORE - DINNER =====
  {
    name: "Pan-Seared Lamb Chops",
    category: "dinner",
    dietPlans: ["carnivore"],
    calories: 580,
    protein: 48,
    fat: 42,
    carbs: 0,
    cookingTimeMinutes: 15,
    complexity: "medium",
    allergens: [],
    avoidedIngredients: [],
    ingredients: ["Lamb chops", "Butter", "Salt"],
    instructions: "Sear lamb chops in hot pan with butter, 3-4 minutes per side."
  },
  {
    name: "Salmon Steak with Butter",
    category: "dinner",
    dietPlans: ["carnivore"],
    calories: 520,
    protein: 44,
    fat: 38,
    carbs: 0,
    cookingTimeMinutes: 12,
    complexity: "simple",
    allergens: ["fish"],
    avoidedIngredients: [],
    ingredients: ["Salmon steak", "Butter", "Salt"],
    instructions: "Pan-fry salmon in butter until cooked through."
  },

  // ===== ANTI-INFLAMMATORY - BREAKFAST =====
  {
    name: "Berry Smoothie Bowl",
    category: "breakfast",
    dietPlans: ["anti-inflammatory"],
    calories: 290,
    protein: 12,
    fat: 8,
    carbs: 48,
    cookingTimeMinutes: 5,
    complexity: "simple",
    allergens: [],
    avoidedIngredients: ["dairy"],
    ingredients: ["Mixed berries", "Banana", "Almond milk", "Chia seeds", "Flaxseeds"],
    instructions: "Blend berries with almond milk, top with seeds."
  },
  {
    name: "Turmeric Scrambled Eggs",
    category: "breakfast",
    dietPlans: ["anti-inflammatory"],
    calories: 260,
    protein: 18,
    fat: 18,
    carbs: 6,
    cookingTimeMinutes: 8,
    complexity: "simple",
    allergens: ["eggs"],
    avoidedIngredients: [],
    ingredients: ["Eggs", "Turmeric", "Black pepper", "Olive oil", "Spinach"],
    instructions: "Scramble eggs with turmeric and spinach in olive oil."
  },

  // ===== ANTI-INFLAMMATORY - LUNCH =====
  {
    name: "Ginger Chicken Stir-Fry",
    category: "lunch",
    dietPlans: ["anti-inflammatory"],
    calories: 410,
    protein: 36,
    fat: 16,
    carbs: 34,
    cookingTimeMinutes: 20,
    complexity: "medium",
    allergens: [],
    avoidedIngredients: [],
    ingredients: ["Chicken breast", "Ginger", "Broccoli", "Bell peppers", "Brown rice", "Olive oil", "Garlic"],
    instructions: "Stir-fry chicken with ginger and vegetables, serve over brown rice."
  },
  {
    name: "Turmeric Lentil Bowl",
    category: "lunch",
    dietPlans: ["anti-inflammatory"],
    calories: 380,
    protein: 20,
    fat: 12,
    carbs: 52,
    cookingTimeMinutes: 30,
    complexity: "simple",
    allergens: [],
    avoidedIngredients: ["meat"],
    ingredients: ["Red lentils", "Turmeric", "Coconut milk", "Spinach", "Sweet potato", "Onion"],
    instructions: "Cook lentils with turmeric and coconut milk, add sweet potato and spinach."
  },

  // ===== ANTI-INFLAMMATORY - DINNER =====
  {
    name: "Baked Salmon with Sweet Potato",
    category: "dinner",
    dietPlans: ["anti-inflammatory"],
    calories: 460,
    protein: 38,
    fat: 20,
    carbs: 36,
    cookingTimeMinutes: 35,
    complexity: "simple",
    allergens: ["fish"],
    avoidedIngredients: [],
    ingredients: ["Salmon fillet", "Sweet potato", "Olive oil", "Rosemary", "Garlic"],
    instructions: "Bake salmon and sweet potato with olive oil and herbs at 180°C."
  },
  {
    name: "Green Curry with Vegetables",
    category: "dinner",
    dietPlans: ["anti-inflammatory"],
    calories: 390,
    protein: 14,
    fat: 18,
    carbs: 48,
    cookingTimeMinutes: 25,
    complexity: "medium",
    allergens: [],
    avoidedIngredients: ["meat", "dairy"],
    ingredients: ["Coconut milk", "Green curry paste", "Tofu", "Broccoli", "Bell peppers", "Brown rice"],
    instructions: "Simmer vegetables and tofu in coconut curry, serve over rice."
  },

  // ===== UNIVERSAL SNACKS =====
  {
    name: "Apple with Almond Butter",
    category: "snack",
    dietPlans: ["mediterranean", "anti-inflammatory"],
    calories: 180,
    protein: 6,
    fat: 10,
    carbs: 20,
    cookingTimeMinutes: 2,
    complexity: "simple",
    allergens: ["nuts"],
    avoidedIngredients: [],
    ingredients: ["Apple", "Almond butter"],
    instructions: "Slice apple, serve with almond butter."
  },
  {
    name: "Boiled Eggs",
    category: "snack",
    dietPlans: ["mediterranean", "carnivore", "anti-inflammatory"],
    calories: 140,
    protein: 12,
    fat: 10,
    carbs: 2,
    cookingTimeMinutes: 10,
    complexity: "simple",
    allergens: ["eggs"],
    avoidedIngredients: [],
    ingredients: ["Eggs"],
    instructions: "Boil eggs for 8-10 minutes, cool and peel."
  },
  {
    name: "Mixed Nuts",
    category: "snack",
    dietPlans: ["mediterranean", "anti-inflammatory"],
    calories: 170,
    protein: 6,
    fat: 15,
    carbs: 6,
    cookingTimeMinutes: 0,
    complexity: "simple",
    allergens: ["nuts"],
    avoidedIngredients: [],
    ingredients: ["Almonds", "Walnuts", "Cashews"],
    instructions: "Portion out 30g of mixed nuts."
  },
  {
    name: "Beef Jerky",
    category: "snack",
    dietPlans: ["carnivore"],
    calories: 160,
    protein: 26,
    fat: 6,
    carbs: 2,
    cookingTimeMinutes: 0,
    complexity: "simple",
    allergens: [],
    avoidedIngredients: [],
    ingredients: ["Beef jerky"],
    instructions: "Portion 50g of beef jerky."
  },
  {
    name: "Cucumber & Hummus",
    category: "snack",
    dietPlans: ["mediterranean", "anti-inflammatory"],
    calories: 120,
    protein: 4,
    fat: 6,
    carbs: 14,
    cookingTimeMinutes: 3,
    complexity: "simple",
    allergens: [],
    avoidedIngredients: ["meat"],
    ingredients: ["Cucumber", "Hummus"],
    instructions: "Slice cucumber, serve with hummus."
  }
];

async function main() {
  console.log("🌱 Starting seed...");

  // Create test admin user if not exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@vivaform.com" }
  });

  if (!existingAdmin) {
    const passwordHash = await argon2.hash("admin123");
    const admin = await prisma.user.create({
      data: {
        email: "admin@vivaform.com",
        passwordHash,
        name: "Admin User",
        role: "ADMIN",
        tier: "PREMIUM"
      }
    });
    console.log("✅ Created admin user:", admin.email);
  }

  // Create test regular user if not exists
  const existingUser = await prisma.user.findUnique({
    where: { email: "test@vivaform.com" }
  });

  if (!existingUser) {
    const passwordHash = await argon2.hash("test123");
    const user = await prisma.user.create({
      data: {
        email: "test@vivaform.com",
        passwordHash,
        name: "Test User",
        role: "USER",
        tier: "FREE"
      }
    });
    console.log("✅ Created test user:", user.email);
  }

  // Clear existing meal templates
  await prisma.mealTemplate.deleteMany();
  console.log("🗑️  Cleared existing meal templates");

  // Insert meal templates
  for (const template of mealTemplates) {
    await prisma.mealTemplate.create({
      data: template
    });
  }

  console.log(`✅ Created ${mealTemplates.length} meal templates`);
  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
