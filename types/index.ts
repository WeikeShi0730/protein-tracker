export interface Food {
  id: string;
  user_id: string;
  name: string;
  serving_unit: string;
  calories_per_serving: number;
  protein_per_serving: number;
  created_at: string;
}

export interface LogEntry {
  id: string;
  user_id: string;
  food_id: string;
  servings: number;
  logged_at: string;
  notes: string | null;
  created_at: string;
  foods: {
    name: string;
    serving_unit: string;
    calories_per_serving: number;
    protein_per_serving: number;
  };
}

export interface Profile {
  id: string;
  daily_protein_goal: number;
  daily_calorie_goal: number;
  seeded: boolean;
  updated_at: string;
}

export interface DayGroup {
  date: string; // "YYYY-MM-DD"
  label: string; // human-readable like "Monday, Mar 21"
  entries: LogEntry[];
  totalProtein: number;
  totalCalories: number;
}
