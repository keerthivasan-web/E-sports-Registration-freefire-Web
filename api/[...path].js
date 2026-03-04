import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// ---- Team Model (inline to avoid path issues in Vercel) ----
const teamSchema = new mongoose.Schema({
    teamId: { type: String, required: true, unique: true },
    teamName: { type: String, required: true },
    players: {
        type: [String],
        required: true,
        validate: [v => v.length === 4, 'A team must have exactly 4 players']
    },
    backupPlayer: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

// ---- Express App ----
const app = express();
app.use(cors());
app.use(express.json());

// ---- MongoDB connection (cached for serverless) ----
let isConnected = false;
async function connectDB() {
    if (isConnected) return;
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI environment variable is not set');
    await mongoose.connect(uri);
    isConnected = true;
}

// ---- Routes ----
app.post('/api/register', async (req, res) => {
    try {
        await connectDB();
        const { teamName, players, backupPlayer, transactionId } = req.body;

        const existingTeam = await Team.findOne({ transactionId });
        if (existingTeam) {
            return res.status(400).json({ error: 'Transaction ID already used. Please provide a valid unique transaction ID.' });
        }

        const teamId = `FF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const newTeam = new Team({ teamId, teamName, players, backupPlayer, transactionId });
        await newTeam.save();

        res.status(201).json({ teamId, message: 'Registration successful' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

app.get('/api/team/:teamId', async (req, res) => {
    try {
        await connectDB();
        const team = await Team.findOne({ teamId: req.params.teamId });
        if (!team) return res.status(404).json({ error: 'Team not found' });
        res.json(team);
    } catch (error) {
        console.error('Fetch Team Error:', error);
        res.status(500).json({ error: 'Server error while fetching team' });
    }
});

app.post('/api/team/:teamId/verify', async (req, res) => {
    try {
        await connectDB();
        // { new: true } tells Mongoose to return the UPDATED document (not the old one)
        const team = await Team.findOneAndUpdate(
            { teamId: req.params.teamId },
            { isVerified: true },
            { new: true }
        );
        if (!team) return res.status(404).json({ error: 'Team not found' });
        res.json({ message: 'Team successfully verified', team });
    } catch (error) {
        console.error('Verify Team Error:', error);
        res.status(500).json({ error: 'Server error while verifying team' });
    }
});

// ---- Vercel Serverless Handler ----
export default function handler(req, res) {
    return app(req, res);
}
