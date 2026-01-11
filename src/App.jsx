import { useState, useEffect } from 'react';
import Timer from './components/timer/Timer';
import styles from './App.module.css';

const WORKOUT_TEMPLATES = {
    "15min": [
        { id: 't1-1', name: 'Warm Up', duration: 180, type: 'gentle', chime: 'gentle' },
        { id: 't1-2', name: 'Main Flow', duration: 420, type: 'active', chime: 'high' },
        { id: 't1-3', name: 'Cool Down', duration: 300, type: 'gentle', chime: 'gentle' }
    ],
    "30min": [
        { id: 't2-1', name: 'Sun Salutations', duration: 300, type: 'gentle', chime: 'gentle' },
        { id: 't2-2', name: 'Standing Poses', duration: 600, type: 'active', chime: 'high' },
        { id: 't2-3', name: 'Balance Flow', duration: 600, type: 'active', chime: 'high' },
        { id: 't2-4', name: 'Savasana', duration: 300, type: 'gentle', chime: 'gentle' }
    ],
    "30min_yoga": [
        { id: 't3-1', name: 'Centering', duration: 300, type: 'gentle', chime: 'gentle' },
        { id: 't3-2', name: 'Gentle Flow', duration: 900, type: 'gentle', chime: 'gentle' },
        { id: 't3-3', name: 'Deep Stretch', duration: 600, type: 'gentle', chime: 'gentle' }
    ],
    "45min": [
        { id: 't4-1', name: 'Pranayama', duration: 300, type: 'gentle', chime: 'gentle' },
        { id: 't4-2', name: 'Warm Up Vinyasa', duration: 600, type: 'active', chime: 'high' },
        { id: 't4-3', name: 'Core Work', duration: 600, type: 'active', chime: 'high' },
        { id: 't4-4', name: 'Peak Poses', duration: 900, type: 'active', chime: 'high' },
        { id: 't4-5', name: 'Relaxation', duration: 300, type: 'gentle', chime: 'gentle' }
    ],
    "60min": [
        { id: 't5-1', name: 'Meditation', duration: 300, type: 'gentle', chime: 'gentle' },
        { id: 't5-2', name: 'Warm Up', duration: 600, type: 'active', chime: 'high' },
        { id: 't5-3', name: 'Flow Sequence 1', duration: 900, type: 'active', chime: 'high' },
        { id: 't5-4', name: 'Flow Sequence 2', duration: 900, type: 'active', chime: 'high' },
        { id: 't5-5', name: 'Floor Work', duration: 600, type: 'gentle', chime: 'gentle' },
        { id: 't5-6', name: 'Savasana', duration: 300, type: 'gentle', chime: 'gentle' }
    ]
};

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
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [signupAgeRange, setSignupAgeRange] = useState('');
    const [signupGender, setSignupGender] = useState('');
    const [signupZip, setSignupZip] = useState('');
    const [signupDisplayName, setSignupDisplayName] = useState('');
    const [userRank, setUserRank] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [toast, setToast] = useState({ message: '', type: null });
    const [workouts, setWorkouts] = useState(DEFAULT_PRESETS);
    const [activeWorkout, setActiveWorkout] = useState(null);
    const [sessionHistory, setSessionHistory] = useState([]);
    const [isSavingSession, setIsSavingSession] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [muteBeeps, setMuteBeeps] = useState(() => localStorage.getItem('muteBeeps') === 'true');
    const [nextWorkoutPending, setNextWorkoutPending] = useState(null);
    const [currentSessionId, setCurrentSessionId] = useState(() => localStorage.getItem('currentSessionId') || null);
    // Cache for User's "Actual" Template (Custom Routine)
    const [savedCustomWorkouts, setSavedCustomWorkouts] = useState(null);
    const [statsTimeframe, setStatsTimeframe] = useState('week');

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: '', type: null }), 3000);
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ name: '', duration: 60, type: 'gentle', chime: 'gentle' });
    const [editingId, setEditingId] = useState(null);
    const [completedWorkouts, setCompletedWorkouts] = useState([]);
    const [completedWorkoutDetails, setCompletedWorkoutDetails] = useState([]);
    const [isResetMode, setIsResetMode] = useState(false);
    const [resetStep, setResetStep] = useState('request'); // 'request' or 'confirm'
    const [resetEmail, setResetEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

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
                    zip: isSignup ? signupZip : undefined,
                    display_name: isSignup ? signupDisplayName : undefined
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
                setSignupDisplayName('');
                showToast("Login successful!", "success");
                loadWorkouts(data.token);
                fetchUserRank(data.token);
            } else if (data.success && isSignup) {
                showToast("Signup successful! Please login.", "success");
                setIsSignup(false);
                setLoginPassword('');
                setSignupAgeRange('');
                setSignupGender('');
                setSignupZip('');
                setSignupDisplayName('');
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

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setIsSyncing(true);
        try {
            const res = await fetch(`${API_URL}/auth/request-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail })
            });
            const data = await res.json();

            if (data.success) {
                setResetStep('confirm');
                showToast("Reset code sent! Check server console.", "success");
            } else {
                showToast(data.error || "Request failed", "error");
            }
        } catch (err) {
            showToast("Connection error.", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsSyncing(true);
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: resetEmail,
                    resetCode: resetCode,
                    newPassword: newPassword
                })
            });
            const data = await res.json();

            if (data.success) {
                showToast("Password reset successful!", "success");
                setIsResetMode(false);
                setResetStep('request');
                setResetEmail('');
                setResetCode('');
                setNewPassword('');
            } else {
                showToast(data.error || "Reset failed", "error");
            }
        } catch (err) {
            showToast("Connection error.", "error");
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
                    zip: signupZip,
                    display_name: signupDisplayName
                })
            });

            if (res.ok) {
                const updatedUser = {
                    ...user,
                    age_range: signupAgeRange,
                    gender: signupGender,
                    zip: signupZip,
                    display_name: signupDisplayName
                };
                setUser(updatedUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                setIsProfileModalOpen(false);
                showToast("Profile updated successfully!", "success");
            } else {
                const data = await res.json();
                showToast(data.error || "Failed to update profile", "error");
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
                const loaded = data.length > 0 ? data : DEFAULT_PRESETS;
                setWorkouts(loaded);
                setSavedCustomWorkouts(loaded); // Initialize custom cache
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

    const selectTemplate = (templateKey) => {
        if (!templateKey) return;

        // Only confirm if user has actually done some work in current session
        if (completedWorkouts.length > 0 && !confirm("This will replace your current workout list. Continue?")) {
            return;
        }

        if (templateKey === 'custom') {
            if (savedCustomWorkouts) {
                setWorkouts(savedCustomWorkouts);
                if (token) saveWorkoutsToCloud(savedCustomWorkouts);
                showToast("Custom routine restored!", "success");
            } else {
                showToast("No custom routine saved.", "error");
            }
            return;
        }

        const template = WORKOUT_TEMPLATES[templateKey];
        if (template) {
            // Generate unique IDs for the template items to avoid conflicts
            const newWorkouts = template.map(item => ({
                ...item,
                id: Date.now() + Math.random() // Ensure unique ID
            }));
            setWorkouts(newWorkouts);
            if (token) saveWorkoutsToCloud(newWorkouts);
            showToast("Template loaded!", "success");
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
                fetchUserRank(token);
            }
        } catch (err) {
            console.error("Failed to load session history", err);
        }
    };

    const fetchUserRank = async (authToken) => {
        if (!authToken) return;
        try {
            const res = await fetch(`${API_URL}/api/user-rank`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUserRank(data);
            }
        } catch (err) {
            console.error("Failed to fetch user rank", err);
        }
    };

    useEffect(() => {
        if (token) {
            loadWorkouts(token);
            loadSessionHistory(token);
        }
    }, [token]);

    const autoSaveSession = async (workoutDetails) => {
        if (!token || workoutDetails.length === 0) return;

        try {
            // Get today's date string (YYYY-MM-DD)
            const today = new Date().toISOString().split('T')[0];

            // Always read from localStorage to get the most current value
            let sessionId = localStorage.getItem('currentSessionId');
            const storedDate = localStorage.getItem('currentSessionDate');

            // Reset session if date has changed
            if (storedDate !== today) {
                sessionId = null;
                localStorage.removeItem('currentSessionId');
                localStorage.removeItem('currentSessionDate');
                setCurrentSessionId(null);
            }

            // Generate a new session ID if we don't have one
            if (!sessionId) {
                sessionId = `${today}-${Date.now()}`;
                setCurrentSessionId(sessionId);
                localStorage.setItem('currentSessionId', sessionId);
                localStorage.setItem('currentSessionDate', today);
            }

            console.log('Saving to session:', sessionId); // Debug log

            const res = await fetch(`${API_URL}/api/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    name: `Auto-Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                    workouts: workoutDetails
                })
            });

            if (res.ok) {
                loadSessionHistory(token);
            }
        } catch (err) {
            console.error("Auto-save failed", err);
        }
    };

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
        setCompletedWorkoutDetails([]);
        setCurrentSessionId(null);
        localStorage.removeItem('currentSessionId');
        localStorage.removeItem('currentSessionDate');
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

    const moveWorkout = (e, index, direction) => {
        e.stopPropagation();
        const newWorkouts = [...workouts];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newWorkouts.length) return;

        [newWorkouts[index], newWorkouts[newIndex]] = [newWorkouts[newIndex], newWorkouts[index]];
        setWorkouts(newWorkouts);
        setSavedCustomWorkouts(newWorkouts);
        if (token) saveWorkoutsToCloud(newWorkouts);
        showToast("Order updated", "success");
    };

    const startWorkout = (workout) => {
        setActiveWorkout(workout);
        setNextWorkoutPending(null);
        if ('wakeLock' in navigator) {
            try { navigator.wakeLock.request('screen'); } catch (e) { console.log(e); }
        }
    };

    const stopWorkout = (completedId = null, wasAutoComplete = false) => {
        setActiveWorkout(null);
        if (completedId) {
            const newCompleted = [...completedWorkouts, completedId];
            setCompletedWorkouts(newCompleted);

            // Add workout details with timestamp
            const workout = workouts.find(w => w.id === completedId);
            const workoutDetail = workout ? { ...workout, completedAt: Date.now() } : { id: completedId, name: 'Unknown Workout', duration: 0, completedAt: Date.now() };
            const newDetails = [...completedWorkoutDetails, workoutDetail];
            setCompletedWorkoutDetails(newDetails);

            autoSaveSession(newDetails);

            // Manual flow logic: offer the next workout in the sequence
            if (wasAutoComplete) {
                const currentIndex = workouts.findIndex(w => w.id === completedId);
                if (currentIndex !== -1 && currentIndex < workouts.length - 1) {
                    const nextWorkout = workouts[currentIndex + 1];
                    setNextWorkoutPending(nextWorkout);
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
        setSavedCustomWorkouts(updated); // Update custom cache on edit
        if (token) {
            saveWorkoutsToCloud(updated);
        }
        setIsModalOpen(false);
    };

    const deleteWorkout = (e, id) => {
        e.stopPropagation();
        const updated = workouts.filter(w => w.id !== id);
        setWorkouts(updated);
        setSavedCustomWorkouts(updated); // Update custom cache on delete
        if (token) {
            saveWorkoutsToCloud(updated);
        }
    };

    const totalDurationSeconds = workouts.reduce((acc, curr) => acc + curr.duration, 0);
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

    const getChartData = () => {
        const days = statsTimeframe === 'week' ? 7 : 30;
        const data = [];
        const now = new Date();
        now.setHours(23, 59, 59, 999);

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString();

            // Filter sessions for this day
            const daySessions = sessionHistory.filter(s => {
                const sDate = new Date(parseInt(s.session_id));
                return sDate.toLocaleDateString() === dateStr;
            });

            const totalMinutes = daySessions.reduce((acc, s) => {
                const sessionMins = s.workouts.reduce((wAcc, w) => wAcc + (w.duration || 0), 0) / 60;
                return acc + sessionMins;
            }, 0);

            data.push({
                label: days === 7 ? d.toLocaleDateString(undefined, { weekday: 'short' }) : d.getDate(),
                fullDate: dateStr,
                value: Math.round(totalMinutes)
            });
        }

        const maxValue = Math.max(...data.map(d => d.value), 1);
        return data.map(d => ({
            ...d,
            height: `${(d.value / maxValue) * 100}%`
        }));
    };

    const handleExport = () => {
        const exportData = {
            workouts: workouts,
            sessionHistory: sessionHistory,
            exportDate: new Date().toISOString(),
            version: "1.1"
        };
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `flow-laya-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("Backup exported!", "success");
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                let importedWorkouts = [];

                if (Array.isArray(importedData)) {
                    // Legacy format: just an array of workouts
                    importedWorkouts = importedData;
                } else if (importedData && typeof importedData === 'object' && importedData.workouts) {
                    // New format: object with workouts and potentially sessionHistory
                    importedWorkouts = importedData.workouts;
                    // Note: We currently only import workouts as per user request, 
                    // but we have sessionHistory in the file for future or manual use.
                }

                if (importedWorkouts.length > 0) {
                    const merged = [...workouts];
                    importedWorkouts.forEach(imported => {
                        if (!merged.find(w => w.id === imported.id)) {
                            merged.push(imported);
                        } else {
                            merged.push({ ...imported, id: Date.now() + Math.random() });
                        }
                    });
                    setWorkouts(merged);
                    setSavedCustomWorkouts(merged); // Update custom cache on import
                    if (token) saveWorkoutsToCloud(merged);
                    showToast("Workouts imported!", "success");
                } else {
                    showToast("No workouts found in file.", "error");
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
                            <div className={styles.brandGroup}>
                                <img src="/logo.png" alt="Flow Laya Logo" style={{ width: '240px', height: 'auto' }} />
                                <h1 className={styles.title}>Dashboard {isSyncing && <span className={styles.syncing}>◌</span>}</h1>
                            </div>
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
                                            background: score > 0 ? `linear-gradient(to right, rgba(123, 47, 247, 0.15) ${score}%, rgba(0, 0, 0, 0.02) ${score}%)` : 'rgba(0, 0, 0, 0.02)',
                                            border: `1px solid rgba(123, 47, 247, ${score / 200 + 0.1})`
                                        }}
                                    >
                                        <div className={styles.userMainInfo}>
                                            <span style={{ fontWeight: 600, color: '#7b2ff7' }}>{user.display_name || email}</span>
                                            {userRank && (
                                                <div className={styles.rankBadge}>
                                                    Rank: #{userRank.rankWeek} (W) | #{userRank.rankMonth} (M)
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.profileCompleteness}>
                                            <div className={styles.completenessBadge} title="Profile Completeness">
                                                {score}% Complete
                                                <span
                                                    className={styles.completeNow}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSignupAgeRange(user.age_range || '');
                                                        setSignupGender(user.gender || '');
                                                        setSignupZip(user.zip || '');
                                                        setSignupDisplayName(user.display_name || '');
                                                        setIsProfileModalOpen(true);
                                                    }}
                                                >
                                                    {score < 100 ? "Complete Now" : "Edit Profile"}
                                                </span>
                                            </div>
                                        </div>
                                        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
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

                        <div className={styles.settingsSection}>
                            {user && (
                                <select
                                    onChange={(e) => selectTemplate(e.target.value)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(123, 47, 247, 0.3)',
                                        background: 'rgba(123, 47, 247, 0.15)',
                                        color: '#7b2ff7',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        fontWeight: '600'
                                    }}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Load Template...</option>
                                    <option value="custom">My Custom Routine</option>
                                    <option disabled>──────────</option>
                                    <option value="15min">15 Minute Quick Session</option>
                                    <option value="30min">30 Minute Standard Session</option>
                                    <option value="30min_yoga">30 Minute Yoga Flow</option>
                                    <option value="45min">45 Minute Extended Session</option>
                                    <option value="60min">1 Hour Full Practice</option>
                                </select>
                            )}
                            <label className={styles.settingToggle}>
                                <input
                                    type="checkbox"
                                    checked={muteBeeps}
                                    onChange={(e) => {
                                        const val = e.target.checked;
                                        setMuteBeeps(val);
                                        localStorage.setItem('muteBeeps', val);
                                    }}
                                />
                                <span>Mute Countdown Beeps</span>
                            </label>
                        </div>
                    </header>



                    {nextWorkoutPending && (
                        <section className={styles.nextWorkoutSection}>
                            <div className={styles.nextWorkoutCard}>
                                <div className={styles.nextWorkoutInfo}>
                                    <span className={styles.nextLabel}>Next Up</span>
                                    <h3>{nextWorkoutPending.name}</h3>
                                    <span className={styles.nextDuration}>{Math.floor(nextWorkoutPending.duration / 60)}m {nextWorkoutPending.duration % 60}s</span>
                                </div>
                                <button className={styles.startNextBtn} onClick={() => startWorkout(nextWorkoutPending)}>
                                    Start Now
                                </button>
                            </div>
                        </section>
                    )}

                    <section className={styles.presetGrid}>
                        {workouts.map((workout, index) => (
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
                                    <div className={styles.reorderGroup}>
                                        <button
                                            className={styles.reorderBtn}
                                            onClick={(e) => moveWorkout(e, index, -1)}
                                            disabled={index === 0}
                                        >
                                            ‹
                                        </button>
                                        <button
                                            className={styles.reorderBtn}
                                            onClick={(e) => moveWorkout(e, index, 1)}
                                            disabled={index === workouts.length - 1}
                                        >
                                            ›
                                        </button>
                                    </div>
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

                    {user && (
                        <section className={styles.statsChartSection}>
                            <div className={styles.chartHeader}>
                                <h3>Your Activity</h3>
                                <div className={styles.timeframeToggle}>
                                    <button
                                        className={`${styles.timeframeBtn} ${statsTimeframe === 'week' ? styles.timeframeBtnActive : ''}`}
                                        onClick={() => setStatsTimeframe('week')}
                                    >
                                        Week
                                    </button>
                                    <button
                                        className={`${styles.timeframeBtn} ${statsTimeframe === 'month' ? styles.timeframeBtnActive : ''}`}
                                        onClick={() => setStatsTimeframe('month')}
                                    >
                                        Month
                                    </button>
                                </div>
                            </div>
                            <div className={styles.chartContainer}>
                                {getChartData().map((d, idx) => (
                                    <div key={idx} className={styles.chartBarGroup}>
                                        <div
                                            className={styles.chartBar}
                                            style={{ height: d.height }}
                                            data-value={d.value}
                                        />
                                        <span className={styles.chartLabel}>{d.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

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
                                            <input
                                                type="text"
                                                value={signupDisplayName}
                                                onChange={(e) => setSignupDisplayName(e.target.value)}
                                                placeholder="Unique Display Name"
                                                required
                                                style={{ marginTop: '1rem' }}
                                            />
                                            <select
                                                value={signupAgeRange}
                                                onChange={(e) => setSignupAgeRange(e.target.value)}
                                                style={{ marginTop: '1rem' }}
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
                                                style={{ marginTop: '1rem' }}
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
                                    <div className={styles.authLinksContainer}>
                                        <p>
                                            {isSignup ? "Already have an account?" : "No account yet?"}{" "}
                                            <span onClick={() => setIsSignup(!isSignup)}>
                                                {isSignup ? "Login" : "Sign Up"}
                                            </span>
                                        </p>
                                        {!isSignup && (
                                            <p>
                                                <span onClick={() => { setIsLoginOpen(false); setIsResetMode(true); setResetStep('request'); }}>
                                                    Forgot Password?
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {isProfileModalOpen && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <h2>Update Profile</h2>
                                <form onSubmit={handleUpdateProfile}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.6)', marginLeft: '4px' }}>Display Name (Unique)</label>
                                        <input
                                            type="text"
                                            value={signupDisplayName}
                                            onChange={(e) => setSignupDisplayName(e.target.value)}
                                            placeholder="Display Name"
                                            style={{ marginTop: '0.3rem' }}
                                        />
                                    </div>
                                    <select
                                        value={signupAgeRange}
                                        onChange={(e) => setSignupAgeRange(e.target.value)}
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
                                        style={{ marginTop: '1rem' }}
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

                    {isResetMode && (
                        <div className={styles.modalOverlay}>
                            <div className={styles.modalContent}>
                                <h2>{resetStep === 'request' ? 'Reset Password' : 'Enter Reset Code'}</h2>
                                {resetStep === 'request' ? (
                                    <form onSubmit={handleRequestReset}>
                                        <input
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            required
                                            placeholder="Email"
                                        />
                                        <div className={styles.modalActions}>
                                            <button type="button" onClick={() => { setIsResetMode(false); setResetEmail(''); }}>Cancel</button>
                                            <button type="submit" className={styles.saveBtn} disabled={isSyncing}>
                                                {isSyncing ? "..." : "Send Reset Code"}
                                            </button>
                                        </div>
                                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
                                            Check server console for reset code
                                        </p>
                                    </form>
                                ) : (
                                    <form onSubmit={handleResetPassword}>
                                        <input
                                            type="text"
                                            value={resetCode}
                                            onChange={(e) => setResetCode(e.target.value)}
                                            required
                                            placeholder="6-Digit Reset Code"
                                            maxLength="6"
                                        />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            placeholder="New Password"
                                            style={{ marginTop: '1rem' }}
                                        />
                                        <div className={styles.modalActions}>
                                            <button type="button" onClick={() => { setResetStep('request'); setResetCode(''); setNewPassword(''); }}>Back</button>
                                            <button type="submit" className={styles.saveBtn} disabled={isSyncing}>
                                                {isSyncing ? "..." : "Reset Password"}
                                            </button>
                                        </div>
                                    </form>
                                )}
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
                    muteBeeps={muteBeeps}
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
