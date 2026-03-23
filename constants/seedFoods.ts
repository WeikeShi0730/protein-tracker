import type { Food } from '@/types';

type SeedFood = Omit<Food, 'id' | 'user_id' | 'created_at'>;

export const SEED_FOODS: SeedFood[] = [
  { name: 'Chicken Breast', serving_unit: '100g', calories_per_serving: 165, protein_per_serving: 31, category: '🍗 Meat & Fish' },
  { name: 'Ground Beef 80/20', serving_unit: '100g', calories_per_serving: 254, protein_per_serving: 17, category: '🍗 Meat & Fish' },
  { name: 'Salmon', serving_unit: '100g', calories_per_serving: 208, protein_per_serving: 20, category: '🍗 Meat & Fish' },
  { name: 'Canned Tuna', serving_unit: '100g', calories_per_serving: 116, protein_per_serving: 26, category: '🍗 Meat & Fish' },
  { name: 'Turkey Breast', serving_unit: '100g', calories_per_serving: 135, protein_per_serving: 30, category: '🍗 Meat & Fish' },
  { name: 'Shrimp', serving_unit: '100g', calories_per_serving: 99, protein_per_serving: 24, category: '🍗 Meat & Fish' },
  { name: 'Egg', serving_unit: '1 large', calories_per_serving: 70, protein_per_serving: 6, category: '🥛 Dairy & Eggs' },
  { name: 'Greek Yogurt', serving_unit: '100g', calories_per_serving: 59, protein_per_serving: 10, category: '🥛 Dairy & Eggs' },
  { name: 'Cottage Cheese', serving_unit: '100g', calories_per_serving: 98, protein_per_serving: 11, category: '🥛 Dairy & Eggs' },
  { name: 'Whole Milk', serving_unit: '240ml', calories_per_serving: 149, protein_per_serving: 8, category: '🥛 Dairy & Eggs' },
  { name: 'Cheddar Cheese', serving_unit: '30g', calories_per_serving: 120, protein_per_serving: 7, category: '🥛 Dairy & Eggs' },
  { name: 'Whey Protein Powder', serving_unit: '1 scoop (30g)', calories_per_serving: 120, protein_per_serving: 25, category: '💊 Supplements' },
  { name: 'Tofu (firm)', serving_unit: '100g', calories_per_serving: 76, protein_per_serving: 8, category: '🌾 Grains & Carbs' },
  { name: 'Lentils (cooked)', serving_unit: '100g', calories_per_serving: 116, protein_per_serving: 9, category: '🌾 Grains & Carbs' },
  { name: 'Black Beans (cooked)', serving_unit: '100g', calories_per_serving: 132, protein_per_serving: 9, category: '🌾 Grains & Carbs' },
  { name: 'Quinoa (cooked)', serving_unit: '100g', calories_per_serving: 120, protein_per_serving: 4, category: '🌾 Grains & Carbs' },
  { name: 'White Rice (cooked)', serving_unit: '100g', calories_per_serving: 130, protein_per_serving: 3, category: '🌾 Grains & Carbs' },
  { name: 'Brown Rice (cooked)', serving_unit: '100g', calories_per_serving: 123, protein_per_serving: 3, category: '🌾 Grains & Carbs' },
  { name: 'Oatmeal (dry)', serving_unit: '100g', calories_per_serving: 389, protein_per_serving: 17, category: '🌾 Grains & Carbs' },
  { name: 'Broccoli', serving_unit: '100g', calories_per_serving: 34, protein_per_serving: 3, category: '🥦 Vegetables' },
  { name: 'Sweet Potato', serving_unit: '100g', calories_per_serving: 86, protein_per_serving: 2, category: '🥦 Vegetables' },
  { name: 'Banana', serving_unit: '1 medium (118g)', calories_per_serving: 105, protein_per_serving: 1, category: '🍌 Fruits' },
  { name: 'Peanut Butter', serving_unit: '2 tbsp (32g)', calories_per_serving: 190, protein_per_serving: 8, category: '🥜 Nuts & Fats' },
  { name: 'Almonds', serving_unit: '28g', calories_per_serving: 164, protein_per_serving: 6, category: '🥜 Nuts & Fats' },
  { name: 'Avocado', serving_unit: '100g', calories_per_serving: 160, protein_per_serving: 2, category: '🥜 Nuts & Fats' },
];

export const FOOD_CATEGORIES = [
  '🍗 Meat & Fish',
  '🥛 Dairy & Eggs',
  '🌾 Grains & Carbs',
  '🥦 Vegetables',
  '🍌 Fruits',
  '🥜 Nuts & Fats',
  '💊 Supplements',
  'Other',
];

export const DEFAULT_CATEGORY = 'Other';
