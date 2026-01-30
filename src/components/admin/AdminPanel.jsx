import { useState, useEffect } from 'react';
import styles from './AdminPanel.module.css';

const API_URL = "https://cortanext-workout-timer.sri-050.workers.dev";

function AdminPanel({ onClose }) {
    const handleClose = () => {
        if (onClose) onClose();
        else window.location.href = '/';
    };
    const [adminToken, setAdminToken] = useState(null);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/auth/admin-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: adminEmail,
                    password: adminPassword
                })
            });

            const data = await res.json();

            if (data.token) {
                setAdminToken(data.token);
                loadUsers(data.token);
                setSuccess('Admin login successful!');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Connection error');
            console.error('Admin login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const loadUsers = async (token, page = 1) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/users?page=${page}&limit=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
                setTotalPages(data.totalPages || 1);
                setCurrentPage(data.page || page);
            } else {
                setError('Failed to load users');
            }
        } catch (err) {
            setError('Failed to load users');
            console.error('Load users error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSubscription = async (userId, newTier) => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}/subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ subscription_tier: newTier })
            });

            if (res.ok) {
                setSuccess(`Subscription updated to ${newTier}`);
                loadUsers(adminToken, currentPage);
            } else {
                setError('Failed to update subscription');
            }
        } catch (err) {
            setError('Connection error');
            console.error('Update subscription error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setAdminToken(null);
        setAdminEmail('');
        setAdminPassword('');
        setUsers([]);
        setSelectedUserId(null);
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: users.length,
        paid: users.filter(u => u.subscription_tier === 'paid').length,
        free: users.filter(u => u.subscription_tier === 'free').length
    };

    if (!adminToken) {
        return (
            <div className={styles.overlay}>
                <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.header}>
                        <h2>🔐 Admin Login</h2>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}
                    {success && <div className={styles.success}>{success}</div>}

                    <form onSubmit={handleAdminLogin} className={styles.loginForm}>
                        <input
                            type="email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="Admin Email"
                            required
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Admin Password"
                            required
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading} className={styles.loginBtn}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Detail View Wrapper
    if (selectedUserId) {
        return (
            <div className={styles.overlay}>
                <div className={styles.panel} style={{ maxWidth: '1000px' }}>
                    <UserDetailView
                        userId={selectedUserId}
                        token={adminToken}
                        onBack={() => {
                            setSelectedUserId(null);
                            loadUsers(adminToken, currentPage); // Refresh list on back
                        }}
                        onClose={handleClose}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.panel} style={{ maxWidth: '1200px' }}>
                <div className={styles.header}>
                    <h2>👑 Admin Panel</h2>
                    <div className={styles.headerActions}>
                        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
                        {onClose && <button onClick={handleClose} className={styles.closeBtn}>×</button>}
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.total}</div>
                        <div className={styles.statLabel}>Total Users</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.paid}</div>
                        <div className={styles.statLabel}>Pro Members</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{stats.free}</div>
                        <div className={styles.statLabel}>Free Users</div>
                    </div>
                </div>

                <div className={styles.searchBar}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by email or name..."
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.userTable}>
                    <table>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Name</th>
                                <th>Tier</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.email}</td>
                                    <td>{user.display_name || '-'}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[user.subscription_tier || 'free']}`}>
                                            {user.subscription_tier === 'paid' ? '✨ Pro' : '⭐ Free'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => setSelectedUserId(user.id)}
                                            className={styles.upgradeBtn}
                                            style={{ background: 'rgba(123, 47, 247, 0.2)', color: '#b98eff', border: '1px solid #7b2ff7' }}
                                        >
                                            Details / Edit
                                        </button>
                                        {user.subscription_tier === 'free' ? (
                                            <button
                                                onClick={() => updateSubscription(user.id, 'paid')}
                                                className={styles.upgradeBtn}
                                                disabled={isLoading}
                                            >
                                                Upgrade
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => updateSubscription(user.id, 'free')}
                                                className={styles.downgradeBtn}
                                                disabled={isLoading}
                                            >
                                                Downgrade
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className={styles.noResults}>No users found</div>
                    )}
                </div>

                <div className={styles.pagination}>
                    <button
                        onClick={() => loadUsers(adminToken, currentPage - 1)}
                        disabled={currentPage <= 1 || isLoading}
                        className={styles.pageBtn}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => loadUsers(adminToken, currentPage + 1)}
                        disabled={currentPage >= totalPages || isLoading}
                        className={styles.pageBtn}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

// User Detail Sub-Component
function UserDetailView({ userId, token, onBack, onClose }) {
    const [user, setUser] = useState(null);
    const [workouts, setWorkouts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        display_name: '',
        email: '',
        zip: '',
        gender: '',
        age_range: ''
    });

    useEffect(() => {
        fetchDetails();
    }, [userId]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                setUser(data.user);
                setWorkouts(data.workouts);
                setStats(data.stats);
                setFormData({
                    display_name: data.user.display_name || '',
                    email: data.user.email || '',
                    zip: data.user.zip || '',
                    gender: data.user.gender || '',
                    age_range: data.user.age_range || ''
                });
            } else {
                setError(data.error);
            }
        } catch (e) {
            setError('Failed to fetch user details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setMsg('Success: User updated successfully!');
            } else {
                setMsg(data.error || 'Failed to update user.');
            }
        } catch (e) {
            console.error(e);
            setMsg('Error: Connection failed during update.');
        }
    };

    const handleResetPassword = async () => {
        if (!confirm('Are you sure you want to FORCE reset this user\'s password? This cannot be undone.')) return;

        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.tempPassword) {
                alert(`SUCCESS! \n\nTemporary Password: ${data.tempPassword} \n\nPlease copy this and send it to the user immediately.`);
            } else {
                alert('Failed to reset password.');
            }
        } catch (e) {
            alert('Error resetting password.');
        }
    };

    if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Loading user data...</div>;
    if (error) return <div className={styles.error}>{error} <button onClick={onBack}>Back</button></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={onBack} className={styles.downgradeBtn} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>← Back</button>
                    <h2 style={{ fontSize: '1.2rem', color: '#fff' }}>Editing: {user.email}</h2>
                </div>
                <button onClick={onClose} className={styles.closeBtn}>×</button>
            </div>

            {msg && <div className={(msg.toLowerCase().includes('success')) ? styles.success : styles.error}>{msg}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', flex: 1, overflow: 'hidden' }}>

                {/* Left Column: Edit Form */}
                <div style={{ overflowY: 'auto', paddingRight: '0.5rem' }}>
                    <h3 style={{ color: '#7b2ff7', marginBottom: '1rem' }}>Profile Information</h3>
                    <form onSubmit={handleUpdate} className={styles.loginForm}>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Display Name</label>
                            <input
                                value={formData.display_name}
                                onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                                placeholder="Display Name"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Email</label>
                            <input
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Email"
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Zip Code</label>
                                <input
                                    value={formData.zip}
                                    onChange={e => setFormData({ ...formData, zip: e.target.value })}
                                    placeholder="Zip"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Gender</label>
                                <input
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    placeholder="Gender"
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Age Range</label>
                            <input
                                value={formData.age_range}
                                onChange={e => setFormData({ ...formData, age_range: e.target.value })}
                                placeholder="Age Range"
                            />
                        </div>

                        <button type="submit" className={styles.loginBtn}>Save Changes</button>
                    </form>

                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,59,48,0.3)' }}>
                        <h4 style={{ color: '#ff3b30', marginTop: 0 }}>Danger Zone</h4>
                        <button
                            onClick={handleResetPassword}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: 'rgba(255,59,48,0.1)',
                                border: '1px solid #ff3b30',
                                color: '#ff3b30',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Force Password Reset
                        </button>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
                            This will generate a temporary password.
                        </p>
                    </div>
                </div>

                {/* Right Column: Workouts & Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{stats?.count || 0}</div>
                            <div className={styles.statLabel}>Total Workouts</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>{user.subscription_tier === 'paid' ? 'PRO' : 'FREE'}</div>
                            <div className={styles.statLabel}>Current Plan</div>
                        </div>
                    </div>

                    <h3 style={{ color: '#7b2ff7', marginBottom: '0.5rem' }}>Recent Workouts</h3>
                    <div className={styles.userTable} style={{ flex: 1, overflowY: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Date</th>
                                    <th>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workouts.length > 0 ? workouts.map(w => (
                                    <tr key={w.id}>
                                        <td>{w.name}</td>
                                        <td>{new Date(w.created_at).toLocaleDateString()}</td>
                                        <td>{Math.floor(w.duration / 60)}m {w.duration % 60}s</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No workouts found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;
