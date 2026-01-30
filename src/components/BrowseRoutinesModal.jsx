import { useState, useEffect } from 'react';
import styles from './BrowseRoutinesModal.module.css';

const API_URL = "https://cortanext-workout-timer.sri-050.workers.dev";

function BrowseRoutinesModal({ token, onImport, onClose }) {
    const [routines, setRoutines] = useState([]);
    const [selectedRoutine, setSelectedRoutine] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        loadRoutines();
    }, []);

    const loadRoutines = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/routines/browse?limit=50`);
            const data = await res.json();
            setRoutines(data.routines || []);
        } catch (e) {
            setError('Failed to load routines');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreview = async (shareCode) => {
        try {
            const res = await fetch(`${API_URL}/api/routines/${shareCode}`);
            const data = await res.json();
            setSelectedRoutine(data.routine);
        } catch (e) {
            setError('Failed to load routine details');
        }
    };

    const handleImport = async () => {
        if (!token) {
            setError('Please log in to import routines');
            return;
        }

        setImporting(true);
        try {
            const res = await fetch(`${API_URL}/api/routines/${selectedRoutine.share_code}/import`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (res.ok) {
                onImport(data.workouts);
                onClose();
            } else {
                setError(data.error || 'Failed to import');
            }
        } catch (e) {
            setError('Connection error');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Community Routines</h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                {selectedRoutine ? (
                    <div className={styles.preview}>
                        <button className={styles.backBtn} onClick={() => setSelectedRoutine(null)}>
                            ← Back to Browse
                        </button>

                        <div className={styles.routineHeader}>
                            <h3>{selectedRoutine.routine_name}</h3>
                            <div className={styles.meta}>
                                By {selectedRoutine.creator_name} • {selectedRoutine.views} views • {selectedRoutine.imports} imports
                            </div>
                        </div>

                        <div className={styles.workoutsList}>
                            {JSON.parse(selectedRoutine.routine_data).map((workout, idx) => (
                                <div key={idx} className={styles.workoutItem}>
                                    <div className={styles.workoutName}>{workout.name}</div>
                                    <div className={styles.workoutDuration}>
                                        {Math.floor(workout.duration / 60)}:{(workout.duration % 60).toString().padStart(2, '0')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button
                            className={styles.importBtn}
                            onClick={handleImport}
                            disabled={importing}
                        >
                            {importing ? 'Importing...' : 'Import to My Workouts'}
                        </button>
                    </div>
                ) : (
                    <>
                        {isLoading ? (
                            <div className={styles.loading}>Loading routines...</div>
                        ) : routines.length === 0 ? (
                            <div className={styles.empty}>No shared routines yet. Be the first to share!</div>
                        ) : (
                            <div className={styles.grid}>
                                {routines.map((routine) => (
                                    <div
                                        key={routine.id}
                                        className={styles.card}
                                        onClick={() => handlePreview(routine.share_code)}
                                    >
                                        <div className={styles.cardTitle}>{routine.routine_name}</div>
                                        <div className={styles.cardCreator}>
                                            by {routine.creator_name || 'Anonymous'}
                                        </div>
                                        <div className={styles.cardStats}>
                                            👁️ {routine.views} • ⬇️ {routine.imports}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default BrowseRoutinesModal;
