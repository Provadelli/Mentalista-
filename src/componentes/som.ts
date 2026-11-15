// Sons sintetizados com Web Audio: nada de arquivos para baixar.
let ctx: AudioContext | null = null
let mudo = false
try {
  mudo = localStorage.getItem('mentalista:mudo') === '1'
} catch {
  /* sem armazenamento */
}

function audio() {
  if (mudo || typeof AudioContext === 'undefined') return null
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tom(freq: number, dur: number, tipo: OscillatorType = 'sine', volume = 0.2, atraso = 0) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + atraso
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = tipo
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(volume, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur)
}

function ruido(dur: number, volume = 0.5) {
  const a = audio()
  if (!a) return
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3
  const s = a.createBufferSource()
  const f = a.createBiquadFilter()
  const g = a.createGain()
  f.type = 'lowpass'
  f.frequency.value = 900
  g.gain.value = volume
  s.buffer = buf
  s.connect(f).connect(g).connect(a.destination)
  s.start()
}

export const som = {
  /** Tique do relógio de bolso. */
  tique: (urgente = false) => tom(urgente ? 1800 : 1200, 0.05, 'square', urgente ? 0.08 : 0.04),
  /** Carimbo "RESOLVIDO" batendo no papel. */
  carimbo: () => {
    ruido(0.18, 0.7)
    tom(90, 0.2, 'sine', 0.4)
  },
  /** Revelação: acorde curto. */
  revelacao: () => [392, 494, 587].forEach((f, i) => tom(f, 0.9, 'triangle', 0.12, i * 0.08)),
  /** Acusação: nota grave e longa. */
  suspense: () => {
    tom(55, 2.5, 'sawtooth', 0.08)
    tom(58, 2.5, 'sawtooth', 0.06)
  },
  get mudo() {
    return mudo
  },
  alternarMudo() {
    mudo = !mudo
    try {
      localStorage.setItem('mentalista:mudo', mudo ? '1' : '0')
    } catch {
      /* sem armazenamento */
    }
    return mudo
  },
}
