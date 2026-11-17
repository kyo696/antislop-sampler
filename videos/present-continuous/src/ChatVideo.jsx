import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, spring, interpolate, Easing, random, getStaticFiles} from 'remotion';

const FPS = 30;
const W = 1080, H = 1920;
const C = {
  bg: '#0c0e10', doodle: '#1a2026', header: '#14171a', her: '#23272c', me: '#4b4fc4', meDark: '#3a3ea6',
  text: '#eef0f3', sub: '#9aa3ad', accent: '#8f95ff', green: '#4fd18b', red: '#ff5d6c', yellow: '#ffd25e', input: '#1d2125',
};
const UI = 'Inter, sans-serif';
const FUN = 'Fredoka, sans-serif';

// ---------------- narration captions (from the original timing) ----------------
const CAPS = [
  [0.0, 1.0, 'Bule nelpon,', 0], [1.0, 2.0, '"What are you doing?"', 1], [2.0, 3.5, 'Kamu lagi makan.', 0], [3.5, 4.0, 'Jawab apa?', 0],
  [4.0, 5.0, 'A, B,', 0], [5.0, 6.0, 'atau C?', 0], [6.0, 8.0, 'Tiga detik!', 0], [8.0, 9.5, 'Kalau jawab A...', 0],
  [9.5, 11, 'Hey! What are you doing?', 1], [11, 13, 'I am eat!', 2], [13, 15, 'Wait... you are eat?', 1], [15, 16.5, 'Are you the food?', 1],
  [16.5, 18, 'Jawabannya C!', 0], [18, 19.5, 'Kalau lagi ngapain sekarang,', 0], [19.5, 21, 'pakai am, is, atau are,', 0],
  [21, 23.5, 'plus kata kerja ditambah "ing".', 0], [23.5, 25, '"I eat" juga kurang tepat.', 0], [25, 26.5, 'Itu buat kebiasaan,', 0],
  [26.5, 28, 'bukan yang lagi terjadi.', 0], [28, 30, 'Hey! What are you doing?', 1], [30, 31.5, "I'm eating noodles.", 2],
  [31.5, 33, "And I'm watching Netflix!", 2], [33, 35, "Nice! I'm coming over!", 1], [35, 36, 'Selamat!', 0], [36, 37, 'Hari ini kamu sudah', 0],
  [37, 39, 'belajar Present Continuous Tense!', 0], [39, 40, 'Rumusnya: subjek,', 0], [40, 42, 'plus am, is, atau are,', 0],
  [42, 44, 'plus kata kerja "ing".', 0], [44, 45, 'Kalimat negatif?', 0], [45, 46, 'Tambah not.', 0], [46, 47, 'Pertanyaan? Am,', 0],
  [47, 48.5, 'is, are pindah ke depan.', 0], [48.5, 50, 'Kamu lagi ngapain sekarang?', 0], [50, 51, 'Jawab di komen,', 0],
  [51, 52.5, 'Kalau video ini membantu,', 0], [52.5, 54.5, 'traktir kami kopi, ya!', 0], [54.5, 56, 'Link-nya ada di bio!', 0], [56, 57.6, 'See you there!', 1],
];

// ---------------- chat script ----------------
// kind: text | sticker | card-loc | card-coffee ; out = time removed (rewind)
const MSGS = [
  {id: 'm1', from: 'her', text: 'What are you doing?', t: 1.0, out: 99},
  {id: 'm2', from: 'me', kind: 'sticker', emoji: '1f35c', t: 2.0, out: 99},
  {id: 'm3', from: 'her', text: 'Hey! What are you doing?', t: 9.5, out: 28.3},
  {id: 'm4', from: 'me', text: 'I am eat!', t: 11.0, out: 28.15, squiggle: 15.0, react: {e: '1f602', t: 15.3}},
  {id: 'm5', from: 'her', text: 'Wait... you are eat?', emoji: '1f914', t: 13.0, out: 28.08},
  {id: 'm6', from: 'her', text: 'Are you the food?', emoji: '1f633', t: 15.0, out: 28.0},
  {id: 'm7', from: 'her', text: 'Hey! What are you doing?', t: 28.6, out: 99},
  {id: 'm8', from: 'me', text: "I'm eating noodles.", emoji: '1f35c', t: 30.0, out: 99, good: 30.4},
  {id: 'm9', from: 'me', text: "And I'm watching Netflix!", emoji: '1f4fa', t: 31.5, out: 99, good: 31.9},
  {id: 'm10', from: 'her', text: "Nice! I'm coming over!", emoji: '1f3c3', t: 33.0, out: 99, react: {e: '1f929', t: 34.0}},
  {id: 'm11', from: 'her', kind: 'card-loc', t: 33.7, out: 99},
  {id: 'm12', from: 'her', text: 'What are you doing?', emoji: '1f440', t: 48.9, out: 99},
  {id: 'm13', from: 'her', kind: 'sticker', emoji: '2615', t: 51.2, out: 99},
  {id: 'm14', from: 'her', kind: 'card-coffee', t: 52.5, out: 99},
  {id: 'm15', from: 'me', kind: 'sticker', emoji: '1f64c', t: 54.6, out: 99},
  {id: 'm16', from: 'her', text: 'See you there!', emoji: '1f44b', t: 56.0, out: 99},
];
const TYPING = [[11.6, 13.0], [14.1, 15.0], [32.3, 33.0], [55.2, 56.0]]; // her typing indicator
// my typing in the input bar: [start, end(send), text]
const MYTYPE = [[9.9, 11.0, 'I am eat!'], [29.1, 30.0, "I'm eating noodles."], [30.6, 31.5, "And I'm watching Netflix!"]];

const E = ({c, s = 48, style}) => <Img src={staticFile(`emoji/${c}.svg`)} style={{width: s, height: s, display: 'inline-block', verticalAlign: 'middle', ...style}} />;
const useT = () => useCurrentFrame() / FPS;
const sp = (f, t0, cfg = {damping: 14, stiffness: 170, mass: 0.8}) => (f / FPS < t0 ? 0 : spring({frame: f - t0 * FPS, fps: FPS, config: cfg}));
const lin = (t, a, b, o0 = 0, o1 = 1, ease = Easing.inOut(Easing.cubic)) => interpolate(t, [a, b], [o0, o1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

// ---------------- background doodles ----------------
const Doodles = () => {
  const t = useT();
  const items = [];
  for (let i = 0; i < 70; i++) {
    const x = random('x' + i) * 1080, y = random('y' + i) * 1920, k = Math.floor(random('k' + i) * 6), s = 40 + random('s' + i) * 40, r = random('r' + i) * 360;
    const st = {stroke: C.doodle, strokeWidth: 4, fill: 'none', strokeLinecap: 'round'};
    let el;
    if (k === 0) el = <circle r={s / 2} {...st} />;
    else if (k === 1) el = <path d={`M${-s / 2},0 L0,${-s / 2} L${s / 2},0 L0,${s / 2}Z`} {...st} />;
    else if (k === 2) el = <path d={`M${-s / 2},${s / 4} Q0,${-s / 2} ${s / 2},${s / 4}`} {...st} />;
    else if (k === 3) el = <g {...st}><rect x={-s / 2} y={-s / 3} width={s} height={s * 0.66} rx={8} /><path d={`M${-s / 2},${-s / 3} L0,${s / 8} L${s / 2},${-s / 3}`} /></g>;
    else if (k === 4) el = <path d={`M0,${-s / 2} L${s * 0.14},${-s * 0.14} L${s / 2},0 L${s * 0.14},${s * 0.14} L0,${s / 2} L${-s * 0.14},${s * 0.14} L${-s / 2},0 L${-s * 0.14},${-s * 0.14}Z`} {...st} />;
    else el = <g {...st}><path d={`M${-s / 3},${s / 3} V${-s / 3} L${s / 3},${-s / 2} V${s / 4}`} /><circle cx={-s / 3 - 8} cy={s / 3} r={9} /><circle cx={s / 3 - 8} cy={s / 4} r={9} /></g>;
    items.push(<g key={i} transform={`translate(${x},${(y - t * 6) % 1980 + (y - t * 6 < 0 ? 1980 : 0)}) rotate(${r})`}>{el}</g>);
  }
  return <svg width={W} height={H} style={{position: 'absolute'}}>{items}</svg>;
};

// ---------------- header / input ----------------
const Header = () => {
  const t = useT();
  const typing = TYPING.some(([a, b]) => t >= a && t < b);
  const status = t < 1.0 ? 'memanggil video...' : typing ? 'sedang mengetik...' : t > 57 ? 'terakhir dilihat baru saja' : 'online';
  return (
    <div style={{position: 'absolute', top: 0, left: 0, width: W, height: 230, background: C.header, borderBottom: '2px solid #22272c'}}>
      <div style={{position: 'absolute', top: 22, left: 60, color: C.text, font: `600 38px ${UI}`}}>23.35</div>
      <div style={{position: 'absolute', top: 26, right: 60, color: C.text, font: `600 30px ${UI}`}}>LTE ▮▮▮</div>
      <div style={{position: 'absolute', top: 104, left: 40, color: C.text, font: `400 64px ${UI}`}}>‹</div>
      <div style={{position: 'absolute', top: 92, left: 110, width: 100, height: 100, borderRadius: 50, background: 'linear-gradient(135deg,#ffb36b,#ff6f91)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: `700 50px ${FUN}`}}>K</div>
      <div style={{position: 'absolute', top: 96, left: 236, color: C.text, font: `700 44px ${UI}`}}>Katniss <E c="1f1ec-1f1e7" s={40} /></div>
      <div style={{position: 'absolute', top: 152, left: 236, color: typing ? C.green : C.sub, font: `400 30px ${UI}`}}>{status}</div>
      <div style={{position: 'absolute', top: 108, right: 50, width: 210, height: 80, borderRadius: 40, background: '#23272c', display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
        <E c="1f4f9" s={46} style={{filter: 'grayscale(1) brightness(2)'}} /><E c="1f4de" s={44} style={{filter: 'grayscale(1) brightness(2)'}} />
      </div>
    </div>
  );
};
const InputBar = () => {
  const t = useT();
  let txt = '', sending = false;
  for (const [a, b, s] of MYTYPE) {
    if (t >= a && t < b) { const n = Math.floor(lin(t, a, b - 0.15, 0, s.length, Easing.linear)); txt = s.slice(0, n); }
    if (t >= b - 0.15 && t < b) sending = true;
  }
  const placeholder = t >= 49.4 && t < 51 ? 'Tulis jawabanmu di komen...' : '';
  const cursor = Math.floor(t * 2.5) % 2 === 0;
  const pulse = t >= 49.4 && t < 51 ? 1 + 0.05 * Math.sin(t * 10) : 1;
  return (
    <div style={{position: 'absolute', bottom: 0, left: 0, width: W, height: 170, background: C.header}}>
      <div style={{position: 'absolute', left: 30, top: 32, color: C.text, font: `300 70px ${UI}`}}>+</div>
      <div style={{position: 'absolute', left: 110, top: 30, width: 640, height: 90, borderRadius: 45, background: C.input, transform: `scale(${pulse})`,
        border: placeholder ? `3px solid ${C.accent}` : '2px solid #2a2f35', display: 'flex', alignItems: 'center', paddingLeft: 34, color: C.text, font: `400 38px ${UI}`, boxSizing: 'border-box'}}>
        {txt ? <span>{txt}{cursor ? '|' : ' '}</span> : <span style={{color: placeholder ? C.accent : C.sub}}>{placeholder}{placeholder && cursor ? '|' : ''}</span>}
      </div>
      <div style={{position: 'absolute', right: 40, top: 30, width: 90, height: 90, borderRadius: 45, background: txt ? C.me : '#7c9c85', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', font: `700 44px ${UI}`, transform: `scale(${sending ? 0.85 : 1})`}}>{txt ? '➤' : <E c="1f399" s={50} style={{filter: 'grayscale(1) brightness(2.2)'}} />}</div>
      <div style={{position: 'absolute', right: 160, top: 44, color: C.text, font: `400 48px ${UI}`}}>◎</div>
    </div>
  );
};

// ---------------- messages ----------------
const msgHeight = (m) => {
  if (m.kind === 'sticker') return 230;
  if (m.kind === 'card-loc') return 380;
  if (m.kind === 'card-coffee') return 420;
  const lines = Math.ceil((m.text.length + (m.emoji ? 3 : 0)) / 24);
  return 70 + lines * 54 + 40;
};
const Bubble = ({m, f}) => {
  const t = f / FPS;
  const me = m.from === 'me';
  const pop = sp(f, m.t, {damping: 12, stiffness: 200, mass: 0.7});
  const base = {position: 'relative', maxWidth: 760, padding: '22px 30px 18px', borderRadius: 34, background: me ? C.me : C.her, color: C.text,
    font: `400 44px ${UI}`, lineHeight: '56px', boxShadow: '0 6px 18px rgba(0,0,0,.35)'};
  if (me) base.borderBottomRightRadius = 8; else base.borderBottomLeftRadius = 8;
  const time = <div style={{font: `400 24px ${UI}`, color: me ? '#c9cbff' : C.sub, textAlign: 'right', marginTop: 6}}>{`23.${String(35 + Math.floor(m.t / 20)).padStart(2, '0')}`}{me ? <span style={{color: m.good && t > m.good ? '#7fd8ff' : '#c9cbff', marginLeft: 8}}>✓✓</span> : null}</div>;
  let body;
  if (m.kind === 'sticker') {
    const wob = Math.sin((t - m.t) * 8) * 6 * Math.exp(-(t - m.t) * 2);
    body = <div style={{transform: `rotate(${wob}deg)`}}><E c={m.emoji} s={200} /></div>;
  } else if (m.kind === 'card-loc') {
    const dx = lin(t, m.t, m.t + 3, 0, 160, Easing.inOut(Easing.quad));
    body = (
      <div style={{...base, padding: 14, width: 560}}>
        <div style={{position: 'relative', height: 220, borderRadius: 22, overflow: 'hidden', background: '#2f3b33'}}>
          {[...Array(7)].map((_, i) => <div key={i} style={{position: 'absolute', left: 0, top: 30 + i * 34, width: 600, height: 10, background: '#3c4a40', transform: `rotate(${i % 2 ? 8 : -6}deg)`}} />)}
          <div style={{position: 'absolute', left: 60, top: 80, width: 440, height: 14, background: '#5c6f62', borderRadius: 7}} />
          <div style={{position: 'absolute', left: 60 + dx, top: 66, width: 40, height: 40, borderRadius: 20, background: '#ff6f91', border: '5px solid #fff', boxShadow: `0 0 0 ${10 + 8 * Math.sin(t * 6)}px rgba(255,111,145,.3)`}} />
          <div style={{position: 'absolute', right: 40, top: 40}}><E c="1f4cd" s={70} /></div>
        </div>
        <div style={{font: `700 34px ${UI}`, marginTop: 14}}>Katniss berbagi lokasi live</div>
        <div style={{font: `400 28px ${UI}`, color: C.sub}}>Menuju ke rumahmu · 3 menit</div>
      </div>);
  } else if (m.kind === 'card-coffee') {
    const pul = 1 + 0.06 * Math.sin(t * 7);
    body = (
      <div style={{...base, width: 600, padding: 24, textAlign: 'center'}}>
        <div style={{font: `700 52px ${FUN}`}}>Traktir kami kopi? <E c="2615" s={56} /></div>
        <div style={{font: `400 32px ${UI}`, color: C.sub, margin: '10px 0 20px'}}>Kalau video ini membantu kamu</div>
        <div style={{display: 'inline-block', padding: '20px 44px', borderRadius: 40, background: 'linear-gradient(90deg,#ff8a5c,#ff5d6c)', font: `800 38px ${UI}`, transform: `scale(${pul})`}}>
          LINK DI BIO <E c="1f446" s={42} />
        </div>
      </div>);
  } else {
    // squiggle / strike
    const sq = m.squiggle && t > m.squiggle ? lin(t, m.squiggle, m.squiggle + 0.4) : 0;
    body = (
      <div style={base}>
        <span style={{position: 'relative'}}>{m.text}{m.emoji ? <> <E c={m.emoji} s={46} /></> : null}
          {sq > 0 && <svg width={260} height={30} style={{position: 'absolute', left: 0, bottom: -18}}><path d="M0,15 q10,-12 20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0" stroke={C.red} strokeWidth={5} fill="none" strokeDasharray={300} strokeDashoffset={300 * (1 - sq)} /></svg>}
        </span>
        {time}
      </div>);
  }
  const react = m.react && t > m.react.t ? sp(f, m.react.t, {damping: 8, stiffness: 220}) : 0;
  return (
    <div style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', transform: `scale(${0.4 + 0.6 * pop})`, transformOrigin: me ? 'bottom right' : 'bottom left', opacity: Math.min(1, pop * 2)}}>
      <div style={{position: 'relative'}}>
        {body}
        {react > 0 && <div style={{position: 'absolute', bottom: -34, [me ? 'left' : 'right']: 20, background: '#2c3136', borderRadius: 30, padding: '4px 12px', transform: `scale(${react})`, border: `3px solid ${C.bg}`}}><E c={m.react.e} s={44} /></div>}
      </div>
    </div>);
};
const TypingBubble = ({a}) => {
  const t = useT();
  const pop = sp(useCurrentFrame(), a);
  return (
    <div style={{display: 'flex', transform: `scale(${pop})`, transformOrigin: 'bottom left'}}>
      <div style={{background: C.her, borderRadius: 34, borderBottomLeftRadius: 8, padding: '30px 34px', display: 'flex', gap: 14}}>
        {[0, 1, 2].map((i) => <div key={i} style={{width: 20, height: 20, borderRadius: 10, background: C.sub, transform: `translateY(${-10 * Math.max(0, Math.sin(t * 9 - i * 0.9))}px)`}} />)}
      </div>
    </div>);
};
const ChatList = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const vis = MSGS.filter((m) => t >= m.t);
  const typ = TYPING.find(([a, b]) => t >= a && t < b);
  const items = vis.map((m) => {
    const grow = sp(f, m.t, {damping: 18, stiffness: 160});
    const gone = m.out < 99 ? lin(t, m.out, m.out + 0.12, 0, 1, Easing.in(Easing.quad)) : 0;
    return {m, h: (msgHeight(m) + 26) * grow * (1 - gone), gone};
  });
  let y = H - 170 - 30;
  const out = [];
  if (typ) { y -= 130; out.push(<div key="typing" style={{position: 'absolute', left: 40, top: y, width: 1000}}><TypingBubble a={typ[0]} /></div>); }
  for (let i = items.length - 1; i >= 0; i--) {
    const {m, h, gone} = items[i];
    y -= h;
    if (gone >= 1) continue;
    out.push(<div key={m.id} style={{position: 'absolute', left: 40, top: y, width: 1000, opacity: 1 - gone, transform: `translateX(${gone * (m.from === 'me' ? 300 : -300)}px)`}}><Bubble m={m} f={f} /></div>);
  }
  return <>{out}</>;
};

// ---------------- overlays ----------------
const NarrCaption = () => {
  const t = useT();
  const c = CAPS.find(([a, b]) => t >= a && t < b);
  if (!c || c[3] !== 0) return null;
  const [a, b, txt] = c;
  const words = txt.split(' ');
  const pop = spring({frame: Math.max(0, (t - a) * FPS), fps: FPS, config: {damping: 12, stiffness: 220}});
  return (
    <div style={{position: 'absolute', top: 262, left: 0, width: W, display: 'flex', justifyContent: 'center', zIndex: 50}}>
      <div style={{background: 'rgba(15,17,20,.88)', border: '2px solid #2e343a', borderRadius: 40, padding: '18px 36px', font: `700 46px ${FUN}`, color: C.text, transform: `scale(${0.7 + 0.3 * pop})`, maxWidth: 960, textAlign: 'center'}}>
        {words.map((w, i) => {
          const on = t >= a + ((b - a) * 0.85 * i) / words.length;
          return <span key={i} style={{color: on ? C.yellow : C.text, marginRight: 12}}>{w}</span>;
        })}
      </div>
    </div>);
};
const IncomingCall = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t > 1.25) return null;
  const out = lin(t, 0.85, 1.2);
  const ring = (k) => ((t * 1.6 + k / 3) % 1);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#1b1f3b,#0c0e10)', transform: `translateY(${-out * 1920}px)`, zIndex: 80}}>
      {[0, 1, 2].map((k) => <div key={k} style={{position: 'absolute', left: 540 - 140 - ring(k) * 160, top: 620 - 140 - ring(k) * 160, width: 280 + ring(k) * 320, height: 280 + ring(k) * 320, borderRadius: '50%', border: `4px solid rgba(143,149,255,${1 - ring(k)})`}} />)}
      <div style={{position: 'absolute', left: 400, top: 480, width: 280, height: 280, borderRadius: 140, background: 'linear-gradient(135deg,#ffb36b,#ff6f91)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', font: `700 140px ${FUN}`}}>K</div>
      <div style={{position: 'absolute', top: 860, width: W, textAlign: 'center', color: C.text, font: `700 70px ${UI}`}}>Katniss <E c="1f1ec-1f1e7" s={64} /></div>
      <div style={{position: 'absolute', top: 960, width: W, textAlign: 'center', color: C.sub, font: `400 40px ${UI}`}}>Panggilan video masuk...</div>
      <div style={{position: 'absolute', top: 1450, left: 200, width: 160, height: 160, borderRadius: 80, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.06 * Math.sin(t * 12)})`}}><E c="1f4de" s={80} style={{transform: 'rotate(135deg)'}} /></div>
      <div style={{position: 'absolute', top: 1450, right: 200, width: 160, height: 160, borderRadius: 80, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${-14 * Math.abs(Math.sin(t * 8))}px)`}}><E c="1f4de" s={80} /></div>
    </AbsoluteFill>);
};
const QuickReplies = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < 3.5 || t > 9.9) return null;
  const inn = sp(f, 3.5); const leave = lin(t, 9.6, 9.9);
  const opts = [['A', 'I am eat.'], ['B', 'I eat.'], ['C', "I'm eating."]];
  const sel = t >= 8.0 ? 'A' : t >= 5 && t < 6 ? 'C' : t >= 4.5 && t < 5 ? 'B' : t >= 4 && t < 4.5 ? 'A' : null;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, bottom: 200, zIndex: 40, transform: `translateY(${(1 - inn) * 500 + leave * 600}px)`}}>
      <div style={{background: 'rgba(20,23,26,.96)', border: `3px solid ${C.accent}`, borderRadius: 40, padding: 30}}>
        <div style={{font: `700 44px ${FUN}`, color: C.text, textAlign: 'center'}}>Kamu lagi makan <E c="1f35c" s={48} /> Jawab apa?</div>
        {opts.map(([k, v], i) => {
          const pi = sp(f, 3.6 + i * 0.12);
          const on = sel === k;
          return (
            <div key={k} style={{marginTop: 22, display: 'flex', alignItems: 'center', padding: '22px 30px', borderRadius: 30, background: on ? (t >= 8 ? '#5a2a30' : C.me) : '#23272c',
              border: on ? `3px solid ${t >= 8 ? C.red : C.accent}` : '3px solid transparent', transform: `translateX(${(1 - pi) * -400}px) scale(${on ? 1.04 : 1})`, color: C.text, font: `600 44px ${UI}`}}>
              <span style={{width: 70, height: 70, borderRadius: 35, background: '#0c0e10', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 26, font: `800 38px ${UI}`, color: C.yellow}}>{k}</span>{v}
            </div>);
        })}
      </div>
    </div>);
};
const Countdown = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < 6 || t >= 8) return null;
  const n = 3 - Math.floor((t - 6) / 0.667); const p = ((t - 6) % 0.667) / 0.667;
  const s = sp(f, 6 + (3 - n) * 0.667, {damping: 9, stiffness: 260});
  return (
    <div style={{position: 'absolute', right: 70, top: 470, width: 220, height: 220, zIndex: 60, transform: `scale(${s})`}}>
      <svg width={220} height={220}><circle cx={110} cy={110} r={96} fill="#14171a" stroke="#2e343a" strokeWidth={14} />
        <circle cx={110} cy={110} r={96} fill="none" stroke={C.red} strokeWidth={14} strokeDasharray={603} strokeDashoffset={603 * p} transform="rotate(-90 110 110)" strokeLinecap="round" /></svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 120px ${FUN}`, color: C.text}}>{Math.max(1, n)}</div>
    </div>);
};
const Stamp = ({t0, t1, ok, x, y}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < t0 || t > t1) return null;
  const s = sp(f, t0, {damping: 10, stiffness: 300});
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 230, height: 230, borderRadius: 115, background: ok ? C.green : C.red, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: `scale(${2.2 - 1.2 * s}) rotate(-12deg)`, opacity: Math.min(1, s * 1.5), boxShadow: '0 0 0 12px rgba(255,255,255,.12)', font: `700 150px ${FUN}`, color: '#fff'}}>{ok ? '✓' : '✗'}</div>);
};
const Sheet = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < 16.3 || t > 28.4) return null;
  const up = sp(f, 16.4, {damping: 16, stiffness: 120}); const down = lin(t, 27.95, 28.35, 0, 1, Easing.in(Easing.cubic));
  const warn = t >= 23.5;
  const chip = (txt, t0, bg, extra = {}) => {
    const s = sp(f, t0, {damping: 9, stiffness: 240});
    return <span style={{display: 'inline-block', padding: '16px 34px', margin: 10, borderRadius: 30, background: bg, color: '#101215', font: `700 52px ${FUN}`, transform: `scale(${s})`, ...extra}}>{txt}</span>;
  };
  // eat -> eating morph
  const ingP = lin(t, 21.4, 22.6, 0, 1, Easing.out(Easing.back(1.6)));
  return (
    <AbsoluteFill style={{zIndex: 45}}>
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.55 * up * (1 - down)})`}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: W, height: 1500, background: '#15181c', borderTopLeftRadius: 60, borderTopRightRadius: 60, borderTop: `4px solid ${warn ? C.red : C.accent}`,
        transform: `translateY(${(1 - up) * 1500 + down * 1500}px)`, padding: '40px 60px', boxSizing: 'border-box', color: C.text}}>
        <div style={{width: 120, height: 10, borderRadius: 5, background: '#3a4047', margin: '0 auto 30px'}} />
        {!warn ? (
          <>
            <div style={{font: `800 34px ${UI}`, color: C.accent, letterSpacing: 4}}>GRAMMAR CHECK</div>
            <div style={{font: `700 84px ${FUN}`, marginTop: 10}}>Jawabannya: <span style={{color: C.green}}>C</span> <E c="2705" s={80} /></div>
            <div style={{marginTop: 20, padding: '24px 34px', borderRadius: 30, background: C.me, display: 'inline-block', font: `600 50px ${UI}`, transform: `scale(${sp(f, 16.8)})`}}>I'm eating.</div>
            {t >= 18 && <div style={{marginTop: 50, font: `600 48px ${UI}`, opacity: sp(f, 18)}}><span style={{display: 'inline-block', width: 26, height: 26, borderRadius: 13, background: C.red, marginRight: 18, opacity: 0.5 + 0.5 * Math.sin(t * 8)}} />Lagi ngapain <b style={{color: C.yellow}}>SEKARANG</b>?</div>}
            {t >= 19.5 && <div style={{marginTop: 30}}>{chip('am', 19.6, C.yellow)}{chip('is', 20.05, C.yellow)}{chip('are', 20.5, C.yellow)}</div>}
            {t >= 21 && <div style={{marginTop: 30, font: `600 48px ${UI}`, opacity: sp(f, 21)}}>+ kata kerja + <b style={{color: C.green}}>ing</b></div>}
            {t >= 21.2 && <div style={{marginTop: 40, font: `700 110px ${FUN}`, display: 'flex', alignItems: 'baseline'}}>
              <span>eat</span>
              <span style={{color: C.green, display: 'inline-block', transform: `translate(${(1 - ingP) * 300}px, ${(1 - ingP) * -200}px) rotate(${(1 - ingP) * 40}deg)`, opacity: Math.min(1, ingP * 2)}}>ing</span>
              {ingP > 0.95 && <span style={{marginLeft: 30}}><E c="2728" s={90} /></span>}
            </div>}
          </>
        ) : (
          <>
            <div style={{display: 'inline-block', padding: '14px 30px', borderRadius: 30, background: C.red, font: `800 48px ${UI}`, transform: `scale(${sp(f, 23.5, {damping: 7, stiffness: 300})})`}}><E c="26a0" s={50} /> HATI-HATI!</div>
            <div style={{marginTop: 40, display: 'flex', alignItems: 'center', gap: 30}}>
              <div style={{padding: '24px 34px', borderRadius: 30, background: C.her, font: `600 56px ${UI}`, position: 'relative'}}>I eat
                <div style={{position: 'absolute', left: 20, top: '52%', height: 8, background: C.red, width: `${lin(t, 23.8, 24.3, 0, 85)}%`, borderRadius: 4}} /></div>
              <div style={{font: `600 44px ${UI}`, color: C.red, opacity: lin(t, 24.2, 24.5)}}>kurang tepat</div>
            </div>
            {t >= 25 && <div style={{marginTop: 50, padding: 34, borderRadius: 34, background: '#1f2328', transform: `translateX(${(1 - sp(f, 25)) * -900}px)`}}>
              <div style={{font: `700 56px ${FUN}`}}>I eat = <span style={{color: C.yellow}}>KEBIASAAN</span> <E c="1f501" s={56} /></div>
              <div style={{display: 'flex', gap: 14, marginTop: 20}}>{['Sen', 'Sel', 'Rab', 'Kam', 'Jum'].map((d, i) => <div key={d} style={{padding: '10px 18px', borderRadius: 16, background: t > 25.2 + i * 0.15 ? '#3d3a1e' : '#2a2f35', font: `600 30px ${UI}`}}>{d} <E c="1f35c" s={30} /></div>)}</div>
            </div>}
            {t >= 26.5 && <div style={{marginTop: 30, padding: 34, borderRadius: 34, background: '#1f2328', border: `3px solid ${C.green}`, transform: `translateX(${(1 - sp(f, 26.5)) * 900}px)`}}>
              <div style={{font: `700 56px ${FUN}`}}>I'm eating = <span style={{color: C.green}}>LAGI TERJADI</span></div>
              <div style={{marginTop: 18, display: 'inline-block', padding: '8px 22px', borderRadius: 12, background: C.red, font: `800 32px ${UI}`, opacity: 0.6 + 0.4 * Math.sin(t * 9)}}>● LIVE</div>
            </div>}
          </>
        )}
      </div>
    </AbsoluteFill>);
};
const Rewind = () => {
  const t = useT();
  if (t < 27.95 || t > 28.65) return null;
  const k = Math.sin(lin(t, 27.95, 28.65, 0, Math.PI, Easing.linear));
  return (
    <AbsoluteFill style={{zIndex: 90, pointerEvents: 'none'}}>
      {[...Array(14)].map((_, i) => <div key={i} style={{position: 'absolute', left: 0, width: W, top: ((i * 140 + t * 4000) % 1920), height: 6 + (i % 3) * 4, background: `rgba(255,255,255,${0.25 * k})`}} />)}
      <div style={{position: 'absolute', top: 820, width: W, textAlign: 'center', font: `700 120px ${FUN}`, color: '#fff', opacity: k, textShadow: '6px 0 #ff5d6c, -6px 0 #4fd1ff'}}>◀◀ COBA LAGI</div>
    </AbsoluteFill>);
};
const Toast = ({a, b, children, color = C.accent}) => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < a || t > b) return null;
  const s = sp(f, a, {damping: 11, stiffness: 220}); const o = lin(t, b - 0.25, b, 1, 0);
  return <div style={{position: 'absolute', top: 380, width: W, display: 'flex', justifyContent: 'center', zIndex: 55}}>
    <div style={{padding: '16px 40px', borderRadius: 40, background: color, color: '#101215', font: `800 44px ${UI}`, transform: `translateY(${(1 - s) * -200}px)`, opacity: o}}>{children}</div></div>;
};
const Confetti = ({a, b}) => {
  const t = useT();
  if (t < a || t > b) return null;
  const cols = [C.yellow, C.accent, C.green, '#ff6f91', '#7fd8ff'];
  return <AbsoluteFill style={{zIndex: 75, pointerEvents: 'none'}}>{[...Array(90)].map((_, i) => {
    const x0 = random('cx' + i) * W, v = 500 + random('cv' + i) * 700, d = t - a - random('cd' + i) * 0.4;
    if (d < 0) return null;
    const y = -60 + d * v + 200 * d * d, x = x0 + Math.sin(d * 4 + i) * 60;
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: 22, height: 12, background: cols[i % 5], transform: `rotate(${d * 400 + i * 30}deg)`}} />;
  })}</AbsoluteFill>;
};
const Achievement = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < 34.9 || t > 39.3) return null;
  const s = sp(f, 35, {damping: 11, stiffness: 160}); const out = lin(t, 38.9, 39.3);
  const prog = lin(t, 36, 37.1, 0, 100, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{zIndex: 70, background: `rgba(0,0,0,${0.6 * s * (1 - out)})`, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 900, padding: 60, borderRadius: 60, background: 'linear-gradient(160deg,#23264f,#15181c)', border: `4px solid ${C.yellow}`, textAlign: 'center', color: C.text,
        transform: `scale(${s * (1 - out)}) rotate(${(1 - s) * -10}deg)`}}>
        <div style={{transform: `rotate(${Math.sin(t * 6) * 8}deg)`}}><E c="1f3c6" s={240} /></div>
        <div style={{font: `700 110px ${FUN}`, color: C.yellow}}>SELAMAT!</div>
        <div style={{font: `400 42px ${UI}`, color: C.sub, marginTop: 10}}>hari ini kamu sudah belajar</div>
        <div style={{marginTop: 40, height: 40, borderRadius: 20, background: '#2a2f35', overflow: 'hidden'}}><div style={{width: `${prog}%`, height: '100%', background: `linear-gradient(90deg,${C.green},${C.yellow})`}} /></div>
        {t >= 37 && <div style={{marginTop: 40, display: 'inline-block', padding: '22px 40px', borderRadius: 30, background: C.green, color: '#101215', font: `700 52px ${FUN}`, transform: `scale(${sp(f, 37, {damping: 8, stiffness: 260})})`}}>PRESENT CONTINUOUS TENSE <E c="2b50" s={52} /></div>}
      </div>
    </AbsoluteFill>);
};
const Formula = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < 39 || t > 48.9) return null;
  const inn = sp(f, 39.05, {damping: 16, stiffness: 130}); const out = lin(t, 48.4, 48.9, 0, 1, Easing.in(Easing.cubic));
  // chips: positions computed by state
  const neg = t >= 45.0, ques = t >= 46.9;
  const chipW = {S: 220, A: 270, N: 140, V: 200};
  const order = ques ? ['A', 'S', ...(neg ? [] : []), 'V'] : neg ? ['S', 'A', 'N', 'V'] : ['S', 'A', 'V'];
  const labels = {S: 'Subjek', A: ques ? 'Am/Is/Are' : 'am/is/are', N: 'not', V: 'V-ing'};
  const cols = {S: '#7fd8ff', A: C.yellow, N: C.red, V: C.green};
  const appear = {S: 39.5, A: 40.0, N: 45.0, V: 42.0};
  let x = 0; const posX = {};
  const gap = 24;
  for (const k of order) { posX[k] = x; x += chipW[k] + gap; }
  const total = x - gap; const x0 = (960 - total) / 2;
  const showN = neg && !ques;
  const sc = (k) => sp(f, appear[k], {damping: 9, stiffness: 240});
  // animate chip x with spring between states
  const chipX = (k) => {
    const base = (st) => { const ord = st === 0 ? ['S', 'A', 'V'] : st === 1 ? ['S', 'A', 'N', 'V'] : ['A', 'S', 'V']; let xx = 0; const p = {}; for (const kk of ord) { p[kk] = xx; xx += chipW[kk] + gap; } return {p, tot: xx - gap}; };
    const s0 = base(0), s1 = base(1), s2 = base(2);
    const a1 = sp(f, 45.0, {damping: 14, stiffness: 140}), a2 = sp(f, 46.9, {damping: 14, stiffness: 120});
    const X = (s) => (s.p[k] !== undefined ? (960 - s.tot) / 2 + s.p[k] : null);
    let v = X(s0) ?? X(s1);
    if (X(s1) !== null && X(s0) !== null) v = X(s0) + (X(s1) - X(s0)) * a1; else if (X(s1) !== null) v = X(s1);
    if (X(s2) !== null) v = v + (X(s2) - v) * a2;
    return v;
  };
  const lift = (k) => (k === 'A' ? -120 * Math.sin(Math.PI * lin(t, 46.9, 47.7, 0, 1, Easing.linear)) : 0);
  const nOut = ques ? lin(t, 46.6, 46.9) : 0;
  const ex = t >= 46.9 ? 'What are you doing?' : t >= 45.0 ? "I'm not sleeping." : t >= 42.5 ? "I'm eating noodles." : '';
  return (
    <AbsoluteFill style={{zIndex: 65}}>
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.65 * inn * (1 - out)})`}} />
      <div style={{position: 'absolute', left: 60, top: 320, width: 960, height: 1300, borderRadius: 50, background: '#15181c', border: `4px solid ${C.accent}`, transform: `translateY(${(1 - inn) * 1600 + out * 1600}px)`, color: C.text, padding: 50, boxSizing: 'border-box'}}>
        <div style={{font: `800 34px ${UI}`, color: C.accent, letterSpacing: 4}}><E c="1f4cc" s={36} /> PINNED</div>
        <div style={{font: `700 96px ${FUN}`}}>RUMUSNYA <E c="1f4a1" s={86} /></div>
        <div style={{position: 'absolute', left: 0, top: 240, width: 960, height: 160}}>
          {['S', 'A', 'N', 'V'].map((k) => {
            if (k === 'N' && (!neg)) return null;
            const show = k === 'N' ? sc('N') * (1 - nOut) : sc(k);
            if (t < appear[k]) return null;
            const y = k === 'N' ? (1 - sp(f, 45.0, {damping: 10, stiffness: 200})) * -200 : 0;
            return <div key={k} style={{position: 'absolute', left: chipX(k) - 0, top: 30 + y + lift(k), width: chipW[k], height: 100, borderRadius: 30, background: cols[k], color: '#101215', display: 'flex', alignItems: 'center', justifyContent: 'center',
              font: `700 46px ${FUN}`, transform: `scale(${show})`}}>{labels[k]}</div>;
          })}
          {[0, 1, 2].map((i) => null)}
        </div>
        {ex && <div style={{position: 'absolute', top: 430, left: 50, padding: '22px 34px', borderRadius: 30, background: C.me, font: `600 50px ${UI}`, transform: `scale(${sp(f, ex === 'What are you doing?' ? 47.5 : ex === "I'm not sleeping." ? 45.3 : 42.5)})`, transformOrigin: 'left'}}>{ex}</div>}
        {t >= 40.5 && <div style={{position: 'absolute', top: 600, left: 50, right: 50}}>
          {[['I', 'am'], ['he / she / it', 'is'], ['you / we / they', 'are']].map(([p, v], i) => (
            <div key={p} style={{display: 'flex', justifyContent: 'space-between', padding: '22px 30px', marginBottom: 16, borderRadius: 24, background: '#1f2328', font: `600 46px ${UI}`, transform: `translateX(${(1 - sp(f, 40.5 + i * 0.35)) * 900}px)`}}>
              <span>{p}</span><span style={{color: C.yellow}}>→ {v}</span></div>))}
        </div>}
        <div style={{position: 'absolute', bottom: 50, left: 50, right: 50, display: 'flex', gap: 20}}>
          {[['+', '#7fd8ff', 39.0, 'Positif'], ['−', C.red, 44.0, 'Negatif'], ['?', C.yellow, 46.0, 'Tanya']].map(([s, c, a, l]) => (
            <div key={s} style={{flex: 1, padding: '20px 0', borderRadius: 26, textAlign: 'center', background: t >= a ? c : '#23272c', color: t >= a ? '#101215' : C.sub, font: `700 40px ${FUN}`, transform: `scale(${t >= a && t < a + 2 ? 1.06 : 1})`}}>{s} {l}</div>))}
        </div>
      </div>
    </AbsoluteFill>);
};
const GiliranKamu = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  if (t < 48.5 || t > 51.1) return null;
  const s = sp(f, 48.6, {damping: 9, stiffness: 220}); const o = lin(t, 50.8, 51.1, 1, 0);
  return (
    <div style={{position: 'absolute', top: 430, width: W, textAlign: 'center', zIndex: 60, opacity: o}}>
      <div style={{display: 'inline-block', padding: '24px 50px', borderRadius: 50, background: C.yellow, color: '#101215', font: `700 80px ${FUN}`, transform: `scale(${s}) rotate(-3deg)`}}>GILIRAN KAMU!</div>
      {t >= 50 && <div style={{marginTop: 30, font: `700 54px ${FUN}`, color: C.text, transform: `scale(${sp(f, 50)})`}}>Jawab di komen <span style={{display: 'inline-block', transform: `translateY(${10 * Math.sin(t * 10)}px)`}}><E c="1f447" s={64} /></span></div>}
      {[...Array(8)].map((_, i) => { const d = t - 50 - i * 0.12; if (d < 0) return null; return <div key={i} style={{position: 'absolute', left: 120 + random('g' + i) * 800, top: 900 - d * 500, opacity: Math.max(0, 1 - d)}}><E c="1f4ac" s={70} /></div>; })}
    </div>);
};

// ---------------- camera ----------------
const CAM = [ // t, scale, x, y, rot
  [0, 1, 0, 0, 0],
  [10.9, 1, 0, 0, 0],
  [11.25, 1.18, -47, -97, -1.2],
  [12.9, 1.18, -47, -97, -1.2],
  [13.2, 1.15, 36, -81, 0.8],
  [14.9, 1.15, 36, -81, 0.8],
  [15.1, 1.3, 72, -162, 1.5],
  [16.2, 1.3, 72, -162, 1.5],
  [16.5, 1, 0, 0, 0],
  [29.8, 1, 0, 0, 0],
  [30.1, 1.15, -39, -81, -1],
  [32.8, 1.15, -39, -73, -1],
  [33.1, 1.15, 36, -66, 1],
  [34.8, 1.15, 36, -66, 1],
  [35.1, 1, 0, 0, 0],
  [48.6, 1, 0, 0, 0],
  [49.3, 1.25, 0, -185, 0],
  [50.9, 1.25, 0, -185, 0],
  [51.3, 1, 0, 0, 0],
  [55.9, 1, 0, 0, 0],
  [56.3, 1.15, 36, -81, 0.8],
  [58, 1.18, 43, -97, 0.8]
];
const camAt = (t) => {
  for (let i = 0; i < CAM.length - 1; i++) {
    const a = CAM[i], b = CAM[i + 1];
    if (t >= a[0] && t <= b[0]) { const k = Easing.inOut(Easing.cubic)((t - a[0]) / (b[0] - a[0] || 1)); return a.slice(1).map((v, j) => v + (b[j + 1] - v) * k); }
  }
  return CAM[CAM.length - 1].slice(1);
};
const shakeAt = (t) => {
  let x = 0, y = 0;
  for (const [t0, amp] of [[15.0, 22], [23.5, 16], [0.0, 6]]) { if (t >= t0 && t < t0 + 0.45) { const k = 1 - (t - t0) / 0.45; x += amp * k * Math.sin(t * 95); y += amp * k * Math.cos(t * 81); } }
  return [x, y];
};

export const ChatVideo = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const [s, cx, cy, r] = camAt(t); const [sx, sy] = shakeAt(t);
  const endFade = lin(t, 57.5, 58, 0, 1);
  const glitch = t >= 15.0 && t < 15.35 && Math.floor(t * 30) % 2 === 0;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {getStaticFiles().some((x) => x.name === 'audio.m4a') && <Audio src={staticFile('audio.m4a')} />}
      <AbsoluteFill style={{transform: `translate(${cx + sx}px,${cy + sy}px) scale(${s}) rotate(${r}deg)`, filter: glitch ? 'hue-rotate(140deg) saturate(2)' : 'none'}}>
        <Doodles />
        <div style={{position: 'absolute', top: 250, width: W, display: 'flex', justifyContent: 'center', opacity: 0}} />
        <div style={{position: 'absolute', top: 470, left: 140, width: 800, padding: '22px 30px', borderRadius: 26, background: '#1c2024', color: '#e6c675', font: `400 32px ${UI}`, textAlign: 'center', opacity: lin(t, 0.9, 1.4) * (1 - lin(t, 9.4, 9.8))}}>
          <E c="1f512" s={34} /> Obrolan latihan bahasa Inggris. Jangan malu salah, yang penting dicoba!
        </div>
        <ChatList />
        <Header />
        <InputBar />
      </AbsoluteFill>
      <IncomingCall />
      <NarrCaption />
      <QuickReplies />
      <Countdown />
      <Stamp t0={15.15} t1={16.45} ok={false} x={720} y={560} />
      <Sheet />
      <Rewind />
      <Toast a={28.55} b={30.0} color={C.accent}>COBA LAGI <E c="1f501" s={44} /></Toast>
      <Stamp t0={33.3} t1={34.95} ok x={760} y={540} />
      <Confetti a={35.0} b={39.2} />
      <Achievement />
      <Formula />
      <GiliranKamu />
      <AbsoluteFill style={{background: '#000', opacity: endFade}} />
    </AbsoluteFill>
  );
};
