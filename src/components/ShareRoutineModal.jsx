import { useState, useEffect } from 'react';
import styles from './ShareRoutineModal.module.css';

const API_URL = "https://cortanext-workout-timer.sri-050.workers.dev";

function ShareRoutineModal({ workouts, token, onClose }) {
    const [routineName, setRoutineName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [friends, setFriends] = useState([]);
    const [isSharing, setIsSharing] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [shareStatus, setShareStatus] = useState(''); // 'shared' or 'invited'

    // Fetch friends for autocomplete
    useEffect(() => {
        if (token) {
            fetch(`${API_URL}/api/friends`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.friends) setFriends(data.friends);
                })
                .catch(console.error);
        }
    }, [token]);

    const handleShare = async () => {
        if (!routineName.trim()) {
            setError('Please enter a routine name');
            return;
        }
        if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setIsSharing(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/api/routines/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: routineName,
                    workouts: workouts,
                    recipientEmail: recipientEmail
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccessMessage(data.message);
                setShareStatus(data.status);
            } else {
                setError(data.error || 'Failed to share routine');
            }
        } catch (e) {
            setError('Connection error. Please try again.');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Share Routine</h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                {!successMessage ? (
                    <div className={styles.content}>
                        <p className={styles.description}>
                            Share your routine with a friend perfectly privately.
                        </p>

                        <div className={styles.formGroup}>
                            <label>Routine Name</label>
                            <input
                                type="text"
                                value={routineName}
                                onChange={(e) => setRoutineName(e.target.value)}
                                placeholder="e.g., Morning Energy Flow"
                                maxLength={50}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Friend's Email</label>
                            <input
                                type="text"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                placeholder="friend@example.com"
                                list="friends-list"
                            />
                            <datalist id="friends-list">
                                {friends.map(friend => (
                                    <option key={friend.id} value={friend.email}>{friend.display_name}</option>
                                ))}
                            </datalist>
                        </div>

                        <div className={styles.workoutSummary}>
                            <strong>{workouts.length} exercises</strong> • {Math.floor(workouts.reduce((sum, w) => sum + w.duration, 0) / 60)} min total
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button
                            className={styles.shareBtn}
                            onClick={handleShare}
                            disabled={isSharing}
                        >
                            {isSharing ? 'Sharing...' : 'Share with Friend'}
                        </button>
                    </div>
                ) : (
                    <div className={styles.content}>
                        <div className={styles.success}>
                            {shareStatus === 'shared' ? '✓ Shared Successfully!' : '✓ Invite Sent!'}
                        </div>

                        <p style={{ textAlign: 'center', color: '#fff', opacity: 0.9 }}>
                            {successMessage}
                        </p>

                        <p className={styles.hint}>
                            {shareStatus === 'shared'
                                ? "Your friend will see this routine in their 'Received Routines' tab."
                                : "We've sent an email invitation. Once they register, they'll instantly get this routine!"}
                        </p>

                        <button className={styles.doneBtn} onClick={onClose}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShareRoutineModal;
