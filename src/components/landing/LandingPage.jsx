import React from 'react';
import styles from './LandingPage.module.css';

const LandingPage = ({ onStart, onLogin }) => {
    return (
        <div className={styles.container} style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <button className={styles.loginBtnNav} onClick={onLogin}>Login</button>
            <section className={styles.heroSection} style={{ padding: '0 2rem', background: 'transparent' }}>
                <span className={styles.eyebrow}>Practice in Rhythm</span>
                <h1 className={styles.heroTitle} style={{ marginBottom: '1rem' }}>Flow Laya</h1>
                <p className={styles.heroSub} style={{ marginBottom: '2rem' }}>
                    Stop guessing. Start flowing.
                </p>
                <button className={styles.ctaBtn} onClick={onStart}>Enter App</button>
            </section>
        </div>
    );
};

export default LandingPage;
