import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import { QrCode, ArrowLeft, Loader2 } from 'lucide-react';
import VerificationResult from './VerificationResult';
import { motion } from 'framer-motion';

const AdminScanner = ({ onBack }) => {
    const [scannedResult, setScannedResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [teamData, setTeamData] = useState(null);

    const handleScan = async (result) => {
        if (result && result.length > 0) {
            const qrData = result[0].rawValue;
            setScannedResult(qrData);

            try {
                setLoading(true);
                setError(null);
                // Assuming QR payload is a JSON with teamId or just the teamId string
                let teamIdString = qrData;
                try {
                    const parsed = JSON.parse(qrData);
                    if (parsed.teamId) teamIdString = parsed.teamId;
                } catch (e) {
                    // It's not JSON, assume raw string
                }

                const response = await axios.get(`http://${window.location.hostname}:5000/api/team/${teamIdString}`);
                setTeamData(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to verify. Invalid QR code or server error.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerifyTeam = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`http://${window.location.hostname}:5000/api/team/${teamData.teamId}/verify`);
            setTeamData(response.data.team);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update verification status.');
        } finally {
            setLoading(false);
        }
    };

    if (teamData) {
        return (
            <VerificationResult
                team={teamData}
                onBack={() => { setTeamData(null); setScannedResult(null); }}
                onVerify={handleVerifyTeam}
                loading={loading}
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card"
            style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button onClick={onBack} className="btn" style={{ background: 'transparent', padding: '0.5rem', color: 'var(--text-main)', border: 'none', boxShadow: 'none' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <QrCode size={24} /> Admin Verification
                </h2>
                <div style={{ width: 40 }}></div>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Scan the team's QR Code to verify their slot.</p>

            {loading ? (
                <div style={{ padding: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--primary)' }}>
                    <Loader2 size={48} className="animate-spin" />
                    <p style={{ marginTop: '1rem', color: 'var(--text-main)' }}>Fetching team details...</p>
                </div>
            ) : (
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--border-color)', marginBottom: '2rem' }}>
                    <Scanner
                        onScan={handleScan}
                        formats={['qr_code']}
                    />
                </div>
            )}

            {error && (
                <div style={{ background: 'rgba(255, 51, 102, 0.1)', color: '#ff3366', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #ff3366 ' }}>
                    {error}
                </div>
            )}
        </motion.div>
    );
};

export default AdminScanner;
