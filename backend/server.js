const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { query } = require('./db');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/users/:clerk_id', ClerkExpressRequireAuth({}), async (req, res) => {
    try {
        const { clerk_id } = req.params;
        const result = await query('SELECT * FROM users WHERE clerk_id = $1', [clerk_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/users', ClerkExpressRequireAuth({}), async (req, res) => {
    try {
        const { clerk_id, age, gender, weight_kg, height_cm, activity_level, goal, target_calories, target_protein, target_fats, target_carbs } = req.body;
        
        // Upsert user
        const result = await query(`
            INSERT INTO users (clerk_id, age, gender, weight_kg, height_cm, activity_level, goal, target_calories, target_protein, target_fats, target_carbs)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (clerk_id) DO UPDATE SET
                age = EXCLUDED.age,
                gender = EXCLUDED.gender,
                weight_kg = EXCLUDED.weight_kg,
                height_cm = EXCLUDED.height_cm,
                activity_level = EXCLUDED.activity_level,
                goal = EXCLUDED.goal,
                target_calories = EXCLUDED.target_calories,
                target_protein = EXCLUDED.target_protein,
                target_fats = EXCLUDED.target_fats,
                target_carbs = EXCLUDED.target_carbs
            RETURNING *;
        `, [clerk_id, age, gender, weight_kg, height_cm, activity_level, goal, target_calories, target_protein, target_fats, target_carbs]);
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/foodLogs/:clerk_id', ClerkExpressRequireAuth({}), async (req, res) => {
    try {
        const { clerk_id } = req.params;
        const { date } = req.query; // expecting YYYY-MM-DD
        let sql = 'SELECT * FROM food_logs WHERE user_id = $1';
        let params = [clerk_id];
        if (date) {
            sql += ' AND date = $2';
            params.push(date);
        }
        sql += ' ORDER BY id DESC';
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/foodLogs', ClerkExpressRequireAuth({}), async (req, res) => {
    try {
        const { user_id, date, food_name, calories, protein, fats, carbs } = req.body;
        const result = await query(
            'INSERT INTO food_logs (user_id, date, food_name, calories, protein, fats, carbs) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [user_id, date, food_name, calories, protein, fats, carbs]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/weightLogs/:clerk_id', ClerkExpressRequireAuth({}), async (req, res) => {
    try {
        const { clerk_id } = req.params;
        const result = await query('SELECT * FROM weight_logs WHERE user_id = $1 ORDER BY date DESC LIMIT 10', [clerk_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/weightLogs', ClerkExpressRequireAuth({}), async (req, res) => {
    try {
        const { user_id, date, weight_kg } = req.body;
        const result = await query(
            'INSERT INTO weight_logs (user_id, date, weight_kg) VALUES ($1, $2, $3) RETURNING *',
            [user_id, date, weight_kg]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/foodLogs/:id', ClerkExpressRequireAuth({}), async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM food_logs WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/weightLogs/:id', ClerkExpressRequireAuth({}), async (req, res) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM weight_logs WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Error handling for Clerk
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(401).send('Unauthenticated!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
