import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ShieldCheck, Users, SearchX, ArrowLeft } from 'lucide-react';

const VerificationResult = ({ team, onBack, onVerify, loading }) => {
    const isVerified = team.isVerified;

    return (
        <motion.div
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
                    {isVerified ? (
                        <ShieldCheck size={80} color="#00ff88" />
                    ) : (
                        <XCircle size={80} color="#ffb703" />
                    )}
                </motion.div>

                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: isVerified ? '#00ff88' : '#ffb703' }}>
                    {isVerified ? 'Officially Verified' : 'Pending Verification'}
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
                            <Users size={14} /> Main Roster
                        </span>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem', color: 'var(--text-main)' }}>
                            {team.players.map((p, i) => <li key={i} style={{ padding: '0.25rem 0' }}>{i + 1}. {p}</li>)}
                        </ul>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reserve</span>
                        <div style={{ marginTop: '0.5rem', color: 'var(--secondary)' }}>{team.backupPlayer}</div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transaction ID</span>
                    <div style={{ marginTop: '0.25rem', fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--text-main)' }}>{team.transactionId}</div>
                </div>
            </div>

            {!isVerified && (
                <motion.button
                    onClick={onVerify}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn"
                    style={{ width: '100%', marginBottom: '1rem', opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Verifying...' : 'Confirm Registration (Verify)'}
                </motion.button>
            )}

            <button
                onClick={onBack}
                className="btn"
                style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', boxShadow: 'none' }}
            >
                <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Scan Another QR
            </button>
        </motion.div>
    );
};

export default VerificationResult;
