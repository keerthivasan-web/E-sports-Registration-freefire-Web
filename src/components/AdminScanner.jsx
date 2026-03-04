import React, { useState, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../api';
import { QrCode, ArrowLeft, Loader2, RefreshCcw, Search } from 'lucide-react';
import VerificationResult from './VerificationResult';
import { motion, AnimatePresence } from 'framer-motion';

const AdminScanner = ({ onBack }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [teamData, setTeamData] = useState(null);
    const [manualId, setManualId] = useState('');
    const [lastScanned, setLastScanned] = useState('');
    const isScanningRef = useRef(false);

    const fetchTeam = async (rawValue) => {
        if (!rawValue || !rawValue.trim()) return;

        isScanningRef.current = true;
        setLoading(true);
        setError(null);
        setLastScanned(rawValue);

        try {
            // Try to parse JSON payload (our QR contains {"teamId":"FF-XXXX"})
            let teamId = rawValue.trim();
            try {
                const parsed = JSON.parse(rawValue);
                if (parsed.teamId) teamId = parsed.teamId;
            } catch (_) {
                // rawValue is already the plain teamId string
            }

            const response = await api.get(`/api/team/${encodeURIComponent(teamId)}`);
            setTeamData(response.data);
        } catch (err) {
            let msg = err.response?.data?.error
                || err.message
                || 'Failed to verify. Check network or team ID.';

            // React Error #31 Fix: Ensure the error message is always a string before rendering it
            if (typeof msg !== 'string') {
                msg = JSON.stringify(msg);
            }
            setError(msg);
            isScanningRef.current = false;
        } finally {
            setLoading(false);
        }
    };

    const handleScan = (result) => {
        // result is IDetectedBarcode[]
        if (isScanningRef.current || loading) return;
        if (!result || result.length === 0) return;
        const rawValue = result[0]?.rawValue;
        if (!rawValue) return;
        fetchTeam(rawValue);
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        fetchTeam(manualId);
    };

    const handleReset = () => {
        isScanningRef.current = false;
        setTeamData(null);
        setError(null);
        setLoading(false);
        setLastScanned('');
        setManualId('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card"
            style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}
        >
            {teamData ? (
                <VerificationResult
                    team={teamData}
                    onBack={handleReset}
                    onVerify={async () => {
                        try {
                            setLoading(true);
                            setError(null);
                            const response = await api.post(`/api/team/${teamData.teamId}/verify`);
                            const updatedTeam = response.data?.team ?? { ...teamData, isVerified: true };
                            setTeamData(updatedTeam);
                        } catch (err) {
                            setError(err.response?.data?.error || 'Failed to mark as verified.');
                        } finally {
                            setLoading(false);
                        }
                    }}
                    loading={loading}
                />
            ) : (
                <>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <button onClick={onBack} className="btn" style={{ background: 'transparent', padding: '0.5rem', color: 'var(--text-main)', border: 'none', boxShadow: 'none' }}>
                            <ArrowLeft size={24} />
                        </button>
                        <h2 style={{ color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <QrCode size={24} /> Admin Verification
                        </h2>
                        <div style={{ width: 40 }} />
                    </div>

                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                        Point the camera at the team's QR Code, or enter the Team ID manually below.
                    </p>

                    {/* ALWAYS keep scanner mounted but hidden when loading to prevent React unmount crashes */}
                    <div style={{ display: loading ? 'none' : 'block' }}>
                        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--border-color)', marginBottom: '1.5rem', background: '#000' }}>
                            <Scanner
                                paused={loading}
                                onScan={handleScan}
                                formats={['qr_code']}
                                styles={{
                                    container: { width: '100%', paddingTop: 0 },
                                    video: { width: '100%', height: '260px', objectFit: 'cover' }
                                }}
                            />
                        </div>
                    </div>

                    {/* Loading State Overlay */}
                    {loading && (
                        <div style={{ padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary)' }}>
                            <Loader2 size={48} className="animate-spin" />
                            <p style={{ marginTop: '1rem', color: 'var(--text-main)' }}>Looking up team...</p>
                            {lastScanned && (
                                <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                    Scanned: <code style={{ color: 'var(--primary)' }}>{lastScanned.length > 60 ? lastScanned.slice(0, 60) + '...' : lastScanned}</code>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{ background: 'rgba(255,51,102,0.1)', color: '#ff3366', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #ff3366', marginBottom: '1.25rem', fontSize: '0.9rem' }}
                            >
                                ⚠️ {error}
                                <button
                                    onClick={handleReset}
                                    style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', color: '#ff3366', border: '1px solid #ff3366', borderRadius: '8px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.82rem', margin: '0.6rem auto 0' }}
                                >
                                    <RefreshCcw size={13} /> Try Again
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Manual fallback */}
                    {!loading && (
                        <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Or type Team ID (e.g. FF-ABC123)"
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                style={{ flex: 1, fontSize: '0.95rem' }}
                            />
                            <button
                                type="submit"
                                className="btn"
                                disabled={!manualId.trim()}
                                style={{ padding: '0.5rem 1rem', fontSize: '1rem', clipPath: 'none', borderRadius: 'var(--radius-md)', opacity: manualId.trim() ? 1 : 0.5 }}
                            >
                                <Search size={18} />
                            </button>
                        </form>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default AdminScanner;
