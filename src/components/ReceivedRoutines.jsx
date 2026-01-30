import { useState, useEffect } from 'react';
import styles from './ReceivedRoutines.module.css';

const API_URL = "https://cortanext-workout-timer.sri-050.workers.dev";

function ReceivedRoutines({ token, onImport }) {
    const [routines, setRoutines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [importingId, setImportingId] = useState(null);

    useEffect(() => {
        if (token) fetchRoutines();
    }, [token]);

    const fetchRoutines = async () => {
        try {
            const res = await fetch(`${API_URL}/api/routines/received`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.routines) setRoutines(data.routines);
        } catch (error) {
            console.error("Failed to fetch received routines", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async (routine) => {
        setImportingId(routine.id);
        try {
            const res = await fetch(`${API_URL}/api/routines/${routine.share_code}/import`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Update local state to show 'Imported'
                setRoutines(prev => prev.map(r =>
                    r.id === routine.id ? { ...r, imported: 1 } : r
                ));

                // Pass workouts to parent to add to user's list
                if (onImport && data.workouts) {
                    onImport(data.workouts);
                    alert(`Routine "${routine.routine_name}" imported successfully!`);
                }
            } else {
                alert(data.error || "Failed to import routine");
            }
        } catch (error) {
            alert("Error importing routine");
        } finally {
            setImportingId(null);
        }
    };

    if (isLoading) return <div className={styles.emptyState}>Loading...</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Received Routines</h2>

            {routines.length === 0 ? (
                <div className={styles.emptyState}>
                    No routines shared with you yet.
                </div>
            ) : (
                <div className={styles.list}>
                    {routines.map(routine => (
                        <div key={routine.id} className={styles.item}>
                            <div className={styles.info}>
                                <span className={styles.name}>{routine.routine_name}</span>
                                <span className={styles.details}>
                                    From: {routine.sender_name} • {new Date(routine.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            {routine.imported ? (
                                <span className={styles.importedBadge}>Imported</span>
                            ) : (
                                <button
                                    className={styles.importBtn}
                                    onClick={() => handleImport(routine)}
                                    disabled={importingId === routine.id}
                                >
                                    {importingId === routine.id ? 'Importing...' : 'Import Routine'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReceivedRoutines;
