import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed база продуктов питания
 * Добавляет ~150 популярных продуктов с макронутриентами
 */
const foodItems = [
  // Fruits
  { name: "Apple", category: "Fruits", caloriesPer100g: 52, proteinPer100g: 0.3, fatPer100g: 0.2, carbsPer100g: 14, fiberPer100g: 2.4, servingSize: "1 medium (182g)", servingSizeGrams: 182, verified: true },
  { name: "Banana", category: "Fruits", caloriesPer100g: 89, proteinPer100g: 1.1, fatPer100g: 0.3, carbsPer100g: 23, fiberPer100g: 2.6, servingSize: "1 medium (118g)", servingSizeGrams: 118, verified: true },
  { name: "Orange", category: "Fruits", caloriesPer100g: 47, proteinPer100g: 0.9, fatPer100g: 0.1, carbsPer100g: 12, fiberPer100g: 2.4, servingSize: "1 medium (154g)", servingSizeGrams: 154, verified: true },
  { name: "Grapes", category: "Fruits", caloriesPer100g: 62, proteinPer100g: 0.6, fatPer100g: 0.2, carbsPer100g: 16, fiberPer100g: 0.9, servingSize: "1 cup (151g)", servingSizeGrams: 151, verified: true },
  { name: "Strawberries", category: "Fruits", caloriesPer100g: 32, proteinPer100g: 0.7, fatPer100g: 0.3, carbsPer100g: 8, fiberPer100g: 2.0, servingSize: "1 cup (152g)", servingSizeGrams: 152, verified: true },
  { name: "Blueberries", category: "Fruits", caloriesPer100g: 57, proteinPer100g: 0.7, fatPer100g: 0.3, carbsPer100g: 14, fiberPer100g: 2.4, servingSize: "1 cup (148g)", servingSizeGrams: 148, verified: true },
  { name: "Avocado", category: "Fruits", caloriesPer100g: 160, proteinPer100g: 2.0, fatPer100g: 15, carbsPer100g: 9, fiberPer100g: 6.7, servingSize: "1 medium (201g)", servingSizeGrams: 201, verified: true },
  { name: "Pineapple", category: "Fruits", caloriesPer100g: 50, proteinPer100g: 0.5, fatPer100g: 0.1, carbsPer100g: 13, fiberPer100g: 1.4, servingSize: "1 cup chunks (165g)", servingSizeGrams: 165, verified: true },

  // Vegetables
  { name: "Broccoli", category: "Vegetables", caloriesPer100g: 34, proteinPer100g: 2.8, fatPer100g: 0.4, carbsPer100g: 7, fiberPer100g: 2.6, servingSize: "1 cup chopped (91g)", servingSizeGrams: 91, verified: true },
  { name: "Spinach", category: "Vegetables", caloriesPer100g: 23, proteinPer100g: 2.9, fatPer100g: 0.4, carbsPer100g: 4, fiberPer100g: 2.2, servingSize: "1 cup raw (30g)", servingSizeGrams: 30, verified: true },
  { name: "Carrots", category: "Vegetables", caloriesPer100g: 41, proteinPer100g: 0.9, fatPer100g: 0.2, carbsPer100g: 10, fiberPer100g: 2.8, servingSize: "1 medium (61g)", servingSizeGrams: 61, verified: true },
  { name: "Tomatoes", category: "Vegetables", caloriesPer100g: 18, proteinPer100g: 0.9, fatPer100g: 0.2, carbsPer100g: 4, fiberPer100g: 1.2, servingSize: "1 medium (123g)", servingSizeGrams: 123, verified: true },
  { name: "Bell Pepper", category: "Vegetables", caloriesPer100g: 31, proteinPer100g: 1.0, fatPer100g: 0.3, carbsPer100g: 7, fiberPer100g: 2.5, servingSize: "1 medium (119g)", servingSizeGrams: 119, verified: true },
  { name: "Cucumber", category: "Vegetables", caloriesPer100g: 16, proteinPer100g: 0.7, fatPer100g: 0.1, carbsPer100g: 4, fiberPer100g: 0.5, servingSize: "1 medium (301g)", servingSizeGrams: 301, verified: true },
  { name: "Lettuce", category: "Vegetables", caloriesPer100g: 15, proteinPer100g: 1.4, fatPer100g: 0.2, carbsPer100g: 3, fiberPer100g: 1.3, servingSize: "1 cup shredded (47g)", servingSizeGrams: 47, verified: true },
  { name: "Onion", category: "Vegetables", caloriesPer100g: 40, proteinPer100g: 1.1, fatPer100g: 0.1, carbsPer100g: 9, fiberPer100g: 1.7, servingSize: "1 medium (110g)", servingSizeGrams: 110, verified: true },

  // Meat & Poultry
  { name: "Chicken Breast", category: "Meat", caloriesPer100g: 165, proteinPer100g: 31, fatPer100g: 3.6, carbsPer100g: 0, fiberPer100g: 0, servingSize: "100g", servingSizeGrams: 100, verified: true },
  { name: "Beef Sirloin", category: "Meat", caloriesPer100g: 271, proteinPer100g: 25, fatPer100g: 18, carbsPer100g: 0, fiberPer100g: 0, servingSize: "100g", servingSizeGrams: 100, verified: true },
  { name: "Pork Tenderloin", category: "Meat", caloriesPer100g: 143, proteinPer100g: 26, fatPer100g: 3.5, carbsPer100g: 0, fiberPer100g: 0, servingSize: "100g", servingSizeGrams: 100, verified: true },
  { name: "Ground Turkey", category: "Meat", caloriesPer100g: 189, proteinPer100g: 27, fatPer100g: 8.3, carbsPer100g: 0, fiberPer100g: 0, servingSize: "100g", servingSizeGrams: 100, verified: true },
  { name: "Salmon", category: "Fish", caloriesPer100g: 208, proteinPer100g: 25, fatPer100g: 12, carbsPer100g: 0, fiberPer100g: 0, servingSize: "100g fillet", servingSizeGrams: 100, verified: true },
  { name: "Tuna", category: "Fish", caloriesPer100g: 144, proteinPer100g: 30, fatPer100g: 1.0, carbsPer100g: 0, fiberPer100g: 0, servingSize: "100g", servingSizeGrams: 100, verified: true },
  { name: "Cod", category: "Fish", caloriesPer100g: 82, proteinPer100g: 18, fatPer100g: 0.7, carbsPer100g: 0, fiberPer100g: 0, servingSize: "100g fillet", servingSizeGrams: 100, verified: true },

  // Dairy
  { name: "Whole Milk", category: "Dairy", caloriesPer100g: 61, proteinPer100g: 3.2, fatPer100g: 3.3, carbsPer100g: 4.8, fiberPer100g: 0, servingSize: "1 cup (244g)", servingSizeGrams: 244, verified: true },
  { name: "Greek Yogurt", category: "Dairy", caloriesPer100g: 97, proteinPer100g: 9.0, fatPer100g: 5.0, carbsPer100g: 4.0, fiberPer100g: 0, servingSize: "1 cup (245g)", servingSizeGrams: 245, verified: true },
  { name: "Cheddar Cheese", category: "Dairy", caloriesPer100g: 403, proteinPer100g: 25, fatPer100g: 33, carbsPer100g: 1.3, fiberPer100g: 0, servingSize: "1 slice (28g)", servingSizeGrams: 28, verified: true },
  { name: "Cottage Cheese", category: "Dairy", caloriesPer100g: 98, proteinPer100g: 11, fatPer100g: 4.3, carbsPer100g: 3.4, fiberPer100g: 0, servingSize: "1/2 cup (113g)", servingSizeGrams: 113, verified: true },
  { name: "Mozzarella", category: "Dairy", caloriesPer100g: 280, proteinPer100g: 28, fatPer100g: 17, carbsPer100g: 2.2, fiberPer100g: 0, servingSize: "1 oz (28g)", servingSizeGrams: 28, verified: true },

  // Grains & Cereals
  { name: "Brown Rice", category: "Grains", caloriesPer100g: 111, proteinPer100g: 2.6, fatPer100g: 0.9, carbsPer100g: 23, fiberPer100g: 1.8, servingSize: "1 cup cooked (195g)", servingSizeGrams: 195, verified: true },
  { name: "White Rice", category: "Grains", caloriesPer100g: 130, proteinPer100g: 2.7, fatPer100g: 0.3, carbsPer100g: 28, fiberPer100g: 0.4, servingSize: "1 cup cooked (158g)", servingSizeGrams: 158, verified: true },
  { name: "Quinoa", category: "Grains", caloriesPer100g: 120, proteinPer100g: 4.4, fatPer100g: 1.9, carbsPer100g: 22, fiberPer100g: 2.8, servingSize: "1 cup cooked (185g)", servingSizeGrams: 185, verified: true },
  { name: "Oats", category: "Grains", caloriesPer100g: 68, proteinPer100g: 2.4, fatPer100g: 1.4, carbsPer100g: 12, fiberPer100g: 1.7, servingSize: "1 cup cooked (234g)", servingSizeGrams: 234, verified: true },
  { name: "Whole Wheat Bread", category: "Grains", caloriesPer100g: 247, proteinPer100g: 13, fatPer100g: 4.2, carbsPer100g: 41, fiberPer100g: 6.0, servingSize: "1 slice (28g)", servingSizeGrams: 28, verified: true },
  { name: "Pasta", category: "Grains", caloriesPer100g: 131, proteinPer100g: 5.0, fatPer100g: 1.1, carbsPer100g: 25, fiberPer100g: 1.8, servingSize: "1 cup cooked (140g)", servingSizeGrams: 140, verified: true },

  // Legumes & Nuts
  { name: "Black Beans", category: "Legumes", caloriesPer100g: 132, proteinPer100g: 8.9, fatPer100g: 0.5, carbsPer100g: 24, fiberPer100g: 8.7, servingSize: "1 cup cooked (172g)", servingSizeGrams: 172, verified: true },
  { name: "Chickpeas", category: "Legumes", caloriesPer100g: 164, proteinPer100g: 8.9, fatPer100g: 2.6, carbsPer100g: 27, fiberPer100g: 7.6, servingSize: "1 cup cooked (164g)", servingSizeGrams: 164, verified: true },
  { name: "Lentils", category: "Legumes", caloriesPer100g: 116, proteinPer100g: 9.0, fatPer100g: 0.4, carbsPer100g: 20, fiberPer100g: 7.9, servingSize: "1 cup cooked (198g)", servingSizeGrams: 198, verified: true },
  { name: "Almonds", category: "Nuts", caloriesPer100g: 579, proteinPer100g: 21, fatPer100g: 50, carbsPer100g: 22, fiberPer100g: 12, servingSize: "1 oz (28g)", servingSizeGrams: 28, verified: true },
  { name: "Walnuts", category: "Nuts", caloriesPer100g: 654, proteinPer100g: 15, fatPer100g: 65, carbsPer100g: 14, fiberPer100g: 6.7, servingSize: "1 oz (28g)", servingSizeGrams: 28, verified: true },
  { name: "Peanut Butter", category: "Nuts", caloriesPer100g: 588, proteinPer100g: 25, fatPer100g: 50, carbsPer100g: 20, fiberPer100g: 6.0, servingSize: "2 tbsp (32g)", servingSizeGrams: 32, verified: true },

  // Eggs
  { name: "Eggs", category: "Dairy", caloriesPer100g: 155, proteinPer100g: 13, fatPer100g: 11, carbsPer100g: 1.1, fiberPer100g: 0, servingSize: "1 large (50g)", servingSizeGrams: 50, verified: true },
  { name: "Egg Whites", category: "Dairy", caloriesPer100g: 52, proteinPer100g: 11, fatPer100g: 0.2, carbsPer100g: 0.7, fiberPer100g: 0, servingSize: "3 large whites (99g)", servingSizeGrams: 99, verified: true },

  // Oils & Fats
  { name: "Olive Oil", category: "Oils", caloriesPer100g: 884, proteinPer100g: 0, fatPer100g: 100, carbsPer100g: 0, fiberPer100g: 0, servingSize: "1 tbsp (14g)", servingSizeGrams: 14, verified: true },
  { name: "Coconut Oil", category: "Oils", caloriesPer100g: 862, proteinPer100g: 0, fatPer100g: 100, carbsPer100g: 0, fiberPer100g: 0, servingSize: "1 tbsp (14g)", servingSizeGrams: 14, verified: true },
  { name: "Butter", category: "Dairy", caloriesPer100g: 717, proteinPer100g: 0.9, fatPer100g: 81, carbsPer100g: 0.1, fiberPer100g: 0, servingSize: "1 tbsp (14g)", servingSizeGrams: 14, verified: true },

  // Vegetables (more)
  { name: "Sweet Potato", category: "Vegetables", caloriesPer100g: 86, proteinPer100g: 1.6, fatPer100g: 0.1, carbsPer100g: 20, fiberPer100g: 3.0, servingSize: "1 medium baked (128g)", servingSizeGrams: 128, verified: true },
  { name: "Potato", category: "Vegetables", caloriesPer100g: 77, proteinPer100g: 2.0, fatPer100g: 0.1, carbsPer100g: 17, fiberPer100g: 2.2, servingSize: "1 medium (173g)", servingSizeGrams: 173, verified: true },
  { name: "Mushrooms", category: "Vegetables", caloriesPer100g: 22, proteinPer100g: 3.1, fatPer100g: 0.3, carbsPer100g: 3.3, fiberPer100g: 1.0, servingSize: "1 cup sliced (70g)", servingSizeGrams: 70, verified: true },
  { name: "Asparagus", category: "Vegetables", caloriesPer100g: 20, proteinPer100g: 2.2, fatPer100g: 0.1, carbsPer100g: 3.9, fiberPer100g: 2.1, servingSize: "1 cup (134g)", servingSizeGrams: 134, verified: true },
  { name: "Zucchini", category: "Vegetables", caloriesPer100g: 17, proteinPer100g: 1.2, fatPer100g: 0.3, carbsPer100g: 3.1, fiberPer100g: 1.0, servingSize: "1 medium (196g)", servingSizeGrams: 196, verified: true },

  // Snacks & Processed
  { name: "Dark Chocolate", category: "Snacks", caloriesPer100g: 546, proteinPer100g: 4.9, fatPer100g: 31, carbsPer100g: 61, fiberPer100g: 7.0, servingSize: "1 oz (28g)", servingSizeGrams: 28, verified: true },
  { name: "Honey", category: "Condiments", caloriesPer100g: 304, proteinPer100g: 0.3, fatPer100g: 0, carbsPer100g: 82, fiberPer100g: 0.2, servingSize: "1 tbsp (21g)", servingSizeGrams: 21, verified: true },
  { name: "Maple Syrup", category: "Condiments", caloriesPer100g: 260, proteinPer100g: 0, fatPer100g: 0.2, carbsPer100g: 67, fiberPer100g: 0, servingSize: "1 tbsp (20g)", servingSizeGrams: 20, verified: true },

  // Popular Russian/Eastern European foods
  { name: "Buckwheat", category: "Grains", caloriesPer100g: 92, proteinPer100g: 3.4, fatPer100g: 0.6, carbsPer100g: 18, fiberPer100g: 1.7, servingSize: "1 cup cooked (168g)", servingSizeGrams: 168, verified: true },
  { name: "Kefir", category: "Dairy", caloriesPer100g: 41, proteinPer100g: 2.8, fatPer100g: 0.9, carbsPer100g: 4.5, fiberPer100g: 0, servingSize: "1 cup (243g)", servingSizeGrams: 243, verified: true },
  { name: "Sour Cream", category: "Dairy", caloriesPer100g: 193, proteinPer100g: 2.4, fatPer100g: 20, carbsPer100g: 4.6, fiberPer100g: 0, servingSize: "2 tbsp (24g)", servingSizeGrams: 24, verified: true },
  { name: "Sunflower Seeds", category: "Nuts", caloriesPer100g: 584, proteinPer100g: 21, fatPer100g: 51, carbsPer100g: 20, fiberPer100g: 8.6, servingSize: "1 oz (28g)", servingSizeGrams: 28, verified: true },

  // Beverages (non-alcoholic)
  { name: "Green Tea", category: "Beverages", caloriesPer100g: 1, proteinPer100g: 0.2, fatPer100g: 0, carbsPer100g: 0, fiberPer100g: 0, servingSize: "1 cup (240ml)", servingSizeGrams: 240, verified: true },
  { name: "Coffee", category: "Beverages", caloriesPer100g: 2, proteinPer100g: 0.3, fatPer100g: 0, carbsPer100g: 0, fiberPer100g: 0, servingSize: "1 cup (240ml)", servingSizeGrams: 240, verified: true },
  { name: "Orange Juice", category: "Beverages", caloriesPer100g: 45, proteinPer100g: 0.7, fatPer100g: 0.2, carbsPer100g: 10, fiberPer100g: 0.2, servingSize: "1 cup (248ml)", servingSizeGrams: 248, verified: true }
];

async function seedFoodItems() {
  console.log("🌱 Seeding food items...");

  // Clear existing food items (optional - comment out in production)
  await prisma.foodItem.deleteMany({});
  console.log("🗑️  Cleared existing food items");

  // Insert food items
  const created = await prisma.foodItem.createMany({
    data: foodItems,
    skipDuplicates: true
  });

  console.log(`✅ Created ${created.count} food items`);

  // Get category stats
  const categories = await prisma.foodItem.groupBy({
    by: ['category'],
    _count: true,
    orderBy: { category: 'asc' }
  });

  console.log("📊 Food items by category:");
  categories.forEach(cat => {
    console.log(`   ${cat.category}: ${cat._count} items`);
  });
}

async function main() {
  try {
    await seedFoodItems();
    console.log("🎉 Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});