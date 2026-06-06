/**
 * Sound utility — generates sounds using Web Audio API
 * No external files needed
 */
export function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);

    switch (type) {
      case 'dice':
        o.type = 'square';
        o.frequency.setValueAtTime(220, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        g.gain.setValueAtTime(0.3, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        o.start(); o.stop(ctx.currentTime + 0.4);
        break;

      case 'gameover':
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(440, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 1.5);
        g.gain.setValueAtTime(0.4, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        o.start(); o.stop(ctx.currentTime + 1.5);
        break;

      case 'card':
        o.type = 'sine';
        o.frequency.setValueAtTime(660, ctx.currentTime);
        o.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.2, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        o.start(); o.stop(ctx.currentTime + 0.2);
        break;

      case 'action':
        o.type = 'sine';
        o.frequency.setValueAtTime(523, ctx.currentTime);
        g.gain.setValueAtTime(0.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        o.start(); o.stop(ctx.currentTime + 0.12);
        break;

      case 'endturn':
        o.type = 'sine';
        o.frequency.setValueAtTime(330, ctx.currentTime);
        o.frequency.setValueAtTime(495, ctx.currentTime + 0.12);
        g.gain.setValueAtTime(0.2, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        o.start(); o.stop(ctx.currentTime + 0.25);
        break;

      case 'damage':
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(150, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
        g.gain.setValueAtTime(0.3, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        o.start(); o.stop(ctx.currentTime + 0.3);
        break;

      case 'heal':
        o.type = 'sine';
        o.frequency.setValueAtTime(400, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
        g.gain.setValueAtTime(0.2, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        o.start(); o.stop(ctx.currentTime + 0.25);
        break;

      default:
        break;
    }
  } catch (e) {
    // Silently fail if audio not supported
  }
}
