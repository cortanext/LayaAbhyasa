export const playSound = (profile = 'high', action = 'countdown') => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const currTime = audioCtx.currentTime;

    if (profile === 'gentle') {
        // === YOGA PROFILE ===
        if (action === 'countdown') {
            // Soft Chime (Sine, 440Hz, Gentle decay)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, currTime);

            gainNode.gain.setValueAtTime(0, currTime);
            gainNode.gain.linearRampToValueAtTime(0.2, currTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currTime + 1.0);

            oscillator.start(currTime);
            oscillator.stop(currTime + 1.0);
        }
        else if (action === 'start') {
            // Deep Gong (Low freq, long decay)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(220, currTime); // A3

            gainNode.gain.setValueAtTime(0, currTime);
            gainNode.gain.linearRampToValueAtTime(0.5, currTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currTime + 3.0);

            oscillator.start(currTime);
            oscillator.stop(currTime + 3.0);
        }
        else if (action === 'complete') {
            // Gentle Completion Chord (Arpeggio effect)
            playTone(audioCtx, 440, 0, 1.5, 'sine'); // A4
            playTone(audioCtx, 554.37, 0.2, 1.5, 'sine'); // C#5
            playTone(audioCtx, 659.25, 0.4, 1.5, 'sine'); // E5
        }

    } else {
        // === STANDARD PROFILE (High) ===
        if (action === 'countdown') {
            // Sharp beep (High pitch, short)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, currTime);

            gainNode.gain.setValueAtTime(0.1, currTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currTime + 0.5);

            oscillator.start(currTime);
            oscillator.stop(currTime + 0.5);
        }
        else if (action === 'start') {
            // Long "Go" Beep (Sawtooth, descending pitch)
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(660, currTime);
            oscillator.frequency.linearRampToValueAtTime(440, currTime + 0.8);

            gainNode.gain.setValueAtTime(0.1, currTime);
            gainNode.gain.linearRampToValueAtTime(0.1, currTime + 0.6);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currTime + 0.8);

            oscillator.start(currTime);
            oscillator.stop(currTime + 0.8);
        }
        else if (action === 'complete') {
            // Double Beep
            playTone(audioCtx, 880, 0, 0.3, 'square');
            playTone(audioCtx, 880, 0.4, 0.3, 'square');
            playTone(audioCtx, 880, 0.8, 0.6, 'square');
        }
    }
};

// Helper for chords/sequences
const playTone = (ctx, freq, delay, duration, type = 'sine') => {
    const osc = ctx.createOscillator();
    const gn = ctx.createGain();

    osc.connect(gn);
    gn.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    gn.gain.setValueAtTime(0, ctx.currentTime + delay);
    gn.gain.linearRampToValueAtTime(0.1, ctx.currentTime + delay + 0.1);
    gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
};
