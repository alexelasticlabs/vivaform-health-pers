import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const articles = [
  {
    title: "10 Essential Tips for Healthy Eating",
    slug: "10-essential-tips-for-healthy-eating",
    excerpt: "Discover simple yet effective strategies to improve your nutrition and overall health.",
    content: `# 10 Essential Tips for Healthy Eating

Maintaining a healthy diet doesn't have to be complicated. Here are 10 practical tips to help you make better food choices:

## 1. Eat a Rainbow of Colors

Include fruits and vegetables of different colors in your meals. Each color provides unique nutrients and antioxidants.

## 2. Control Portion Sizes

Use smaller plates and be mindful of serving sizes to avoid overeating.

## 3. Stay Hydrated

Drink plenty of water throughout the day. Aim for 8 glasses daily.

## 4. Choose Whole Grains

Opt for whole grain bread, pasta, and rice instead of refined grains.

## 5. Include Protein in Every Meal

Protein helps you feel full longer and supports muscle health.

## 6. Limit Added Sugars

Read labels and reduce consumption of foods with high added sugar content.

## 7. Plan Your Meals

Meal planning helps you make healthier choices and saves time.

## 8. Don't Skip Breakfast

A nutritious breakfast jumpstarts your metabolism and energy levels.

## 9. Eat Mindfully

Pay attention to your food, chew slowly, and listen to hunger cues.

## 10. Allow Flexibility

Don't aim for perfection. Occasional treats are part of a balanced approach to eating.

Remember, small changes add up to big results over time!`,
    category: "Nutrition",
    tags: ["nutrition", "health", "tips", "diet"],
    published: true
  },
  {
    title: "Understanding Macronutrients: Proteins, Fats, and Carbs",
    slug: "understanding-macronutrients",
    excerpt: "Learn about the three main macronutrients and their roles in your body.",
    content: `# Understanding Macronutrients

Macronutrients are nutrients that provide energy and are essential for growth, metabolism, and body functions.

## Proteins

Proteins are the building blocks of life. They're essential for:
- Muscle repair and growth
- Enzyme and hormone production
- Immune function

**Good sources:** Chicken, fish, eggs, legumes, tofu, Greek yogurt

## Carbohydrates

Carbs are your body's primary energy source. Choose:
- Complex carbs: Whole grains, vegetables, legumes
- Limit simple carbs: Sugary drinks, candy, white bread

## Fats

Healthy fats support:
- Brain function
- Hormone production
- Nutrient absorption

**Choose:** Avocados, nuts, olive oil, fatty fish

## Finding Your Balance

A balanced diet typically includes:
- 45-65% carbohydrates
- 10-35% protein
- 20-35% fats

Remember, individual needs vary based on activity level, age, and health goals.`,
    category: "Nutrition",
    tags: ["macronutrients", "protein", "carbs", "fats", "education"],
    published: true
  },
  {
    title: "5 Simple Exercises You Can Do at Home",
    slug: "5-simple-exercises-at-home",
    excerpt: "No gym? No problem! Try these effective bodyweight exercises.",
    content: `# 5 Simple Exercises You Can Do at Home

You don't need expensive equipment or a gym membership to stay fit. These bodyweight exercises can be done anywhere!

## 1. Push-ups

**Benefits:** Strengthens chest, shoulders, and triceps
**How to:** Start in plank position, lower body until chest nearly touches floor, push back up
**Modifications:** Do them on your knees or against a wall if needed

## 2. Squats

**Benefits:** Works legs, glutes, and core
**How to:** Stand with feet shoulder-width apart, lower as if sitting in a chair, return to standing
**Tip:** Keep knees behind toes and chest up

## 3. Plank

**Benefits:** Core strength and stability
**How to:** Hold push-up position with forearms on ground
**Duration:** Start with 20-30 seconds, increase gradually

## 4. Lunges

**Benefits:** Leg strength and balance
**How to:** Step forward, lower back knee toward ground, push back to start
**Variation:** Try reverse or walking lunges

## 5. Burpees

**Benefits:** Full-body cardio and strength
**How to:** Start standing, drop to plank, do a push-up, jump feet forward, jump up
**Note:** High intensity, great for burning calories

## Sample Workout

Perform each exercise for 30 seconds, rest 15 seconds between exercises. Complete 3 rounds. Total time: about 12 minutes!

Consistency is key. Aim for 3-4 sessions per week.`,
    category: "Fitness",
    tags: ["fitness", "home workout", "bodyweight", "exercises"],
    published: true
  },
  {
    title: "The Importance of Sleep for Weight Management",
    slug: "sleep-and-weight-management",
    excerpt: "Quality sleep is crucial for maintaining a healthy weight. Here's why.",
    content: `# The Importance of Sleep for Weight Management

Many people overlook sleep when trying to lose or maintain weight, but it's a critical factor.

## How Sleep Affects Weight

### 1. Hormonal Balance

Poor sleep disrupts:
- **Leptin:** Hormone that signals fullness (decreases)
- **Ghrelin:** Hormone that signals hunger (increases)

Result: You feel hungrier and less satisfied after eating.

### 2. Metabolism

Sleep deprivation can:
- Slow metabolism
- Reduce insulin sensitivity
- Increase cortisol (stress hormone)

### 3. Energy and Motivation

Tired people are:
- Less likely to exercise
- More likely to choose high-calorie comfort foods
- Have reduced willpower for healthy choices

## Tips for Better Sleep

1. **Stick to a schedule:** Go to bed and wake up at the same time daily
2. **Create a routine:** Wind down 30-60 minutes before bed
3. **Optimize environment:** Keep bedroom dark, quiet, and cool
4. **Limit screens:** Avoid blue light 1-2 hours before bed
5. **Watch caffeine:** No caffeine after 2 PM
6. **Exercise regularly:** But not right before bed

## How Much Sleep?

Adults need 7-9 hours per night. Track your sleep and energy levels to find your sweet spot.

Remember: Quality matters as much as quantity!`,
    category: "Mental Health",
    tags: ["sleep", "weight management", "health", "hormones"],
    published: true
  },
  {
    title: "Meal Prep 101: Save Time and Eat Healthier",
    slug: "meal-prep-101",
    excerpt: "Learn how to meal prep like a pro and stick to your nutrition goals.",
    content: `# Meal Prep 101

Meal prepping is one of the best strategies for eating healthy consistently while saving time and money.

## Benefits of Meal Prep

- Saves time during busy weekdays
- Reduces food waste
- Helps control portions
- Saves money
- Removes decision fatigue
- Makes healthy eating easier

## Getting Started

### 1. Plan Your Week

- Choose 2-3 recipes to prepare
- Check what's already in your pantry
- Make a shopping list

### 2. Pick a Prep Day

- Sunday or Wednesday work well
- Block 2-3 hours for cooking

### 3. Invest in Containers

- Glass or BPA-free plastic
- Various sizes for different portions
- Must be microwave and dishwasher safe

## Basic Meal Prep Template

**Proteins:** 
- Grilled chicken breast
- Baked salmon
- Hard-boiled eggs

**Complex Carbs:**
- Brown rice
- Sweet potatoes
- Quinoa

**Vegetables:**
- Roasted broccoli
- Steamed green beans
- Raw veggie sticks

**Healthy Fats:**
- Avocado (add fresh)
- Nuts and seeds
- Olive oil dressing

## Sample Prep Routine

1. Start rice cooker
2. Prep and roast vegetables (400°F, 25 min)
3. Season and grill proteins
4. Portion into containers
5. Label with date and contents

## Storage Tips

- Most meals last 3-4 days in fridge
- Freeze extra portions
- Keep sauces separate
- Add fresh ingredients when serving

Start small with 2-3 meals and build from there!`,
    category: "Recipes",
    tags: ["meal prep", "cooking", "time management", "healthy eating"],
    published: true
  }
];

async function main() {
  console.log("🌱 Seeding articles...");

  // Используем первого админа или создаем статьи без автора
  let admin = await prisma.user.findFirst({
    where: { email: "admin@vivaform.com" }
  });

  if (!admin) {
    console.log("⚠️  No admin user found. Please create an admin user first.");
    console.log("Using first user as author...");
    
    admin = await prisma.user.findFirst();
    
    if (!admin) {
      console.error("❌ No users found. Please create a user first.");
      return;
    }
  }

  // Создаем статьи
  for (const article of articles) {
    await prisma.article.create({
      data: {
        ...article,
        publishedAt: article.published ? new Date() : null,
        authorId: admin.id
      }
    });
    console.log(`✅ Created article: ${article.title}`);
  }

  console.log(`\n✅ Seeded ${articles.length} articles`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });