import { useState, useEffect } from 'react';
import Timer from './components/timer/Timer';
import AdminPanel from './components/admin/AdminPanel';
import styles from './App.module.css';

const WORKOUT_TEMPLATES = {
    "15min-morning-flow": [
        { id: '15-1', name: 'Pranayama - Deep Breathing', duration: 180, type: 'gentle', chime: 'gentle', description: 'Seated breathing exercises to center and energize' },
        { id: '15-2', name: 'Cat-Cow Stretch', duration: 120, type: 'gentle', chime: 'gentle', description: 'Spinal warm-up and flexibility' },
        { id: '15-3', name: 'Downward Facing Dog', duration: 120, type: 'active', chime: 'medium', description: 'Full body stretch and strengthening' },
        { id: '15-4', name: 'Cobra Pose', duration: 120, type: 'active', chime: 'medium', description: 'Backbend for chest opening and spine strength' },
        { id: '15-5', name: 'Upward Facing Dog', duration: 120, type: 'active', chime: 'medium', description: 'Deeper backbend for energy and posture' },
        { id: '15-6', name: 'Standing Half Moon / Ardha Chandrasana', duration: 120, type: 'active', chime: 'high', description: 'Balance and side body stretch' },
        { id: '15-7', name: "Child's Pose - Savasana", duration: 120, type: 'gentle', chime: 'gentle', description: 'Final relaxation and integration' }
    ],
    "30min-energizing-flow": [
        { id: '30-1', name: 'Pranayama - Kapalabhati Breathing', duration: 240, type: 'gentle', chime: 'gentle', description: 'Energizing breath work' },
        { id: '30-2', name: 'Neck and Shoulder Rolls', duration: 120, type: 'gentle', chime: 'gentle', description: 'Release upper body tension' },
        { id: '30-3', name: 'Cat-Cow Flow', duration: 180, type: 'gentle', chime: 'gentle', description: 'Spinal mobility warm-up' },
        { id: '30-4', name: 'Sun Salutation A (3 rounds)', duration: 360, type: 'active', chime: 'high', description: 'Dynamic flow to build heat' },
        { id: '30-5', name: 'Warrior I', duration: 180, type: 'active', chime: 'high', description: 'Leg strength and hip opening' },
        { id: '30-6', name: 'Warrior II', duration: 180, type: 'active', chime: 'high', description: 'Building stamina and focus' },
        { id: '30-7', name: 'Triangle Pose', duration: 120, type: 'active', chime: 'medium', description: 'Side body stretch and balance' },
        { id: '30-8', name: 'Standing Forward Fold', duration: 120, type: 'gentle', chime: 'medium', description: 'Hamstring stretch and calming' },
        { id: '30-9', name: 'Bridge Pose', duration: 180, type: 'active', chime: 'medium', description: 'Hip opening and back strengthening' },
        { id: '30-10', name: 'Seated Twist', duration: 120, type: 'gentle', chime: 'gentle', description: 'Spinal detox and digestion' },
        { id: '30-11', name: 'Savasana', duration: 300, type: 'gentle', chime: 'gentle', description: 'Deep relaxation and integration' }
    ],
    "45min-complete-practice": [
        { id: '45-1', name: 'Pranayama - Nadi Shodhana', duration: 300, type: 'gentle', chime: 'gentle', description: 'Alternate nostril breathing for balance' },
        { id: '45-2', name: 'Meditation - Centering', duration: 180, type: 'gentle', chime: 'gentle', description: 'Mindful presence and intention setting' },
        { id: '45-3', name: 'Gentle Warm-up Flow', duration: 240, type: 'gentle', chime: 'gentle', description: 'Cat-Cow, neck rolls, shoulder circles' },
        { id: '45-4', name: 'Sun Salutation A (5 rounds)', duration: 600, type: 'active', chime: 'high', description: 'Build heat and establish rhythm' },
        { id: '45-5', name: 'Sun Salutation B (3 rounds)', duration: 480, type: 'active', chime: 'high', description: 'Add warrior poses and deeper flow' },
        { id: '45-6', name: 'Warrior III', duration: 180, type: 'active', chime: 'high', description: 'Balance and core strengthening' },
        { id: '45-7', name: 'Half Moon Pose', duration: 180, type: 'active', chime: 'high', description: 'Balance and hip opening' },
        { id: '45-8', name: 'Tree Pose', duration: 120, type: 'active', chime: 'medium', description: 'Focus and stability' },
        { id: '45-9', name: 'Crow Pose / Arm Balance', duration: 120, type: 'active', chime: 'high', description: 'Arm strength and body awareness' },
        { id: '45-10', name: 'Pigeon Pose', duration: 240, type: 'gentle', chime: 'medium', description: 'Deep hip opening (both sides)' },
        { id: '45-11', name: 'Seated Forward Fold', duration: 180, type: 'gentle', chime: 'gentle', description: 'Hamstring stretch and calming' },
        { id: '45-12', name: 'Reclined Spinal Twist', duration: 180, type: 'gentle', chime: 'gentle', description: 'Release tension from spine' },
        { id: '45-13', name: 'Legs Up the Wall', duration: 180, type: 'gentle', chime: 'gentle', description: 'Restore and calm nervous system' },
        { id: '45-14', name: 'Savasana', duration: 420, type: 'gentle', chime: 'gentle', description: 'Complete relaxation and absorption' }
    ],
    "60min-full-practice": [
        { id: '60-1', name: 'Opening Meditation', duration: 300, type: 'gentle', chime: 'gentle', description: 'Settle into practice and set intention' },
        { id: '60-2', name: 'Pranayama - Ujjayi Breathing', duration: 300, type: 'gentle', chime: 'gentle', description: 'Victorious breath to build internal heat' },
        { id: '60-3', name: 'Gentle Warm-up Sequence', duration: 300, type: 'gentle', chime: 'gentle', description: 'Joint mobilization and body awareness' },
        { id: '60-4', name: 'Sun Salutation A (6 rounds)', duration: 720, type: 'active', chime: 'high', description: 'Establish flow and build heat' },
        { id: '60-5', name: 'Sun Salutation B (5 rounds)', duration: 600, type: 'active', chime: 'high', description: 'Deepen practice with warrior poses' },
        { id: '60-6', name: 'Standing Sequence', duration: 480, type: 'active', chime: 'high', description: 'Warrior I, II, III, Triangle, Extended Side Angle' },
        { id: '60-7', name: 'Balance Poses', duration: 300, type: 'active', chime: 'high', description: 'Tree, Half Moon, Eagle Pose' },
        { id: '60-8', name: 'Core Strengthening', duration: 240, type: 'active', chime: 'high', description: 'Boat pose, plank variations' },
        { id: '60-9', name: 'Arm Balances / Inversions', duration: 240, type: 'active', chime: 'high', description: 'Crow, headstand prep, or handstand practice' },
        { id: '60-10', name: 'Backbending Sequence', duration: 360, type: 'active', chime: 'medium', description: 'Cobra, Upward Dog, Bow, Camel, Wheel' },
        { id: '60-11', name: 'Hip Openers', duration: 300, type: 'gentle', chime: 'medium', description: 'Pigeon, Lizard, Fire Log poses' },
        { id: '60-12', name: 'Seated Forward Folds', duration: 240, type: 'gentle', chime: 'gentle', description: 'Head to knee, wide-legged forward fold' },
        { id: '60-13', name: 'Spinal Twists', duration: 180, type: 'gentle', chime: 'gentle', description: 'Seated and reclined twists for detox' },
        { id: '60-14', name: 'Shoulder Stand / Legs Up Wall', duration: 240, type: 'gentle', chime: 'gentle', description: 'Inversion for calm and restoration' },
        { id: '60-15', name: 'Savasana', duration: 600, type: 'gentle', chime: 'gentle', description: 'Final relaxation - complete integration' }
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
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const handleLocationChange = () => setCurrentPath(window.location.pathname);
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);

    const isAdminDomain = window.location.hostname.includes('admin');

    if (isAdminDomain || currentPath.startsWith('/admin')) {
        return <AdminPanel onClose={isAdminDomain ? null : undefined} />;
    }

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
    const [resetEmail, setResetEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [subscriptionTier, setSubscriptionTier] = useState(() => {
        try {
            const saved = localStorage.getItem('currentUser');
            const u = saved ? JSON.parse(saved) : null;
            return u?.subscription_tier || 'free';
        } catch {
            return 'free';
        }
    });
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

    const STRIPE_MONTHLY_URL = 'https://buy.stripe.com/9B6aEQ0Qs8PA5NJ6zh1ZS02';
    const STRIPE_ANNUAL_URL = 'https://buy.stripe.com/7sY14gbv6gi2gsn8Hp1ZS01';

    useEffect(() => {
        if (window.location.pathname === '/admin') {
            setIsAdminPanelOpen(true);
        }
    }, []);

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
                setSubscriptionTier(data.user?.subscription_tier || 'free');
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

    const fetchSubscriptionStatus = async (authToken) => {
        try {
            const res = await fetch(`${API_URL}/api/subscription`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSubscriptionTier(data.subscription_tier);
                setUser(prev => {
                    if (!prev) return prev;
                    const updated = { ...prev, subscription_tier: data.subscription_tier, trial_expires_at: data.trial_expires_at };
                    localStorage.setItem('currentUser', JSON.stringify(updated));
                    return updated;
                });
            }
        } catch (e) {
            console.error("Failed to fetch subscription", e);
        }
    };

    const handleStartTrial = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch(`${API_URL}/api/start-trial`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                const newUser = {
                    ...user,
                    subscription_tier: 'trial',
                    trial_expires_at: data.trial_expires_at
                };
                setUser(newUser);
                setSubscriptionTier('trial');
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                showToast("2-Week Free Trial Started!", "success");
                setIsSubscriptionModalOpen(false);
            } else {
                showToast(data.error || "Failed to start trial", "error");
            }
        } catch (err) {
            showToast("Connection error", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (token) {
            loadWorkouts(token);
            loadSessionHistory(token);
            fetchSubscriptionStatus(token);
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
        // Check if user has paid subscription for custom workouts
        if (subscriptionTier === 'free') {
            if (!localStorage.getItem('hasUsedFreeEdit')) {
                localStorage.setItem('hasUsedFreeEdit', 'true');
                showToast("First custom workout is free! 🎁 Upgrade for unlimited.", "success");
            } else {
                setIsSubscriptionModalOpen(true);
                return;
            }
        }
        setEditingId(null);
        setModalData({ name: '', duration: 60, type: 'gentle', chime: 'gentle' });
        setIsModalOpen(true);
    };

    const startEditing = (e, workout) => {
        e.stopPropagation();
        // Check if user has paid subscription for editing custom workouts
        if (subscriptionTier === 'free') {
            if (!localStorage.getItem('hasUsedFreeEdit')) {
                localStorage.setItem('hasUsedFreeEdit', 'true');
                showToast("First edit is free! 🎁 Upgrade for unlimited.", "success");
            } else {
                setIsSubscriptionModalOpen(true);
                return;
            }
        }
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
        // Check if user has paid subscription for deleting custom workouts
        if (subscriptionTier === 'free') {
            if (!localStorage.getItem('hasUsedFreeEdit')) {
                localStorage.setItem('hasUsedFreeEdit', 'true');
                showToast("First deletion is free! 🎁 Upgrade for unlimited.", "success");
            } else {
                setIsSubscriptionModalOpen(true);
                return;
            }
        }
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
                const sDate = s.created_at
                    ? new Date(s.created_at.replace(" ", "T") + "Z")
                    : new Date(parseInt(s.session_id));
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
                                            <div className={styles.userCore}>
                                                <span className={styles.displayName}>{user.display_name || email}</span>
                                                <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                                        <polyline points="16 17 21 12 16 7"></polyline>
                                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                                    </svg>
                                                </button>
                                            </div>
                                            {userRank && (
                                                <div className={styles.rankBadge}>
                                                    Rank: #{userRank.rankWeek} (W) | #{userRank.rankMonth} (M)
                                                </div>
                                            )}
                                            <div className={styles.subscriptionBadge}
                                                style={{
                                                    background: subscriptionTier === 'paid'
                                                        ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                                                        : (subscriptionTier === 'trial' ? 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)' : 'transparent'),
                                                    color: subscriptionTier === 'free' ? '#888' : (subscriptionTier === 'paid' ? '#333' : '#fff'),
                                                    padding: '0.25rem 0.6rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    cursor: subscriptionTier === 'free' ? 'pointer' : 'default'
                                                }}
                                                onClick={() => subscriptionTier === 'free' && setIsSubscriptionModalOpen(true)}
                                                title={subscriptionTier === 'free' ? 'Click to upgrade' : (subscriptionTier === 'trial' ? 'Trial Active' : 'Pro member')}
                                            >
                                                {subscriptionTier === 'paid' ? '✨ Pro' : (subscriptionTier === 'trial' ? '⏳ Trial' : '⭐ Free')}
                                            </div>
                                        </div>
                                        <div className={styles.profileCompleteness}>
                                            <div className={styles.completenessBadge} title="Profile Completeness">
                                                {score}%
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
                                                    {score < 100 ? "Complete" : "Edit"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })() : (
                                <button onClick={() => setIsLoginOpen(true)} className={styles.authBtn}>Login</button>
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
                                    <option value="15min-morning-flow">15-Minute Morning Flow</option>
                                    <option value="30min-energizing-flow">30-Minute Energizing Flow</option>
                                    <option value="45min-complete-practice">45-Minute Complete Practice</option>
                                    <option value="60min-full-practice">60-Minute Full Practice</option>
                                </select>
                            )}
                            <div className={styles.settingsSubRow}>
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
                                <div className={styles.totalTime}>{totalDurationMinutes} min total</div>
                            </div>
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
                                                    {(() => {
                                                        const date = session.created_at
                                                            ? new Date(session.created_at.replace(" ", "T") + "Z")
                                                            : new Date(parseInt(session.session_id));
                                                        return date.toLocaleDateString();
                                                    })()}
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

            {/* Subscription Upgrade Modal */}
            {isSubscriptionModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsSubscriptionModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1rem', color: '#7b2ff7' }}>✨ Upgrade to Pro</h2>
                        <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>
                            Unlock premium features and take your practice to the next level!
                        </p>

                        <div style={{ background: 'rgba(123, 47, 247, 0.1)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#fff' }}>Pro Features:</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: '#7b2ff7', fontSize: '1.2rem' }}>✓</span>
                                    <span>Create unlimited custom workouts</span>
                                </li>
                                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: '#7b2ff7', fontSize: '1.2rem' }}>✓</span>
                                    <span>Share workouts with friends</span>
                                </li>
                                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: '#7b2ff7', fontSize: '1.2rem' }}>✓</span>
                                    <span>Unlimited progress history</span>
                                </li>
                                <li style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: '#7b2ff7', fontSize: '1.2rem' }}>✓</span>
                                    <span>Priority support</span>
                                </li>
                            </ul>
                        </div>

                        {(!user?.trial_expires_at && subscriptionTier !== 'trial' && subscriptionTier !== 'paid') && (
                            <div
                                onClick={handleStartTrial}
                                style={{
                                    background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
                                    color: '#fff',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    marginBottom: '1.5rem',
                                    textAlign: 'center',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(0, 114, 255, 0.3)',
                                    transition: 'transform 0.2s',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                🎉 Start 2-Week Free Trial (No Card Required)
                            </div>
                        )}

                        {subscriptionTier === 'trial' && user?.trial_expires_at && (
                            <div style={{
                                background: 'rgba(0, 198, 255, 0.1)',
                                border: '1px solid rgba(0, 198, 255, 0.4)',
                                color: '#00C6FF',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                marginBottom: '1rem',
                                textAlign: 'center',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}>
                                ⏳ Trial Expires: {new Date(user.trial_expires_at).toLocaleDateString()}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <a
                                href={STRIPE_MONTHLY_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    flex: 1,
                                    textDecoration: 'none',
                                    background: 'rgba(123, 47, 247, 0.15)',
                                    border: '2px solid rgba(123, 47, 247, 0.4)',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    textAlign: 'center',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(123, 47, 247, 0.25)';
                                    e.currentTarget.style.borderColor = '#7b2ff7';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(123, 47, 247, 0.15)';
                                    e.currentTarget.style.borderColor = 'rgba(123, 47, 247, 0.4)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>Monthly</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#7b2ff7', marginBottom: '0.25rem' }}>$1.99</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>per month</div>
                            </a>

                            <a
                                href={STRIPE_ANNUAL_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    flex: 1,
                                    textDecoration: 'none',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: '2px solid #764ba2',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    textAlign: 'center',
                                    position: 'relative',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(123, 47, 247, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '10px',
                                    background: '#34c759',
                                    color: '#fff',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '6px',
                                    fontSize: '0.65rem',
                                    fontWeight: '700'
                                }}>SAVE 33%</div>
                                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem' }}>Annual</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>$15.99</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>per year ($1.33/mo)</div>
                            </a>
                        </div>

                        <div className={styles.modalActions}>
                            <button type="button" onClick={() => setIsSubscriptionModalOpen(false)} style={{ width: '100%' }}>
                                Maybe Later
                            </button>
                        </div>

                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '1rem', textAlign: 'center' }}>
                            Secure payment powered by Stripe
                        </p>
                    </div>
                </div>
            )}

            {/* Admin Panel */}
            {isAdminPanelOpen && (
                <AdminPanel onClose={() => {
                    setIsAdminPanelOpen(false);
                    if (window.location.pathname === '/admin') {
                        window.history.pushState({}, '', '/');
                    }
                }} />
            )}

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
