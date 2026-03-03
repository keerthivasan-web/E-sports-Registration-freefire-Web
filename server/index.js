import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Team from './models/Team.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ffmax';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { teamName, players, backupPlayer, transactionId } = req.body;

        // Validate if transaction ID already exists
        const existingTeam = await Team.findOne({ transactionId });
        if (existingTeam) {
            return res.status(400).json({ error: 'Transaction ID already used. Please provide a valid unique transaction ID.' });
        }

        // Generate unique team ID
        const teamId = `FF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const newTeam = new Team({
            teamId,
            teamName,
            players,
            backupPlayer,
            transactionId
        });

        await newTeam.save();

        res.status(201).json({ teamId, message: 'Registration successful' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

app.get('/api/team/:teamId', async (req, res) => {
    try {
        const team = await Team.findOne({ teamId: req.params.teamId });
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(team);
    } catch (error) {
        console.error('Fetch Team Error:', error);
        res.status(500).json({ error: 'Server error while fetching team' });
    }
});

app.post('/api/team/:teamId/verify', async (req, res) => {
    try {
        const team = await Team.findOneAndUpdate(
            { teamId: req.params.teamId },
            { isVerified: true },
            { new: true }
        );

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

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
