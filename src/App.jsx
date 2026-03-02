import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, UserPlus, Users, Trophy, QrCode, CheckCircle, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const App = () => {
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState(['', '', '', '']);
  const [backupPlayer, setBackupPlayer] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [qrPayload, setQrPayload] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [usedTransactionIds, setUsedTransactionIds] = useState([]);

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if team name and all players are filled (basic validation)
    if (!teamName || players.some(p => !p) || !backupPlayer || !transactionId) {
      alert("Please fill out all fields including Transaction ID.");
      return;
    }

    if (usedTransactionIds.includes(transactionId)) {
      alert("This Transaction ID has already been used for registration.");
      return;
    }

    const payload = {
      teamId: `FF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      teamName,
      players,
      backupPlayer,
      transactionId,
      timestamp: new Date().toISOString()
    };

    setQrPayload(JSON.stringify(payload));
    setUsedTransactionIds(prev => [...prev, transactionId]);
    setIsRegistered(true);
  };

  const handleReset = () => {
    setTeamName('');
    setPlayers(['', '', '', '']);
    setBackupPlayer('');
    setTransactionId('');
    setIsRegistered(false);
  };

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {!isRegistered ? (
          <motion.div
            key="registration-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="glass-card"
            style={{ width: '100%', maxWidth: '800px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}
              >
                <div style={{ background: 'rgba(242, 169, 0, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
                  <Trophy size={48} strokeWidth={1.5} />
                </div>
              </motion.div>
              <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Free Fire</h1>
              <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 500, letterSpacing: '2px' }}>Championship Registration</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Assemble your squad and secure your slot in the upcoming tournament.</p>
            </div>

            <form onSubmit={handleSubmit} className="animate-fade-in">
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Team Name</label>
                <div style={{ position: 'relative' }}>
                  <Shield size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter official squad name"
                    style={{ paddingLeft: '3rem' }}
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} /> Starting Roster (4 Players)
              </h4>
              <div className="players-grid" style={{ marginBottom: '2rem' }}>
                {players.map((player, index) => (
                  <div key={index} className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Player {index + 1} ID or Name <span className="badge" style={{ marginLeft: 'auto', display: 'inline-block' }}>P{index + 1}</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`FF Username or UID`}
                      value={player}
                      onChange={(e) => handlePlayerChange(index, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <h4 style={{ color: 'var(--secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={18} /> Reserve / Backup (1 Player)
              </h4>
              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label className="form-label">
                  Backup Player ID or Name <span className="badge badge-backup">SUB</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Backup FF Username or UID"
                  value={backupPlayer}
                  onChange={(e) => setBackupPlayer(e.target.value)}
                  required
                />
              </div>

              <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={18} /> Payment Verification
              </h4>
              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px dashed var(--primary)' }}>
                  <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>Please pay the registration fee to the following number via UPI / Mobile Wallet:</p>
                  <h3 style={{ margin: '0.5rem 0', color: 'var(--primary)', letterSpacing: '1px', fontSize: '1.5rem' }}>7868881629</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>After successful payment, enter the Transaction ID below.</p>
                </div>
                <label className="form-label">
                  Transaction / Reference ID
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter 12-digit UPI / Transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="btn"
                  style={{ width: '100%', maxWidth: '400px' }}
                >
                  <Sparkles size={20} /> Register Squad
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="glass-card"
            style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: '#00ff88' }}
            >
              <CheckCircle size={64} strokeWidth={1.5} />
            </motion.div>

            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '2rem' }}>Registration Successful!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your squad <strong>{teamName}</strong> has been secured. Scan the QR code below at the venue to verify your participation.</p>

            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', display: 'inline-block', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <QRCodeSVG value={qrPayload} size={200} level="H" fgColor="#0f1016" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', textAlign: 'left', background: 'var(--bg-input)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Main Roster</span>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                  {players.map((p, i) => <li key={i} style={{ padding: '0.25rem 0', fontWeight: 500, color: 'var(--text-main)' }}>{i + 1}. {p}</li>)}
                </ul>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reserve</span>
                <div style={{ marginTop: '0.5rem', padding: '0.25rem 0', fontWeight: 500, color: 'var(--secondary)' }}>{backupPlayer}</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', textAlign: 'left' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment Reference</span>
              <div style={{ marginTop: '0.5rem', fontWeight: 500, color: 'var(--text-main)' }}>TRX: {transactionId}</div>
            </div>

            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn"
              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '1rem', clipPath: 'none', borderRadius: 'var(--radius-md)' }}
            >
              <ArrowLeft size={18} /> Register Another Squad
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
