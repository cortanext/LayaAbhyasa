import React, { useEffect, useState } from 'react';
import styles from './LandingPage.module.css';

const LandingPage = ({ onStart, onLogin }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [countdown, setCountdown] = useState(4);

    useEffect(() => {
        setIsVisible(true);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onStart();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.container}>
            <button className={styles.loginBtnNav} onClick={onLogin}>Login</button>

            {/* Hero Section */}
            <section className={styles.heroSection}>
                <span className={styles.eyebrow}>Practice in Rhythm</span>
                <h1 className={styles.heroTitle}>
                    Stop guessing your practice.<br />
                    Build a rhythm you actually keep.
                </h1>
                <p className={styles.heroSub}>
                    The customizable yoga flow tracker for serial consistency.
                    Built for dedicated practitioners who need structure, not just another video to follow.
                </p>
                <div>
                    <button className={styles.ctaBtn} onClick={onStart}>Start Building Your Flow</button>
                    <button className={styles.secondaryBtn} onClick={onLogin}>Sign In</button>
                </div>

                <div className={styles.mockupContainer}>
                    <div className={styles.timerMockup}>
                        <div className={styles.timerCircle}>
                            <span className={styles.timerText}>04:59</span>
                        </div>
                        <span className={styles.timerLabel}>Warrior I • Active</span>
                    </div>
                    <div className={styles.listMockup}>
                        <div className={`${styles.listItem} ${styles.listActive}`}>
                            <div className={styles.listCheck}></div>
                            <div className={styles.listLine}></div>
                        </div>
                        <div className={styles.listItem}>
                            <div className={styles.listCheck} style={{ borderColor: '#444' }}></div>
                            <div className={styles.listLine}></div>
                        </div>
                        <div className={styles.listItem}>
                            <div className={styles.listCheck} style={{ borderColor: '#444' }}></div>
                            <div className={styles.listLine}></div>
                        </div>
                        <div className={styles.listItem}>
                            <div className={styles.listCheck} style={{ borderColor: '#444' }}></div>
                            <div className={styles.listLine}></div>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Entering Flow in {countdown}s...
                </div>
            </section>

            {/* Differentiation */}
            <section className={styles.diffSection}>
                <h2 className={styles.sectionTitle}>Why not just use a timer?</h2>
                <p className={styles.sectionDesc}>
                    Because Flow Laya is a <strong>Practice Operating System</strong>.
                    Calculators are for math. Flow Laya is for rhythm.
                    We don't just count down; we guide your state of flow.
                </p>
            </section>

            {/* Features */}
            <section className={styles.featureSection}>
                <div className={styles.grid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>⚡️</div>
                        <h3 className={styles.featureTitle}>Build Your Flow</h3>
                        <p className={styles.featureText}>Create custom sequences with drag-and-drop ease. Mix active and gentle poses.</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🔊</div>
                        <h3 className={styles.featureTitle}>Immersive Cues</h3>
                        <p className={styles.featureText}>Gentle chimes or standard beeps. Customize the audio environment for your practice.</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>☁️</div>
                        <h3 className={styles.featureTitle}>Cloud Sync</h3>
                        <p className={styles.featureText}>Seamlessly sync your flows and history across all your devices.</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🤝</div>
                        <h3 className={styles.featureTitle}>Share with Friends</h3>
                        <p className={styles.featureText}>Send your custom routines directly to friends or students.</p>
                    </div>
                </div>
            </section>

            {/* ICP */}
            <section className={styles.icpSection}>
                <div style={{ textAlign: 'center' }}>
                    <h2 className={styles.sectionTitle}>Who is this for?</h2>
                    <p className={styles.sectionDesc}>Built for discipline-driven practitioners, yoga instructors, and athletes.</p>
                </div>
            </section>

            {/* Pricing */}
            <section className={styles.pricingSection}>
                <h2 className={styles.sectionTitle}>Simple Pricing</h2>
                <div className={styles.pricingGrid}>
                    <div className={styles.pricingCard}>
                        <h3>Free</h3>
                        <div className={styles.price}>$0<span>/mo</span></div>
                        <ul className={styles.featuresList}>
                            <li><span className={styles.checkmark}>✓</span> 3 Custom Routines</li>
                            <li><span className={styles.checkmark}>✓</span> Basic Timer</li>
                            <li><span className={styles.checkmark}>✓</span> 3 Shared Routines</li>
                        </ul>
                        <button className={styles.secondaryBtn} onClick={onStart} style={{ marginLeft: 0, width: '100%' }}>Start Free</button>
                    </div>
                    <div className={`${styles.pricingCard} ${styles.pro}`}>
                        <span className={styles.popularBadge}>Most Popular</span>
                        <h3>Pro</h3>
                        <div className={styles.price}>$1.99<span>/mo</span></div>
                        <ul className={styles.featuresList}>
                            <li><span className={styles.checkmark}>✓</span> Unlimited Routines</li>
                            <li><span className={styles.checkmark}>✓</span> Unlimited Sharing</li>
                            <li><span className={styles.checkmark}>✓</span> Detailed History</li>
                            <li><span className={styles.checkmark}>✓</span> Priority Support</li>
                        </ul>
                        <button className={styles.ctaBtn} onClick={onLogin} style={{ width: '100%' }}>Go Pro</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
