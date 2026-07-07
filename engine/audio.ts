let AC: AudioContext | null = null;

function ctx(): AudioContext {
  if (!AC) AC = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
  return AC;
}

function tone(wave: OscillatorType, f0: number, f1: number | null, dur: number, vol: number) {
  try {
    const ac = ctx();
    const t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = wave;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== null) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur + 0.04);
    o.start(t); o.stop(t + dur + 0.05);
  } catch { /* silence */ }
}

export type SfxKind = 'hit' | 'laser' | 'boom' | 'elec' | 'orb' | 'throw' | 'ult' | 'win';

export function sfx(kind: SfxKind): void {
  try {
    const ac = ctx();
    const t = ac.currentTime;
    switch (kind) {
      case 'hit':   tone('square',  280, 55,   0.2,  0.28); break;
      case 'laser': tone('sawtooth',900, 180,  0.32, 0.14); break;
      case 'boom':  tone('square',  140, 40,   0.25, 0.3);  break;
      case 'elec':  tone('square',  600, 300,  0.18, 0.15); break;
      case 'orb':   tone('sine',    550, 280,  0.18, 0.1);  break;
      case 'throw': tone('square',  200, 60,   0.22, 0.24); break;
      case 'ult':
        tone('square', 180, 40, 0.3, 0.35);
        setTimeout(() => tone('sine', 1200, 400, 0.5, 0.22), 80);
        break;
      case 'win':
        [523,659,784,1047].forEach((f,i)=>{
          const o=ac.createOscillator(),g=ac.createGain();
          o.connect(g);g.connect(ac.destination);
          o.type='sine';o.frequency.value=f;
          const s=t+i*.18;
          g.gain.setValueAtTime(.22,s);g.gain.exponentialRampToValueAtTime(.001,s+.4);
          o.start(s);o.stop(s+.45);
        });
        break;
    }
  } catch { /* silence */ }
}
