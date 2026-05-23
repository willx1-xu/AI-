-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- workouts: training sessions per body part per day
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  body_part TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date, body_part)
);

-- workout_exercises: individual exercises within a workout
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  weight_kg DECIMAL(5,1) DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- exercise_templates: reusable exercise templates
CREATE TABLE IF NOT EXISTS exercise_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  body_part TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- foods: food database (preset + custom)
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  name TEXT NOT NULL,
  calories_per_100g DECIMAL(7,2) NOT NULL,
  protein_per_100g DECIMAL(5,2) DEFAULT 0,
  carbs_per_100g DECIMAL(5,2) DEFAULT 0,
  fat_per_100g DECIMAL(5,2) DEFAULT 0,
  is_preset BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- diet_entries: daily food diary
CREATE TABLE IF NOT EXISTS diet_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast','lunch','dinner','snack')),
  food_id UUID NOT NULL REFERENCES foods(id),
  serving_grams DECIMAL(7,2) NOT NULL,
  calories DECIMAL(7,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- body_records: body metrics
CREATE TABLE IF NOT EXISTS body_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  body_fat_pct DECIMAL(4,1),
  muscle_mass_kg DECIMAL(5,2),
  bmr_kcal INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- plans: bulking/cutting plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  goal TEXT NOT NULL CHECK(goal IN ('bulk','cut')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_weight_kg DECIMAL(5,2) NOT NULL,
  target_weight_kg DECIMAL(5,2) NOT NULL,
  daily_calorie_target INTEGER NOT NULL,
  activity_level DECIMAL(3,2) DEFAULT 1.55,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- plan_workout_schedule: weekly training schedule within a plan
CREATE TABLE IF NOT EXISTS plan_workout_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
  body_part TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_diet_entries_user_date ON diet_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_body_records_user_date ON body_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_plans_user ON plans(user_id);
