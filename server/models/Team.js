import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    teamId: {
        type: String,
        required: true,
        unique: true
    },
    teamName: {
        type: String,
        required: true
    },
    players: {
        type: [String],
        required: true,
        validate: [v => v.length === 4, 'A team must have exactly 4 players']
    },
    backupPlayer: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Team', teamSchema);
