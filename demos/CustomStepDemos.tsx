/**
 * CustomStepDemos.tsx
 *
 * Showcase of `renderStepShape`.
 *
 * The library places a 100×100 View at:
 *   left = stepCentreX - 50,  top = trackCentreY - 50
 * with no forced alignment — every example positions its own content.
 *
 * Two patterns used throughout:
 *   (A) <Center> wrapper  — fills the 100×100 box and centres content
 *   (B) position:'absolute' with manual top/left arithmetic
 */

import React, { useState } from 'react';
import {
  ScrollView, StatusBar, StyleSheet,
  Text, View, useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StepSlider } from 'react-native-step-slider';

// ─── Pattern A: flex-centre wrapper ─────────────────────────────────────────
const Center = ({ children }: { children: React.ReactNode }) => (
  <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
    {children}
  </View>
);

// ─── Pattern B: absolute helper — centres a WxH element in the 100×100 box ──
const abs = (w: number, h: number): object => ({
  position: 'absolute' as const,
  top:  50 - h / 2,
  left: 50 - w / 2,
  width: w,
  height: h,
});

// ─── Demo screen ─────────────────────────────────────────────────────────────

export default function CustomStepDemos() {
  const isDark = useColorScheme() === 'dark';

  const [signal,   setSignal]   = useState(3);
  const [temp,     setTemp]     = useState(2);
  const [spectrum, setSpectrum] = useState(3);
  const [bubble,   setBubble]   = useState(2);
  const [moon,     setMoon]     = useState(3);
  const [tier,     setTier]     = useState(2);
  const [clock,    setClock]    = useState(2);
  const [fuel,     setFuel]     = useState(3);
  const [arc,      setArc]      = useState(2);
  const [spark,    setSpark]    = useState(3);
  const [prism,    setPrism]    = useState(2);
  const [stack,    setStack]    = useState(3);
  // new
  const [petal,    setPetal]    = useState(2);
  const [honey,    setHoney]    = useState(3);
  const [ph,       setPh]       = useState(3);
  const [atom,     setAtom]     = useState(2);
  const [tube,     setTube]     = useState(2);
  const [health,   setHealth]   = useState(3);
  const [coin,     setCoin]     = useState(2);
  const [wave,     setWave]     = useState(3);
  // rtl demos
  const [rtlPriority, setRtlPriority] = useState(2);
  const [rtlPrice,    setRtlPrice]    = useState(3);
  const [rtlMood,     setRtlMood]     = useState(2);

  return (
    <GestureHandlerRootView style={S.root}>
      <SafeAreaProvider>
        <SafeAreaView style={S.safe}>
          <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
          <Text style={S.heading}>react-native-step-slider — showcase</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scroll}>

            {/* ── 19. HP health bar ─────────────────────────────── */}
            <Card dark title="Health points" value={['KO','Critical','Low','Good','Max'][health]}>
              <StepSlider
                stepCount={5} defaultIndex={3} trackHeight={36} trackRadius={4}
                showThumb={false}
                stepPaddingStart={16} stepPaddingEnd={16}
                colors={{ track:'#111827', fill:'#1f2937', thumb:'rgba(255,255,255,0.15)', thumbShadow:'transparent' }}
                onValueChange={setHealth}
                renderStepShape={({ index, isActive }) => {
                  // Classic RPG health bar: N filled segments
                  const HP_COLS = [
                    '#6b7280', // 0 — grey
                    '#ef4444', // 1 — red
                    '#f97316', // 2 — orange
                    '#22c55e', // 3 — green
                    '#4ade80', // 4 — bright green
                  ];
                  const SEGS  = 4;
                  const SEG_W = 5, SEG_H = 14, GAP = 2;
                  const totalW = SEGS * SEG_W + (SEGS - 1) * GAP;
                  const color  = HP_COLS[index];
                  return (
                    <View style={[abs(totalW, SEG_H), { flexDirection: 'row', gap: GAP }]}>
                      {Array.from({ length: SEGS }, (_, s) => {
                        const filled = s < index;
                        return (
                          <View key={s} style={{
                            width: SEG_W, height: SEG_H, borderRadius: 2,
                            backgroundColor: filled
                              ? (isActive ? color : color + '88')
                              : '#374151',
                            borderWidth: 1,
                            borderColor: filled
                              ? (isActive ? color : color + '55')
                              : '#4b5563',
                          }}>
                            {/* pixel shine */}
                            {filled && isActive && (
                              <View style={{
                                position: 'absolute', top: 2, left: 1,
                                width: 2, height: 3, borderRadius: 1,
                                backgroundColor: 'rgba(255,255,255,0.4)',
                              }} />
                            )}
                          </View>
                        );
                      })}
                    </View>
                  );
                }}
              />
              <Row labels={['KO','Critical','Low','Good','Max']} active={health} dark />
            </Card>

            {/* ── 14. Honeycomb cells ───────────────────────────── */}
            <Card title="Honey fill" value={['Empty','Drip','Quarter','Half','Full'][honey]}>
              <StepSlider
                stepCount={5} defaultIndex={3} trackHeight={36} trackRadius={8}
                thumbWidth={38} thumbHeight={5}
                stepPaddingStart={18} stepPaddingEnd={18}
                showThumb={false}
                colors={{ track:'#fffbeb', fill:'#fef3c7' }}
                onValueChange={setHoney}
                renderStepShape={({ index, isActive }) => {
                  // Hexagonal cells approximated as rounded squares in offset rows
                  const AMBERS = ['#fde68a','#fcd34d','#fbbf24','#f59e0b','#d97706'];
                  const color  = AMBERS[index];
                  const CELL   = 8, GAP = 2;
                  // 2-row hex grid: [3 cells], [2 cells offset]
                  const rows = [[0,1,2],[0,1]]; // column indices
                  const filledCount = [0, 1, 2, 4, 5][index]; // how many filled
                  let drawn = 0;
                  return (
                    <Center>
                      <View style={{ width: 3 * CELL + 2 * GAP, height: 2 * CELL + GAP + 4 }}>
                        {rows.map((cols, row) =>
                          cols.map(col => {
                            const filled = drawn < filledCount;
                            drawn++;
                            return (
                              <View key={`${row}-${col}`} style={{
                                position: 'absolute',
                                left: col * (CELL + GAP) + (row === 1 ? (CELL + GAP) / 2 : 0),
                                top:  row * (CELL + GAP + 2),
                                width: CELL, height: CELL,
                                borderRadius: 3,
                                backgroundColor: filled
                                  ? (isActive ? color : color + '88')
                                  : (isActive ? '#fef3c7' : '#fef9ee'),
                                borderWidth: 1,
                                borderColor: isActive ? AMBERS[Math.min(index+1,4)] : '#fde68a',
                              }} />
                            );
                          })
                        )}
                      </View>
                    </Center>
                  );
                }}
              />
              <Row labels={['Empty','Drip','¼','Half','Full']} active={honey} />
            </Card>

            {/* ── 13. Petal bloom ──────────────────────────────── */}
            <Card title="Petal bloom" value={['Bud','Unfurl','Open','Full','Peak'][petal]}>
              <StepSlider
                stepCount={5} defaultIndex={2} trackHeight={38} trackRadius={19}
                thumbWidth={42} thumbHeight={5}
                stepPaddingStart={22} stepPaddingEnd={22}
                showThumb={false}
                colors={{ track:'#fff1f2', fill:'#ffe4e6' }}
                onValueChange={setPetal}
                renderStepShape={({ index, isActive }) => {
                  // Petals rendered as rotated rounded rects around a centre
                  const PINK    = ['#fda4af','#fb7185','#f43f5e','#e11d48','#be123c'];
                  const counts  = [1, 2, 3, 5, 8];
                  const count   = counts[index];
                  const color   = PINK[index];
                  const petalW  = 7, petalH = 12;
                  return (
                    <Center>
                      <View style={{ width: 40, height: 40 }}>
                        {Array.from({ length: count }, (_, i) => {
                          const deg = (360 / count) * i;
                          const rad = (deg * Math.PI) / 180;
                          const cx  = 20 + Math.cos(rad) * 10 - petalW / 2;
                          const cy  = 20 + Math.sin(rad) * 10 - petalH / 2;
                          return (
                            <View key={i} style={{
                              position: 'absolute',
                              left: cx, top: cy,
                              width: petalW, height: petalH,
                              borderRadius: petalW / 2,
                              backgroundColor: isActive ? color : color + '66',
                              transform: [{ rotate: `${deg + 90}deg` }],
                              opacity: 0.85 + (i % 2) * 0.15,
                            }} />
                          );
                        })}
                        {/* centre */}
                        <View style={{
                          position: 'absolute', top: 16, left: 16,
                          width: 8, height: 8, borderRadius: 4,
                          backgroundColor: isActive ? '#fde68a' : '#fef9c3',
                        }} />
                      </View>
                    </Center>
                  );
                }}
              />
              <Row labels={['Bud','Unfurl','Open','Full','Peak']} active={petal} />
            </Card>

            {/* ═══════════════════ RTL ═══════════════════ */}
            <GL>🌍 RTL (right-to-left)</GL>

            {/* ── RTL 1. Priority (Hebrew-style) ────────────────── */}
            {/*
             * rtl={true} — index 0 is the rightmost step.
             * The Row label array is reversed so the highest-priority
             * label sits on the right, matching the visual position.
             */}

            {/* ── RTL 2. Price range (Arabic currency) ─────────── */}
            {/*
             * Plain rtl={true} with built-in step markers — no custom renderer.
             * Demonstrates that the basic slider flips correctly with one prop.
             */}
            <Card title="نطاق السعر" value={['٥٠','١٠٠','٢٠٠','٥٠٠','١٠٠٠'][rtlPrice] + ' ر.س'}>
              <StepSlider
                stepCount={5} defaultIndex={3} trackHeight={38} trackRadius={8}
                stepRadius={4} thumbWidth={10} thumbHeight={26}
                stepPaddingStart={22} stepPaddingEnd={22}
                rtl
                colors={{ track:'#fefce8', fill:'#fef08a', stepActive:'#ca8a04',
                          stepInactive:'#fde047', thumb:'#eab308', thumbShadow:'rgba(234,179,8,0.4)' }}
                onValueChange={setRtlPrice}
              />
              <View style={[S.row, { flexDirection: 'row-reverse' }]}>
                {['٥٠','١٠٠','٢٠٠','٥٠٠','١٠٠٠'].map((l, i) => (
                  <Text key={l} style={[
                    S.tick,
                    i === rtlPrice ? S.tickActive : null,
                  ]}>{l}</Text>
                ))}
              </View>
            </Card>
            {/* ── RTL 3. Mood (emoji, RTL + renderStepShape) ───── */}
            {/*
             * Combines rtl={true} with renderStepShape and showThumb={false}.
             * Index 0 = leftmost emotion (rightmost step in RTL).
             */}
            <Card title="المزاج" value={['😭','😟','😐','😊','🤩'][rtlMood]}>
              <StepSlider
                stepCount={5} defaultIndex={2} trackHeight={52} trackRadius={26}
                thumbWidth={10} thumbHeight={36}
                stepPaddingStart={34} stepPaddingEnd={34}
                rtl
                showThumb={false}
                colors={{ track:'#fff7ed', fill:'#ffedd5' }}
                onValueChange={setRtlMood}
                renderStepShape={({ index, isActive }) => (
                  <Center>
                    <Text style={{ fontSize: 22, opacity: isActive ? 1 : 0.3 }}>
                      {['😭','😟','😐','😊','🤩'][index]}
                    </Text>
                  </Center>
                )}
              />
            </Card>



          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ─── Helper components ───────────────────────────────────────────────────────

function GL({ children }: { children: React.ReactNode }) {
  return <Text style={S.gl}>{children}</Text>;
}

function Card({
  title, value, dark, children,
}: {
  title: string; value: string; dark?: boolean; children: React.ReactNode;
}) {
  return (
    <View style={[S.card, dark && S.cardDark]}>
      <View style={S.header}>
        <Text style={[S.cardTitle, dark && S.dim]}>{title}</Text>
        <Text style={[S.cardValue, dark && S.accent]}>{value}</Text>
      </View>
      {children}
    </View>
  );
}

function Row({ labels, active, dark }: { labels: string[]; active: number; dark?: boolean }) {
  return (
    <View style={S.row}>
      {labels.map((l, i) => (
        <Text key={l} style={[
          S.tick,
          dark ? S.tickDark : null,
          i === active ? (dark ? S.tickActiveDark : S.tickActive) : null,
        ]}>{l}</Text>
      ))}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#f1f5f9' },
  safe:  { flex: 1, paddingHorizontal: 16 },
  scroll:{ paddingTop: 6, paddingBottom: 48, gap: 8 },

  heading: {
    fontSize: 17, fontWeight: '800', color: '#0f172a',
    letterSpacing: -0.4, textAlign: 'center',
    marginTop: 12, marginBottom: 4,
  },
  gl: {
    fontSize: 11, fontWeight: '700', color: '#64748b',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginTop: 6, marginBottom: 2, marginLeft: 4,
  },

  card: {
    gap: 6, padding: 12, borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  cardDark: { backgroundColor: '#0f172a' },
  header:   { flexDirection: 'row', alignItems: 'center' },
  cardTitle:{ flex: 1, fontSize: 13, fontWeight: '700', color: '#1e293b' },
  cardValue:{ fontSize: 13, fontWeight: '700', color: '#3b82f6' },
  dim:      { color: '#64748b' },
  accent:   { color: '#818cf8' },

  row:  { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  tick: { fontSize: 10, fontWeight: '500', color: '#94a3b8' },
  tickActive:     { color: '#1e293b', fontWeight: '700' },
  tickDark:       { color: '#334155' },
  tickActiveDark: { color: '#e2e8f0', fontWeight: '700' },
});
