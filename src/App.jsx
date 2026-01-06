import { useState, useEffect } from 'react';
import Timer from './components/timer/Timer';
import styles from './App.module.css';

const DEFAULT_PRESETS = [
    { id: 1, name: 'Breathe', duration: 120, type: 'gentle', chime: 'gentle' },
    { id: 2, name: 'Cat-Cow', duration: 60, type: 'gentle', chime: 'gentle' },
    { id: 3, name: 'Down Dog', duration: 60, type: 'gentle', chime: 'gentle' },
    { id: 4, name: 'Sun Salutation', duration: 300, type: 'gentle', chime: 'gentle' },
    { id: 5, name: 'Warrior Pose', duration: 60, type: 'gentle', chime: 'gentle' },
];

const API_URL = "https://cortanext-workout-timer.sri-050.workers.dev";

function App() {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('currentUser');
        try {
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return saved || null; // Fallback for old string format
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupAgeRange, setSignupAgeRange] = useState('');
    const [signupGender, setSignupGender] = useState('');
    const [signupZip, setSignupZip] = useState('');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [toast, setToast] = useState({ message: '', type: null });
    const [workouts, setWorkouts] = useState(DEFAULT_PRESETS);
    const [activeWorkout, setActiveWorkout] = useState(null);
    const [sessionHistory, setSessionHistory] = useState([]);
    const [isSavingSession, setIsSavingSession] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: null }), 3000);
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ name: '', duration: 60, type: 'gentle', chime: 'gentle' });
    const [editingId, setEditingId] = useState(null);
    const [completedWorkouts, setCompletedWorkouts] = useState([]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSyncing(true);
        const endpoint = isSignup ? "/auth/signup" : "/auth/login";

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword,
                    age_range: isSignup ? signupAgeRange : undefined,
                    gender: isSignup ? signupGender : undefined,
                    zip: isSignup ? signupZip : undefined
                })
            });
            const data = await res.json();

            if (data.token) {
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('authToken', data.token);
                setIsLoginOpen(false);
                setLoginEmail('');
                setLoginPassword('');
                setSignupAgeRange('');
                setSignupGender('');
                setSignupZip('');
                showToast("Login successful!", "success");
                loadWorkouts(data.token);
            } else if (data.success && isSignup) {
                showToast("Signup successful! Please login.", "success");
                setIsSignup(false);
                setLoginPassword('');
                setSignupAgeRange('');
                setSignupGender('');
                setSignupZip('');
            } else {
                showToast(data.error || "Login failed", "error");
            }
        } catch (err) {
            showToast("Connection error.", "error");
            console.error("Login/Signup error:", err);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSyncing(true);
        try {
            const res = await fetch(`${API_URL}/api/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    age_range: signupAgeRange,
                    gender: signupGender,
                    zip: signupZip
                })
            });

            if (res.ok) {
                const updatedUser = {
                    ...user,
                    age_range: signupAgeRange,
                    gender: signupGender,
                    zip: signupZip
                };
                setUser(updatedUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                setIsProfileModalOpen(false);
                showToast("Profile updated successfully!", "success");
            } else {
                const data = await res.json();
                showToast(data.error || "Update failed", "error");
            }
        } catch (err) {
            console.error("Profile update error:", err);
            showToast("Connection error.", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleLogout = () => {
        setUser(null);
        setToken(null);
        setWorkouts(DEFAULT_PRESETS);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
    };

    const loadWorkouts = async (authToken) => {
        if (!authToken) return;
        setIsSyncing(true);
        try {
            const res = await fetch(`${API_URL}/api/workouts`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setWorkouts(data.length > 0 ? data : DEFAULT_PRESETS);
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Load failed:", res.status, errorData);
                // alert(`Sync Error: Could not load workouts (${res.status})`);
            }
        } catch (err) {
            console.error("Load failed", err);
            showToast("Sync server connection error.", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    const saveWorkoutsToCloud = async (newWorkouts) => {
        if (!token) return;
        setIsSyncing(true);
        try {
            const res = await fetch(`${API_URL}/api/workouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newWorkouts)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Save failed:", res.status, errorData);
                showToast(`Cloud Sync Error (${res.status})`, "error");
            }
        } catch (err) {
            console.error("Save failed", err);
            showToast("Cloud connection error.", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    const loadSessionHistory = async (token) => {
        try {
            const res = await fetch(`${API_URL}/api/sessions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSessionHistory(data);
            }
        } catch (err) {
            console.error("Failed to load session history", err);
        }
    };

    useEffect(() => {
        if (token) {
            loadWorkouts(token);
            loadSessionHistory(token);
        }
    }, [token]);

    const saveSession = async () => {
        if (completedWorkouts.length === 0) return;
        const sessionName = prompt("Enter session name (e.g., Morning Routine):", `Session ${new Date().toLocaleDateString()}`);
        if (!sessionName) return;

        setIsSavingSession(true);
        try {
            const res = await fetch(`${API_URL}/api/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: sessionName,
                    workouts: completedWorkouts.map(id => {
                        const w = workouts.find(work => work.id === id);
                        return w ? { ...w } : { id, name: 'Unknown Workout', duration: 0 };
                    })
                })
            });

            if (res.ok) {
                showToast("Session saved!", "success");
                setCompletedWorkouts([]);
                loadSessionHistory(token);
            } else {
                showToast("Failed to save session", "error");
            }
        } catch (err) {
            showToast("Connection error", "error");
        } finally {
            setIsSavingSession(false);
        }
    };

    const startNewSession = () => {
        if (completedWorkouts.length > 0 && !confirm("Clear current session statistics and start over?")) {
            return;
        }
        setCompletedWorkouts([]);
        showToast("New session started");
    };

    const deleteHistorySession = async (e, sessionId) => {
        e.stopPropagation();

        try {
            const res = await fetch(`${API_URL}/api/sessions`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ session_id: sessionId })
            });

            if (res.ok) {
                showToast("Session removed");
                setSessionHistory(prev => prev.filter(s => s.session_id !== sessionId));
                if (selectedSession?.session_id === sessionId) setSelectedSession(null);
            } else {
                showToast("Failed to remove session", "error");
            }
        } catch (err) {
            showToast("Connection error", "error");
        }
    };

    const startWorkout = (workout) => {
        setActiveWorkout(workout);
        if ('wakeLock' in navigator) {
            try { navigator.wakeLock.request('screen'); } catch (e) { console.log(e); }
        }
    };

    const stopWorkout = (completedId = null, wasAutoComplete = false) => {
        setActiveWorkout(null);
        if (completedId) {
            setCompletedWorkouts(prev => [...prev, completedId]);

            // Auto-flow logic: find the next workout in the sequence
            if (wasAutoComplete) {
                const currentIndex = workouts.findIndex(w => w.id === completedId);
                if (currentIndex !== -1 && currentIndex < workouts.length - 1) {
                    const nextWorkout = workouts[currentIndex + 1];
                    // Briefly wait to show completion before starting next
                    setTimeout(() => {
                        startWorkout(nextWorkout);
                    }, 1500);
                }
            }
        }
    };

    const startCreating = () => {
        setEditingId(null);
        setModalData({ name: '', duration: 60, type: 'gentle', chime: 'gentle' });
        setIsModalOpen(true);
    };

    const startEditing = (e, workout) => {
        e.stopPropagation();
        setEditingId(workout.id);
        setModalData({ name: workout.name, duration: workout.duration, type: workout.type, chime: workout.chime || 'high' });
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!modalData.name) return;

        const newWorkout = {
            id: editingId || Date.now(),
            name: modalData.name,
            duration: modalData.duration,
            type: modalData.type,
            chime: modalData.chime
        };

        let updated;
        if (editingId) {
            updated = workouts.map(w => w.id === editingId ? newWorkout : w);
        } else {
            updated = [...workouts, newWorkout];
        }

        setWorkouts(updated);
        if (token) {
            saveWorkoutsToCloud(updated);
        }
        setIsModalOpen(false);
    };

    const deleteWorkout = (e, id) => {
        e.stopPropagation();
        const updated = workouts.filter(w => w.id !== id);
        setWorkouts(updated);
        if (token) {
            saveWorkoutsToCloud(updated);
        }
    };

    const totalDurationSeconds = workouts.reduce((acc, curr) => acc + curr.duration, 0);
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

    const handleExport = () => {
        const dataStr = JSON.stringify(workouts, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'my-workouts.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedWorkouts = JSON.parse(event.target.result);
                if (Array.isArray(importedWorkouts)) {
                    const merged = [...workouts];
                    importedWorkouts.forEach(imported => {
                        if (!merged.find(w => w.id === imported.id)) {
                            merged.push(imported);
                        } else {
                            merged.push({ ...imported, id: Date.now() + Math.random() });
                        }
                    });
                    setWorkouts(merged);
                    if (token) saveWorkoutsToCloud(merged);
                }
            } catch (err) {
                console.error("Import failed", err);
                showToast("Invalid file format.", "error");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className={styles.container}>
            {!activeWorkout ? (
                <main className={styles.dashboard}>
                    <header className={styles.header}>
                        <div className={styles.titleSection}>
                            <img src="/logo.png" alt="Flow Laya Logo" style={{ width: '240px', height: 'auto', marginBottom: '1rem' }} />
                            <h1 className={styles.title}>Dashboard {isSyncing && <span className={styles.syncing}>◌</span>}</h1>
                            <div className={styles.subtitle}>Practice in rhythm</div>
                            <div className={styles.totalTime}>{totalDurationMinutes} min total</div>
                        </div>
                        <div className={styles.userControls}>
                            {user ? (() => {
                                const email = typeof user === 'object' ? user?.email : user;
                                const age = typeof user === 'object' ? user?.age_range : null;
                                const gender = typeof user === 'object' ? user?.gender : null;
                                const zip = typeof user === 'object' ? user?.zip : null;

                                let score = 0;
                                if (email) score += 25;
                                if (age) score += 25;
                                if (gender) score += 25;
                                if (zip) score += 25;

                                return (
                                    <div
                                        className={styles.userInfo}
                                        style={{
                                            background: `linear-gradient(to right, rgba(0, 255, 136, 0.15) ${score}%, rgba(0, 0, 0, 0.02) ${score}%)`,
                                            border: `1px solid rgba(0, 255, 136, ${score / 200 + 0.1})`
                                        }}
                                    >
                                        <div className={styles.profileCompleteness}>
                                            <div className={styles.completenessBadge} title="Profile Completeness">
                                                {score}% Complete {score < 100 && (
                                                    <span
                                                        className={styles.completeNow}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSignupAgeRange(user.age_range || '');
                                                            setSignupGender(user.gender || '');
                                                            setSignupZip(user.zip || '');
                                                            setIsProfileModalOpen(true);
                                                        }}
                                                    >
                                                        Complete Now
                                                    </span>
                                                )}
                                            </div>
                                            <span>{email}</span>
                                        </div>
                                        <button onClick={handleLogout} className={styles.authBtn}>Logout</button>
                                    </div>
                                );
                            })() : (
                                <button onClick={() => setIsLoginOpen(true)} className={styles.authBtn}>Login to Sync</button>
                            )}

                            <div className={styles.portability}>
                                <button onClick={handleExport} className={styles.portBtn}>Export Data</button>
                                <label className={styles.portBtn}>
                                    Import Data
                                    <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>
                    </header>

                    <section className={styles.presetGrid}>
                        {workouts.map((workout) => (
                            <div
                                key={workout.id}
                                className={`
                                    ${styles.presetCard} 
                                    ${workout.type === 'gentle' ? styles.cardGentle : ''}
                                    ${completedWorkouts.includes(workout.id) ? styles.cardCompleted : ''}
                                `}
                                onClick={() => startWorkout(workout)}
                            >
                                <div className={styles.cardActions}>
                                    <button className={styles.editBtn} onClick={(e) => startEditing(e, workout)}>✎</button>
                                    <button className={styles.deleteBtn} onClick={(e) => deleteWorkout(e, workout.id)}>×</button>
                                </div>
                                <h3 className={styles.presetName}>{workout.name}</h3>
                                <div className={styles.presetDetails}>
                                    <span className={styles.presetTime}>{Math.floor(workout.duration / 60)}m</span>
                                    {workout.type === 'gentle' && <span className={styles.tagGentle}>Yoga</span>}
                                </div>
                            </div>
                        ))}
                        <div className={styles.addCard} onClick={startCreating}>+</div>
                    </section>

                    <section className={styles.statsSection}>
                        <div className={styles.statsRow}>
                            <div className={styles.statBox}>
                                <span className={styles.statValue}>{completedWorkouts.length}</span>
                                <span className={styles.statLabel}>Completed</span>
                            </div>
                            <div className={styles.statBox}>
                                <span className={styles.statValue}>
                                    {Math.round(completedWorkouts.reduce((acc, id) => {
                                        const w = workouts.find(work => work.id === id);
                                        return acc + (w ? w.duration : 0);
                                    }, 0) / 60)}
                                </span>
                                <span className={styles.statLabel}>Total Min</span>
                            </div>
                            <div className={styles.statActions}>
                                <button
                                    onClick={saveSession}
                                    className={styles.sessionBtn}
                                    disabled={completedWorkouts.length === 0 || isSavingSession || !token}
                                    title={!token ? "Login to save sessions" : ""}
                                >
                                    {isSavingSession ? "..." : "Save Session"}
                                </button>
                                <button
                                    onClick={startNewSession}
                                    className={styles.sessionBtn}
                                    disabled={completedWorkouts.length === 0}
                                >
                                    New Session
                                </button>
                            </div>
                        </div>
                    </section>

                    {token && sessionHistory.length > 0 && (
                        <section className={styles.historySection}>
                            <h2 className={styles.sectionTitle}>Session History</h2>
                            <div className={styles.historyList}>
                                {sessionHistory.map(session => (
                                    <div
                                        key={session.session_id}
                                        className={`${styles.historyItem} ${selectedSession?.session_id === session.session_id ? styles.historyItemExpanded : ''}`}
                                        onClick={() => setSelectedSession(selectedSession?.session_id === session.session_id ? null : session)}
                                    >
                                        <div className={styles.historyMain}>
                                            <div className={styles.historyInfo}>
                                                <span className={styles.historyName}>{session.name}</span>
                                                <span className={styles.historyDate}>
                                                    {new Date(parseInt(session.session_id)).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className={styles.historyControls}>
                                                <div className={styles.historyStats}>
                                                    {session.workouts.length} workouts
                                                </div>
                                                <button
                                                    className={styles.sessionDeleteBtn}
                                                    onClick={(e) => deleteHistorySession(e, session.session_id)}
                                                    title="Remove from history"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>

                                        {selectedSession?.session_id === session.session_id && (
                                            <div className={styles.sessionDetailListInline} onClick={e => e.stopPropagation()}>
                                                {session.workouts.map((w, idx) => {
                                                    const workout = (w && typeof w === 'object') ? w : (workouts.find(p => p.id === w) || { name: 'Legacy Workout', duration: 0 });
                                                    return (
                                                        <div key={idx} className={styles.sessionDetailItemMini}>
                                                            <div className={styles.detailInfo}>
                                                                <span className={styles.detailName}>{workout.name}</span>
                                                                <span className={styles.detailType} style={{ color: workout.type === 'gentle' ? '#a594f9' : '#00ff88' }}>
                                                                    {workout.type === 'gentle' ? 'Yoga' : 'Standard'}
                                                                </span>
                                                            </div>
                                                            <span className={styles.detailDuration}>
                                                                {Math.floor((workout.duration || 0) / 60)}m {(workout.duration || 0) % 60}s
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className={styles.educationSection}>
                        <div className={styles.eduGrid}>
                            <div className={styles.eduCard}>
                                <h3>Why Yoga Matters</h3>
                                <p>
                                    Yoga is more than just physical movement. It is a path to mental clarity,
                                    stress reduction, and holistic well-being. By aligning breath with movement,
                                    you build a deeper connection between mind and body, fostering resilience
                                    in every aspect of life.
                                </p>
                            </div>
                            <div className={styles.eduCard}>
                                <h3>The Power of Laya</h3>
                                <p>
                                    <em>Laya</em> means rhythm or flow. In practice (<em>Abhyasa</em>),
                                    maintaining a consistent rhythm is what transforms effort into effortless
                                    grace. This tracker helps you visualize your consistency, ensuring that
                                    your rhythm remains steady as you grow.
                                </p>
                            </div>
                        </div>
                    </section>

                    {isLoginOpen && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <h2>{isSignup ? "Create Account" : "Sync Workouts"}</h2>
                                <form onSubmit={handleLogin}>
                                    <input
                                        type="email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                        placeholder="Email"
                                    />
                                    <input
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                        placeholder="Password"
                                        style={{ marginTop: '1rem' }}
                                    />
                                    {isSignup && (
                                        <>
                                            <select
                                                value={signupAgeRange}
                                                onChange={(e) => setSignupAgeRange(e.target.value)}
                                                style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                                            >
                                                <option value="">Age Range (Optional)</option>
                                                <option value="<18">&lt;18</option>
                                                <option value="18-24">18-24</option>
                                                <option value="25-30">25-30</option>
                                                <option value="31-40">31-40</option>
                                                <option value="41-50">41-50</option>
                                                <option value="51-60">51-60</option>
                                            </select>
                                            <select
                                                value={signupGender}
                                                onChange={(e) => setSignupGender(e.target.value)}
                                                style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                                            >
                                                <option value="">Gender (Optional)</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                                <option value="prefer_not_to_say">Prefer not to say</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={signupZip}
                                                onChange={(e) => setSignupZip(e.target.value)}
                                                placeholder="Zip Code (Optional)"
                                                style={{ marginTop: '1rem' }}
                                            />
                                        </>
                                    )}
                                    <div className={styles.modalActions}>
                                        <button type="button" onClick={() => setIsLoginOpen(false)}>Cancel</button>
                                        <button type="submit" className={styles.saveBtn} disabled={isSyncing}>
                                            {isSyncing ? "..." : (isSignup ? "Sign Up" : "Login")}
                                        </button>
                                    </div>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>
                                        {isSignup ? "Already have an account?" : "No account yet?"}{" "}
                                        <span onClick={() => setIsSignup(!isSignup)} style={{ color: '#00ff88', cursor: 'pointer', textDecoration: 'underline' }}>
                                            {isSignup ? "Login" : "Sign Up"}
                                        </span>
                                    </p>
                                </form>
                            </div>
                        </div>
                    )}

                    {isProfileModalOpen && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <h2>Update Profile</h2>
                                <form onSubmit={handleUpdateProfile}>
                                    <select
                                        value={signupAgeRange}
                                        onChange={(e) => setSignupAgeRange(e.target.value)}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: 'black', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                                    >
                                        <option value="">Age Range (Optional)</option>
                                        <option value="<18">&lt;18</option>
                                        <option value="18-24">18-24</option>
                                        <option value="25-30">25-30</option>
                                        <option value="31-40">31-40</option>
                                        <option value="41-50">41-50</option>
                                        <option value="51-60">51-60</option>
                                    </select>
                                    <select
                                        value={signupGender}
                                        onChange={(e) => setSignupGender(e.target.value)}
                                        style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', borderRadius: '10px', background: 'black', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                                    >
                                        <option value="">Gender (Optional)</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer_not_to_say">Prefer not to say</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={signupZip}
                                        onChange={(e) => setSignupZip(e.target.value)}
                                        placeholder="Zip Code (Optional)"
                                        style={{ marginTop: '1rem' }}
                                    />
                                    <div className={styles.modalActions}>
                                        <button type="button" onClick={() => setIsProfileModalOpen(false)}>Cancel</button>
                                        <button type="submit" className={styles.saveBtn} disabled={isSyncing}>
                                            {isSyncing ? "..." : "Save Profile"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {isModalOpen && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <h2>{editingId ? 'Edit Workout' : 'New Workout'}</h2>
                                <form onSubmit={handleSave}>
                                    <input
                                        type="text"
                                        value={modalData.name}
                                        onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                                        required
                                        placeholder="Workout Name"
                                    />
                                    <div className={styles.formRow}>
                                        <label>
                                            Secs
                                            <input
                                                type="number"
                                                value={modalData.duration}
                                                onChange={(e) => setModalData({ ...modalData, duration: parseInt(e.target.value) })}
                                            />
                                        </label>
                                        <label>
                                            Type
                                            <select value={modalData.type} onChange={(e) => setModalData({ ...modalData, type: e.target.value })}>
                                                <option value="high">Standard</option>
                                                <option value="gentle">Yoga</option>
                                            </select>
                                        </label>
                                        <label>
                                            Chime
                                            <select value={modalData.chime} onChange={(e) => setModalData({ ...modalData, chime: e.target.value })}>
                                                <option value="high">Standard (Beep)</option>
                                                <option value="gentle">Yoga (Chime/Gong)</option>
                                            </select>
                                        </label>
                                    </div>
                                    <div className={styles.modalActions}>
                                        <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                        <button type="submit" className={styles.saveBtn}>Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            ) : (
                <Timer
                    workoutName={activeWorkout.name}
                    duration={activeWorkout.duration}
                    beepType={activeWorkout.chime || activeWorkout.type}
                    onComplete={(isManual) => stopWorkout(activeWorkout.id, !isManual)}
                />
            )
            }
            {
                toast.message && (
                    <div className={`${styles.toast} ${styles[toast.type]}`}>
                        {toast.message}
                    </div>
                )
            }
        </div >
    );
}

export default App;
