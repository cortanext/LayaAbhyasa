import { useState, useEffect } from 'react';
import styles from './FriendsPanel.module.css';

const API_URL = "https://cortanext-workout-timer.sri-050.workers.dev";

function FriendsPanel({ token }) {
    const [friends, setFriends] = useState([]);
    const [sentRoutines, setSentRoutines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                // Fetch Friends
                const friendsRes = await fetch(`${API_URL}/api/friends`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const friendsData = await friendsRes.json();
                if (friendsData.friends) setFriends(friendsData.friends);

                // Fetch Sent Routines
                const sentRes = await fetch(`${API_URL}/api/routines/sent`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const sentData = await sentRes.json();
                if (sentData.routines) setSentRoutines(sentData.routines);

            } catch (error) {
                console.error("Failed to fetch friends data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token]);

    if (isLoading) return <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Loading friends...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <h3>My Friends ({friends.length})</h3>
                {friends.length === 0 ? (
                    <div className={styles.emptyState}>
                        You haven't connected with anyone yet. Share a routine to make friends!
                    </div>
                ) : (
                    <div className={styles.friendList}>
                        {friends.map(friend => (
                            <div key={friend.id} className={styles.friendItem}>
                                <div className={styles.friendInfo}>
                                    <span className={styles.friendName}>{friend.display_name}</span>
                                    <span className={styles.friendEmail}>{friend.email}</span>
                                </div>
                                <div className={styles.friendMeta}>
                                    Shared {friend.shared_with_me_count} routines
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <h3>Sent Routines</h3>
                {sentRoutines.length === 0 ? (
                    <div className={styles.emptyState}>
                        You haven't shared any routines yet.
                    </div>
                ) : (
                    <div className={styles.routineList}>
                        {sentRoutines.map(routine => (
                            <div key={routine.id} className={styles.routineItem}>
                                <div className={styles.routineInfo}>
                                    <span className={styles.routineName}>{routine.routine_name}</span>
                                    <span className={styles.routineMeta}>
                                        Shared with {routine.recipient_name || routine.recipient_email} on {new Date(routine.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FriendsPanel;
