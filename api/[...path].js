import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// SQLite Connection cached for serverless
let db;
async function initDB() {
    if (db) return db;
    // On Vercel serverless, only /tmp is writable
    const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/database.sqlite' : 'database.sqlite';

    db = await open({
        filename: dbPath,
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

app.post('/api/register', async (req, res) => {
    try {
        const database = await initDB();
        const { teamName, players, backupPlayer, collegeName } = req.body;

        const playersJson = JSON.stringify(players);

        const newRolls = players.map(p => {
            const match = p.match(/- (.+)$/);
            return match ? match[1].trim() : null;
        }).filter(Boolean);

        const bMatch = backupPlayer.match(/- (.+)$/);
        if (bMatch) newRolls.push(bMatch[1].trim());

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

export default function handler(req, res) {
    return app(req, res);
}
