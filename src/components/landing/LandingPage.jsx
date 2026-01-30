import React, { useEffect, useState } from 'react';
import styles from './LandingPage.module.css';

const LandingPage = ({ onStart, onLogin }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (step > 2) {
            onStart();
            return;
        }

        const timer = setTimeout(() => {
            setStep(prev => prev + 1);
        }, 2500); // 2.5s per slide

        return () => clearTimeout(timer);
    }, [step, onStart]);

    return (
        <div className={styles.container} style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <button className={styles.loginBtnNav} onClick={onLogin}>Login</button>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', flexDirection: 'column' }}>
                {/* SLIDE 1: HERO */}
                {step === 0 && (
                    <section className={styles.heroSection} style={{ padding: '1rem', minHeight: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span className={styles.eyebrow}>Practice in Rhythm</span>
                        <h1 className={styles.heroTitle} style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                            Stop guessing.<br />Start flowing.
                        </h1>
                        <p className={styles.heroSub} style={{ maxWidth: '500px' }}>
                            The operating system for your yoga practice.
                        </p>
                    </section>
                )}

                {/* SLIDE 2: FEATURES */}
                {step === 1 && (
                    <section className={styles.diffSection} style={{ padding: '1rem', minHeight: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <h2 className={styles.sectionTitle} style={{ fontSize: '2rem' }}>Not Just a Timer</h2>
                        <p className={styles.sectionDesc} style={{ maxWidth: '500px', margin: '1rem auto' }}>
                            Flow Laya guides your state of flow with custom sequences, gentle chimes, and cloud sync.
                        </p>
                        <div className={styles.featureIcon} style={{ fontSize: '3rem', marginTop: '1rem' }}>⚡️ 🔊 ☁️</div>
                    </section>
                )}

                {/* SLIDE 3: PRICING / INTRO */}
                {step === 2 && (
                    <section className={styles.pricingSection} style={{ padding: '1rem', minHeight: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <h2 className={styles.sectionTitle} style={{ fontSize: '2rem' }}>Simple & Powerful</h2>
                        <div className={styles.pricingCard} style={{ margin: '2rem auto', maxWidth: '300px', padding: '1.5rem' }}>
                            <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>Free or Pro</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Start for free. Upgrade for unlimited flows.</p>
                        </div>
                    </section>
                )}
            </div>

            {/* Progress Dots */}
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: i === step ? '#7b2ff7' : 'rgba(255,255,255,0.2)',
                        transition: 'background 0.3s'
                    }} />
                ))}
            </div>

            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', paddingBottom: '2rem' }}>
                Entering Flow...
            </div>
        </div>
    );
};

export default LandingPage;
