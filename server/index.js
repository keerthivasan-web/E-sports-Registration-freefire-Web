import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173', // Local development frontend
    'http://localhost:5174', // Vite alternative dev port
    'https://e-sports-registration-freefire-web.vercel.app', // Production frontend
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());

// SQLite Connection
let db;
async function initDB() {
    if (db) return db;
    db = await open({
        filename: 'database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS teams (
            teamId TEXT PRIMARY KEY,
            teamName TEXT NOT NULL,
            players TEXT NOT NULL,
            backupPlayer TEXT NOT NULL,
            collegeName TEXT NOT NULL,
            isVerified INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('SQLite connected and tables checked');
    return db;
}

initDB().catch(err => console.error('DB init err', err));

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const database = await initDB();
        const { teamName, players, backupPlayer, collegeName } = req.body;

        const playersJson = JSON.stringify(players);

        // Extract roll numbers from payload
        const newRolls = players.map(p => {
            const match = p.match(/- (.+)$/);
            return match ? match[1].trim() : null;
        }).filter(Boolean);

        const bMatch = backupPlayer.match(/- (.+)$/);
        if (bMatch) newRolls.push(bMatch[1].trim());

        // Validate if roll number already exists globally
        const allTeams = await database.all('SELECT players, backupPlayer FROM teams');
        const existingRolls = new Set();
        allTeams.forEach(t => {
            try {
                const pList = JSON.parse(t.players);
                pList.forEach(p => {
                    const match = p.match(/- (.+)$/);
                    if (match) existingRolls.add(match[1].trim());
                });
            } catch (e) { }
            const tbMatch = t.backupPlayer.match(/- (.+)$/);
            if (tbMatch) existingRolls.add(tbMatch[1].trim());
        });

        const duplicate = newRolls.find(r => existingRolls.has(r));
        if (duplicate) {
            return res.status(400).json({ error: `Roll Number ${duplicate} is already registered by another player.` });
        }

        // Generate unique team ID
        const teamId = `FF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        await database.run(
            'INSERT INTO teams (teamId, teamName, players, backupPlayer, collegeName, isVerified) VALUES (?, ?, ?, ?, ?, ?)',
            [teamId, teamName, playersJson, backupPlayer, collegeName, 0]
        );

        res.status(201).json({ teamId, message: 'Registration successful' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

app.get('/api/team/:teamId', async (req, res) => {
    try {
        const database = await initDB();
        const team = await database.get('SELECT * FROM teams WHERE teamId = ?', [req.params.teamId]);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        team.players = JSON.parse(team.players);
        team.isVerified = !!team.isVerified;

        res.json(team);
    } catch (error) {
        console.error('Fetch Team Error:', error);
        res.status(500).json({ error: 'Server error while fetching team' });
    }
});

app.post('/api/team/:teamId/verify', async (req, res) => {
    try {
        const database = await initDB();

        const result = await database.run('UPDATE teams SET isVerified = 1 WHERE teamId = ?', [req.params.teamId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const team = await database.get('SELECT * FROM teams WHERE teamId = ?', [req.params.teamId]);
        team.players = JSON.parse(team.players);
        team.isVerified = !!team.isVerified;

        res.json({ message: 'Team successfully verified', team });
    } catch (error) {
        console.error('Verify Team Error:', error);
        res.status(500).json({ error: 'Server error while verifying team' });
    }
});

// Ensure development environments still start the server locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running locally on port ${PORT}`);
    });
}

// Export for Vercel Serverless
export default app;
