import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, XCircle, Users, ArrowLeft } from 'lucide-react';

const VerificationResult = ({ team, onBack, onVerify, loading }) => {
    const isVerified = team?.isVerified;

    // Fully separate verified screen
    if (isVerified) {
        return (
            <motion.div
                key="verified-screen"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}
            >
                {/* Big green verified badge */}
                <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
                    style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}
                >
                    <div style={{
                        background: 'rgba(0, 255, 136, 0.12)',
                        borderRadius: '50%',
                        padding: '1.5rem',
                        border: '2px solid rgba(0, 255, 136, 0.4)',
                        boxShadow: '0 0 40px rgba(0, 255, 136, 0.3)'
                    }}>
                        <ShieldCheck size={80} color="#00ff88" strokeWidth={1.5} />
                    </div>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    style={{ fontSize: '2.2rem', color: '#00ff88', marginBottom: '0.5rem' }}
                >
                    Officially Verified ✓
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}
                >
                    Team <strong style={{ color: 'var(--text-main)' }}>{team.teamName}</strong> is cleared for participation.
                </motion.p>

                {/* Team summary */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    style={{ background: 'rgba(0, 255, 136, 0.06)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Users size={16} color="#00ff88" />
                        <span style={{ fontSize: '0.8rem', color: '#00ff88', textTransform: 'uppercase', fontWeight: 600 }}>Verified Roster</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-main)' }}>
                        {team.players?.map((p, i) => (
                            <li key={i} style={{ padding: '0.2rem 0', fontSize: '0.95rem' }}>{i + 1}. {p}</li>
                        ))}
                    </ul>
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem 0', borderTop: '1px solid var(--border-color)', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                        Sub: {team.backupPlayer}
                    </div>
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem 0', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        Roll No: {team.rollNumber}
                    </div>
                </motion.div>

                <button
                    onClick={onBack}
                    className="btn"
                    style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', boxShadow: 'none', clipPath: 'none', borderRadius: 'var(--radius-md)', fontSize: '1rem' }}
                >
                    <ArrowLeft size={18} /> Scan Next Team
                </button>
            </motion.div>
        );
    }

    // Pending verification screen
    return (
        <motion.div
            key="pending-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card"
            style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}
                >
                    <XCircle size={80} color="#ffb703" strokeWidth={1.5} />
                </motion.div>

                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#ffb703' }}>
                    Pending Verification
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    Team ID: <strong style={{ color: 'var(--text-main)', letterSpacing: '1px' }}>{team.teamId}</strong>
                </p>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <h3 style={{ color: 'var(--primary)', margin: 0 }}>{team.teamName}</h3>
                    <span className="badge">Roster Found</span>
                </div>

                <div className="roster-grid" style={{ marginBottom: '1rem' }}>
                    <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Main Roster
                        </span>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', color: 'var(--text-main)' }}>
                            {team.players?.map((p, i) => <li key={i} style={{ padding: '0.25rem 0' }}>{i + 1}. {p}</li>)}
                        </ul>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reserve</span>
                        <div style={{ marginTop: '0.5rem', color: 'var(--secondary)' }}>{team.backupPlayer}</div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>College Roll Number</span>
                    <div style={{ marginTop: '0.25rem', fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--text-main)' }}>{team.rollNumber}</div>
                </div>
            </div>

            <motion.button
                onClick={onVerify}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="btn"
                style={{ width: '100%', marginBottom: '1rem', opacity: loading ? 0.7 : 1 }}
            >
                {loading ? 'Verifying...' : '✓ Confirm & Verify Team'}
            </motion.button>

            <button
                onClick={onBack}
                className="btn"
                style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', boxShadow: 'none', clipPath: 'none', borderRadius: 'var(--radius-md)', fontSize: '1rem' }}
            >
                <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Scan Another QR
            </button>
        </motion.div>
    );
};

export default VerificationResult;
