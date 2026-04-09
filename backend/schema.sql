CREATE TABLE IF NOT EXISTS users (
    clerk_id VARCHAR(255) PRIMARY KEY,
    age INTEGER,
    gender VARCHAR(50),
    weight_kg DECIMAL,
    height_cm DECIMAL,
    activity_level VARCHAR(50),
    goal VARCHAR(50),
    target_calories INTEGER,
    target_protein INTEGER,
    target_fats INTEGER,
    target_carbs INTEGER
);

CREATE TABLE IF NOT EXISTS food_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(clerk_id),
    date DATE,
    food_name VARCHAR(255),
    calories INTEGER,
    protein INTEGER,
    fats INTEGER,
    carbs INTEGER
);

CREATE TABLE IF NOT EXISTS weight_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(clerk_id),
    date DATE,
    weight_kg DECIMAL
);
