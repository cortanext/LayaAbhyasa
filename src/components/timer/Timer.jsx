import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../../utils/audio'; // Adjusted import path
import styles from './Timer.module.css';

// Removing speak import as it is replaced by long beep

const Timer = ({ workoutName, duration, beepType, onComplete, muteBeeps }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [phase, setPhase] = useState('getReady'); // getReady, work
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        // Initial start
        startGetReady();
        return () => clearInterval(intervalRef.current);
    }, []);

    const startGetReady = () => {
        setPhase('getReady');
        setTimeLeft(5);
        setIsActive(true);
        // Removed playSound(beepType, 'countdown'); // No initial beep for get ready
    };

    const startWork = () => {
        setPhase('work');
        setTimeLeft(duration);
        playSound(beepType, 'start'); // START sound
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(intervalRef.current);
            if (phase === 'getReady') {
                startWork();
            } else {
                setIsActive(false);
                playSound(beepType, 'complete'); // COMPLETE Sound
                onComplete(false);
            }
        }

        return () => clearInterval(intervalRef.current);
    }, [isActive, timeLeft, phase]);

    // Audio cues
    useEffect(() => {
        // Only play countdown beeps (3-2-1) during the WORK phase (approaching end of workout)
        if (isActive && phase === 'work' && timeLeft <= 3 && timeLeft > 0 && !muteBeeps) {
            playSound(beepType, 'countdown');
        }
    }, [timeLeft, isActive, phase, muteBeeps]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getProgress = () => {
        const total = phase === 'getReady' ? 5 : duration;
        return ((total - timeLeft) / total) * 100;
    };

    return (
        <div className={styles.container}>
            <img src="/logo.png" alt="Flow Laya Logo" className={styles.timerLogo} />
            <div className={styles.timerCircle}>
                <div className={styles.timerBgImage} style={{ backgroundImage: 'url(/timer-bg.png)' }}></div>
                <svg viewBox="0 0 36 36" className={styles.circularChart}>
                    <defs>
                        <path id="curvePath" d="M 7,18 A 11,11 0 0 1 29,18" />
                    </defs>
                    <path
                        className={styles.circleBg}
                        d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                        className={styles.circle}
                        strokeDasharray={`${getProgress()}, 100`}
                        d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text className={styles.curvedText}>
                        <textPath xlinkHref="#curvePath" startOffset="50%" textAnchor="middle">
                            {phase === 'getReady' ? 'GET READY' : workoutName}
                        </textPath>
                    </text>
                </svg>
                <div className={styles.timeText}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            <button className={styles.stopButton} onClick={() => onComplete(true)} title="Stop Workout">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    );
};

export default Timer;
