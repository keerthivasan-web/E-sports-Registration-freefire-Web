import React, { useState, useEffect } from 'react';
import api from './api';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, UserPlus, Users, Trophy, QrCode, CheckCircle, ArrowLeft, ScanLine, Lock, KeyRound } from 'lucide-react';
import AdminScanner from './components/AdminScanner';

const BulletEffect = () => {
  const [bullets, setBullets] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newBullet = {
        id: Date.now() + Math.random(),
        top: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 0.6 + Math.random() * 0.4,
      };
      setBullets(prev => [...prev.slice(-15), newBullet]);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bullet-container">
      <AnimatePresence>
        {bullets.map(b => (
          <motion.div
            key={b.id}
            className="bullet"
            initial={{ left: '-10%', opacity: 0 }}
            animate={{ left: '110%', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: b.duration, delay: b.delay, ease: "linear" }}
            style={{ top: `${b.top}%` }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  const [viewMode, setViewMode] = useState('registration'); // 'registration', 'admin-login', 'admin'
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState([
    { uid: '', rollNumber: '' },
    { uid: '', rollNumber: '' },
    { uid: '', rollNumber: '' },
    { uid: '', rollNumber: '' }
  ]);
  const [backupPlayer, setBackupPlayer] = useState({ uid: '', rollNumber: '' });
  const [collegeName, setCollegeName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [qrPayload, setQrPayload] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin Login State
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isHoveringTrophy, setIsHoveringTrophy] = useState(false);

  // Cursor tracking for background reveal with smooth lerp & mobile support
  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let animationFrameId;

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animate = () => {
      // Smooth interpolation
      currentX = lerp(currentX, mouseX, 0.08);
      currentY = lerp(currentY, mouseY, 0.08);

      document.documentElement.style.setProperty('--mouse-x', `${currentX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${currentY}px`);

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });

    // Start animation loop
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handlePlayerChange = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!teamName || players.some(p => !p.uid || !p.rollNumber) || !backupPlayer.uid || !backupPlayer.rollNumber || !collegeName) {
      setError('Please fill all required fields including your College Name and all individual player Roll Numbers');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/register', {
        teamName,
        players: players.map(p => `${p.uid} - ${p.rollNumber}`),
        backupPlayer: `${backupPlayer.uid} - ${backupPlayer.rollNumber}`,
        collegeName
      });

      setQrPayload(JSON.stringify({ teamId: response.data.teamId }));
      setIsRegistered(true);
    } catch (err) {
      let msg = err.response?.data?.error || "Registration failed. Please try again.";
      if (typeof msg !== 'string') {
        msg = JSON.stringify(msg);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTeamName('');
    setPlayers([
      { uid: '', rollNumber: '' },
      { uid: '', rollNumber: '' },
      { uid: '', rollNumber: '' },
      { uid: '', rollNumber: '' }
    ]);
    setBackupPlayer({ uid: '', rollNumber: '' });
    setCollegeName('');
    setIsRegistered(false);
    setError('');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'SentraVox') {
      setViewMode('admin');
      setAdminPassword('');
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Access denied.');
    }
  };

  return (
    <>
      <div className="bg-reveal-container">
        <div className="bg-reveal-image"></div>
        <div className="bg-reveal-overlay"></div>
        <BulletEffect />
      </div>

      <div className="app-container">
        {viewMode === 'registration' && (
          <button
            onClick={() => setViewMode('admin-login')}
            className="btn"
            style={{ position: 'fixed', top: '1rem', right: '1rem', background: 'var(--bg-card)', zIndex: 100, border: '1px solid var(--border-color)', color: 'var(--primary)', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
          >
            <ScanLine size={18} /> Admin Mode
          </button>
        )}

        <AnimatePresence mode="wait">
          {viewMode === 'admin-login' ? (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '450px', margin: '0 auto', textAlign: 'center' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255, 51, 102, 0.1)', padding: '1rem', borderRadius: '50%', color: '#ff3366' }}>
                  <Lock size={48} strokeWidth={1.5} />
                </div>
              </div>

              <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.8rem' }}>Admin Access</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>Enter the master password to access the verification scanner.</p>

              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(255, 51, 102, 0.1)', color: '#ff3366', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ff3366', marginBottom: '1.5rem', fontSize: '0.9rem' }}
                >
                  {loginError}
                </motion.div>
              )}

              <form onSubmit={handleAdminLogin} style={{ textAlign: 'left' }}>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Master Password</label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter password"
                      style={{ paddingLeft: '3rem' }}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="btn"
                  style={{ width: '100%', marginBottom: '1rem' }}
                >
                  Unlock Scanner
                </motion.button>

                <button
                  type="button"
                  onClick={() => { setViewMode('registration'); setLoginError(''); setAdminPassword(''); }}
                  className="btn"
                  style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', boxShadow: 'none' }}
                >
                  <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Return to Registration
                </button>
              </form>
            </motion.div>
          ) : viewMode === 'admin' ? (
            <AdminScanner key="admin-scanner" onBack={() => setViewMode('registration')} />
          ) : !isRegistered ? (
            <motion.div
              key="registration-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="glass-card"
              style={{ width: '100%', maxWidth: '800px', position: 'relative' }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}
                >
                  <div
                    style={{ background: 'rgba(242, 169, 0, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px' }}
                    onMouseEnter={() => setIsHoveringTrophy(true)}
                    onMouseLeave={() => setIsHoveringTrophy(false)}
                  >
                    {isHoveringTrophy ? (
                      <img src="/assets/garena.png" alt="Garena" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                    ) : (
                      <Trophy size={48} strokeWidth={1.5} />
                    )}
                  </div>
                </motion.div>
                <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Free Fire</h1>
                <h2 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 500, letterSpacing: '2px' }}>Championship Registration</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Assemble your squad and secure your slot in the upcoming tournament.</p>
              </div>

              {error && (
                <div style={{ background: 'rgba(255, 51, 102, 0.1)', color: '#ff3366', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #ff3366 ', marginBottom: '1.5rem' }}>
                  {error}
                </div>
              )}

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
                        Player {index + 1} Details <span className="badge" style={{ marginLeft: 'auto', display: 'inline-block' }}>P{index + 1}</span>
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="FF UID/Name"
                          value={player.uid}
                          onChange={(e) => handlePlayerChange(index, 'uid', e.target.value)}
                          required
                          style={{ flex: '1 1 auto', minWidth: '150px' }}
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Roll No."
                          value={player.rollNumber}
                          onChange={(e) => handlePlayerChange(index, 'rollNumber', e.target.value)}
                          required
                          style={{ width: '120px', flex: '0 0 auto' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <h4 style={{ color: 'var(--secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserPlus size={18} /> Reserve / Backup (1 Player)
                </h4>
                <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                  <label className="form-label">
                    Backup Player Details <span className="badge badge-backup">SUB</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="FF UID/Name"
                      value={backupPlayer.uid}
                      onChange={(e) => setBackupPlayer({ ...backupPlayer, uid: e.target.value })}
                      required
                      style={{ flex: '1 1 auto', minWidth: '150px' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Roll No."
                      value={backupPlayer.rollNumber}
                      onChange={(e) => setBackupPlayer({ ...backupPlayer, rollNumber: e.target.value })}
                      required
                      style={{ width: '120px', flex: '0 0 auto' }}
                    />
                  </div>
                </div>

                <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <QrCode size={18} /> College Name
                </h4>
                <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px dashed var(--primary)' }}>
                    <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>Please enter your college name.</p>
                  </div>
                  <label className="form-label">
                    College Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="E.g., ABC Engineering College"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="btn"
                    disabled={loading}
                    style={{ width: '100%', maxWidth: '400px', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? 'Submitting...' : <><Sparkles size={20} /> Register Squad</>}
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
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your squad <strong>{teamName}</strong> has been secured in the database. Scan the QR code below at the venue to verify your participation.</p>

              <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', display: 'inline-block', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrPayload)}`} alt="Team QR Code" style={{ width: 200, height: 200 }} />
              </div>

              <div className="roster-grid" style={{ textAlign: 'left', background: 'var(--bg-input)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Main Roster</span>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                    {players.map((p, i) => <li key={i} style={{ padding: '0.25rem 0', fontWeight: 500, color: 'var(--text-main)' }}>{i + 1}. {p.uid} - {p.rollNumber}</li>)}
                  </ul>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reserve</span>
                  <div style={{ marginTop: '0.5rem', padding: '0.25rem 0', fontWeight: 500, color: 'var(--secondary)' }}>{backupPlayer.uid} - {backupPlayer.rollNumber}</div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', textAlign: 'left' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>College Details</span>
                <div style={{ marginTop: '0.5rem', fontWeight: 500, color: 'var(--text-main)' }}>{collegeName}</div>
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
    </>
  );
};

export default App;
