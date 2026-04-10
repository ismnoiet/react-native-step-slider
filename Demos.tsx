import React, { useState } from 'react';
import {
  ScrollView, StatusBar, StyleSheet,
  useColorScheme, View, Text,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StepSlider } from 'react-native-step-slider';

const SPEED_LABELS    = ['0.5×','0.75×','1×','1.25×','1.5×','1.75×','2×'];
const FONT_LABELS     = ['XS','S','M','L','XL','XXL'];
const FILTER_LABELS   = ['None','Soft','Vivid','Matte','Fade','Noir','Warm','Cool','Drama'];
const SLEEP_LABELS    = ['Off','5m','10m','15m','30m','45m','1h','90m','2h'];
const EQ_LABELS       = ['-12','-9','-6','-3','0','+3','+6','+9','+12'];
const RATING_LABELS   = ['😞','😕','😐','😊','😄'];
const DIFF_LABELS     = ['Newbie','Easy','Medium','Hard','Expert','Insane'];
const TEMP_C          = [16,17,18,19,20,21,22,23,24,25,26];
const ZOOM_LABELS     = ['0.5×','1×','2×','3×','5×'];
const REST_LABELS     = ['30s','45s','1m','90s','2m','3m','5m'];
const CROWD_LABELS    = ['Private','Friends','Mutuals','Followers','Public'];
const CONTRAST_LABELS = ['−5','−4','−3','−2','−1','0','+1','+2','+3','+4','+5'];
const BUDGET_K        = [1,2,3,5,8,10,15,20,30,50];
const REMIND_LABELS   = ['1h','2h','4h','8h','1d','3d','1w'];

export default function Demos() {
  const isDarkMode = useColorScheme() === 'dark';

  const [volume,     setVolume]     = useState(2);
  const [bass,       setBass]       = useState(4);
  const [speed,      setSpeed]      = useState(2);
  const [brightness, setBrightness] = useState(6);
  const [contrast,   setContrast]   = useState(5);
  const [fontSize,   setFontSize]   = useState(2);
  const [filter,     setFilter]     = useState(0);
  const [zoom,       setZoom]       = useState(1);
  const [temp,       setTemp]       = useState(4);
  const [fanSpeed,   setFanSpeed]   = useState(1);
  const [restTimer,  setRestTimer]  = useState(2);
  const [intensity,  setIntensity]  = useState(3);
  const [tip,        setTip]        = useState(3);
  const [budget,     setBudget]     = useState(4);
  const [sleep,      setSleep]      = useState(0);
  const [remind,     setRemind]     = useState(2);
  const [privacy,    setPrivacy]    = useState(2);
  const [rating,     setRating]     = useState(4);
  const [difficulty, setDifficulty] = useState(2);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Text style={styles.heading}>react-native-step-slider — examples</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

            <Card icon="🔒" title="Who can see this?" value={CROWD_LABELS[privacy]}>
              <StepSlider
                dotCount={5} defaultIndex={2} trackHeight={40} trackRadius={20}
                dotRadius={4} thumbWidth={10} thumbHeight={30}
                dotPaddingStart={30} dotPaddingEnd={30}
                colors={{ track:'#f1f5f9', fill:'#cbd5e1', dotActive:'#0f172a',
                          dotInactive:'#64748b', thumb:'#1e293b', thumbShadow:'rgba(15,23,42,0.35)' }}
                onValueChange={setPrivacy}
              />
              <Row labels={CROWD_LABELS} active={privacy} />
            </Card>
            <Card icon="🧾" title="Tip" value={['0%','5%','10%','15%','18%','20%','25%'][tip]}>
              <StepSlider
                dotCount={7} defaultIndex={3} trackHeight={42} trackRadius={21}
                dotRadius={4} thumbWidth={10} thumbHeight={32}
                dotPaddingStart={30} dotPaddingEnd={30}
                colors={{ track:'#f0fdf4', fill:'#bbf7d0', dotActive:'#047857',
                          dotInactive:'#6ee7b7', thumb:'#059669', thumbShadow:'rgba(5,150,105,0.4)' }}
                onValueChange={setTip}
              />
              <Row labels={['0%','5%','10%','15%','18%','20%','25%']} active={tip} />
            </Card>
            <GroupLabel>🌙 Focus & Sleep</GroupLabel>
            <Card dark icon="🌙" title="Sleep Timer" value={SLEEP_LABELS[sleep]}>
              <StepSlider
                dotCount={9} defaultIndex={0} trackHeight={36} trackRadius={6}
                dotRadius={2.5} thumbWidth={7} thumbHeight={22} showThumbGloss={false}
                dotPaddingStart={18} dotPaddingEnd={18}
                colors={{ track:'#1e293b', fill:'#334155', dotActive:'#e2e8f0',
                          dotInactive:'#475569', thumb:'#f8fafc', thumbShadow:'rgba(248,250,252,0.2)' }}
                onValueChange={setSleep}
              />
              <Row labels={SLEEP_LABELS} active={sleep} dark />
            </Card>

            <Card icon="🔔" title="Remind me in" value={REMIND_LABELS[remind]}>
              <StepSlider
                dotCount={7} defaultIndex={2} trackHeight={36} trackRadius={18}
                dotRadius={3.5} thumbWidth={9} thumbHeight={26}
                dotPaddingStart={22} dotPaddingEnd={22}
                colors={{ track:'#f5f3ff', fill:'#ede9fe', dotActive:'#5b21b6',
                          dotInactive:'#a78bfa', thumb:'#6d28d9', thumbShadow:'rgba(109,40,217,0.4)' }}
                onValueChange={setRemind}
              />
              <Row labels={REMIND_LABELS} active={remind} />
            </Card>

            <Card icon="⏩" title="Playback Speed" value={SPEED_LABELS[speed]}>
              <StepSlider
                dotCount={7} defaultIndex={2} trackHeight={36} trackRadius={4}
                dotRadius={3} thumbWidth={8} showThumbGloss={false}
                colors={{ track:'#f0fdf4', fill:'#bbf7d0', dotActive:'#15803d',
                          dotInactive:'#86efac', thumb:'#16a34a', thumbShadow:'rgba(22,163,74,0.4)' }}
                onValueChange={setSpeed}
              />
              <Row labels={SPEED_LABELS} active={speed} />
            </Card>
            <GroupLabel>⭐ Feedback</GroupLabel>
            <Card icon="⭐" title="Rate your experience" value={RATING_LABELS[rating]}>
              <StepSlider
                dotCount={5} defaultIndex={4} trackHeight={44} trackRadius={22}
                dotRadius={5} thumbWidth={12} thumbHeight={34}
                dotPaddingStart={36} dotPaddingEnd={36}
                colors={{ track:'#fefce8', fill:'#fef08a', dotActive:'#ca8a04',
                          dotInactive:'#fde047', thumb:'#eab308', thumbShadow:'rgba(234,179,8,0.45)' }}
                onValueChange={setRating}
              />
              <Text style={styles.emoji}>{RATING_LABELS[rating]}</Text>
            </Card>
            <GroupLabel>📱 Device Controls</GroupLabel>
            <Card icon="🔊" title="Volume" value={`${volume * 25}%`}>
              <StepSlider
                dotCount={5} defaultIndex={2} trackHeight={40} trackRadius={20}
                dotRadius={4} thumbWidth={10} thumbHeight={30}
                dotPaddingStart={28} dotPaddingEnd={28}
                colors={{ track:'#eff6ff', fill:'#bfdbfe', dotActive:'#2563eb',
                          dotInactive:'#93c5fd', thumb:'#2563eb', thumbShadow:'rgba(37,99,235,0.4)' }}
                onValueChange={setVolume}
              />
              <VolumeBar level={volume} />
            </Card>

            <Card icon="☀️" title="Brightness" value={`${Math.round((brightness / 10) * 100)}%`}>
              <StepSlider
                dotCount={11} defaultIndex={6} trackHeight={34} trackRadius={6}
                dotRadius={3} thumbWidth={8} showThumbGloss={false}
                colors={{ track:'#fefce8', fill:'#fef08a', dotActive:'#ca8a04',
                          dotInactive:'#fde047', thumb:'#eab308', thumbShadow:'rgba(234,179,8,0.4)' }}
                onValueChange={setBrightness}
              />
            </Card>

            <Card icon="Aa" title="Font Size" value={FONT_LABELS[fontSize]}>
              <StepSlider
                dotCount={6} defaultIndex={2} trackHeight={36} trackRadius={8}
                dotRadius={4} thumbWidth={10} thumbHeight={26}
                dotPaddingStart={20} dotPaddingEnd={20}
                colors={{ track:'#f5f3ff', fill:'#ddd6fe', dotActive:'#7c3aed',
                          dotInactive:'#c4b5fd', thumb:'#7c3aed', thumbShadow:'rgba(124,58,237,0.4)' }}
                onValueChange={setFontSize}
              />
              <Text style={[styles.preview, { fontSize: 12 + fontSize * 3 }]}>
                The quick brown fox jumps over the lazy dog
              </Text>
            </Card>

            <GroupLabel>🏠 Smart Home</GroupLabel>

            <Card icon="🌡️" title="Thermostat" value={`${TEMP_C[temp]}°C`}>
              <StepSlider
                dotCount={11} defaultIndex={4} trackHeight={44} trackRadius={22}
                dotRadius={4} thumbWidth={10} thumbHeight={32}
                dotPaddingStart={26} dotPaddingEnd={26}
                colors={{ track:'#fff1f2', fill:'#fecdd3', dotActive:'#be123c',
                          dotInactive:'#fda4af', thumb:'#e11d48', thumbShadow:'rgba(225,29,72,0.4)' }}
                onValueChange={setTemp}
              />
              <TempBar temp={TEMP_C[temp]} />
            </Card>

            <Card icon="💨" title="Fan Speed" value={['Off','Low','Mid','High','Turbo'][fanSpeed]}>
              <StepSlider
                dotCount={5} defaultIndex={1} trackHeight={36} trackRadius={8}
                dotRadius={4} thumbWidth={10} thumbHeight={26} showThumbGloss={false}
                dotPaddingStart={20} dotPaddingEnd={20}
                colors={{ track:'#f0fdfa', fill:'#99f6e4', dotActive:'#0f766e',
                          dotInactive:'#5eead4', thumb:'#0d9488', thumbShadow:'rgba(13,148,136,0.4)' }}
                onValueChange={setFanSpeed}
              />
              <Row labels={['Off','Low','Mid','High','Turbo']} active={fanSpeed} />
            </Card>

            <GroupLabel>🛒 Commerce</GroupLabel>

            <Card icon="💰" title="Budget" value={`$${BUDGET_K[budget]}k`}>
              <StepSlider
                dotCount={10} defaultIndex={4} trackHeight={36} trackRadius={8}
                dotRadius={3} thumbWidth={8} thumbHeight={26}
                dotPaddingStart={16} dotPaddingEnd={16}
                colors={{ track:'#fefce8', fill:'#fef08a', dotActive:'#854d0e',
                          dotInactive:'#fde047', thumb:'#ca8a04', thumbShadow:'rgba(202,138,4,0.4)' }}
                onValueChange={setBudget}
              />
              <Row labels={BUDGET_K.map(v => `$${v}k`)} active={budget} />
            </Card>

            <GroupLabel>🎵 Media</GroupLabel>

            <Card dark icon="🎛️" title="Bass EQ" value={`${EQ_LABELS[bass]} dB`}>
              <StepSlider
                dotCount={9} defaultIndex={4} trackHeight={32} trackRadius={4}
                dotRadius={2.5} thumbWidth={7} thumbHeight={22} showThumbGloss={false}
                dotPaddingStart={12} dotPaddingEnd={12}
                colors={{ track:'#0f172a', fill:'#1d4ed8', dotActive:'#60a5fa',
                          dotInactive:'#1e40af', thumb:'#93c5fd', thumbShadow:'rgba(147,197,253,0.3)' }}
                onValueChange={setBass}
              />
              <Row labels={EQ_LABELS} active={bass} dark />
            </Card>

            <GroupLabel>📷 Camera</GroupLabel>

            <Card icon="🔍" title="Zoom" value={ZOOM_LABELS[zoom]}>
              <StepSlider
                dotCount={5} defaultIndex={1} trackHeight={38} trackRadius={6}
                dotRadius={4} thumbWidth={10} thumbHeight={28}
                dotPaddingStart={24} dotPaddingEnd={24}
                colors={{ track:'#f0f9ff', fill:'#bae6fd', dotActive:'#0369a1',
                          dotInactive:'#7dd3fc', thumb:'#0284c7', thumbShadow:'rgba(2,132,199,0.4)' }}
                onValueChange={setZoom}
              />
              <Row labels={ZOOM_LABELS} active={zoom} />
            </Card>

            <Card icon="🎨" title="Filter" value={FILTER_LABELS[filter]}>
              <StepSlider
                dotCount={9} defaultIndex={0} trackHeight={36} trackRadius={18}
                dotRadius={3.5} thumbWidth={9} thumbHeight={26}
                dotPaddingStart={22} dotPaddingEnd={22}
                colors={{ track:'#fff7ed', fill:'#fed7aa', dotActive:'#c2410c',
                          dotInactive:'#fdba74', thumb:'#ea580c', thumbShadow:'rgba(234,88,12,0.4)' }}
                onValueChange={setFilter}
              />
              <Row labels={FILTER_LABELS} active={filter} />
            </Card>

            <Card icon="◑" title="Contrast" value={CONTRAST_LABELS[contrast]}>
              <StepSlider
                dotCount={11} defaultIndex={5} trackHeight={32} trackRadius={4}
                dotRadius={2.5} thumbWidth={7} thumbHeight={20} showThumbGloss={false}
                dotPaddingStart={14} dotPaddingEnd={14}
                colors={{ track:'#f8fafc', fill:'#334155', dotActive:'#0f172a',
                          dotInactive:'#94a3b8', thumb:'#1e293b', thumbShadow:'rgba(15,23,42,0.35)' }}
                onValueChange={setContrast}
              />
              <Row labels={CONTRAST_LABELS} active={contrast} />
            </Card>

            <GroupLabel>💪 Fitness</GroupLabel>

            <Card icon="🔥" title="Intensity" value={['Recovery','Easy','Moderate','Hard','Max'][intensity]}>
              <StepSlider
                dotCount={5} defaultIndex={3} trackHeight={42} trackRadius={6}
                dotRadius={4} thumbWidth={10} thumbHeight={30}
                dotPaddingStart={22} dotPaddingEnd={22}
                colors={{ track:'#fff7ed', fill:'#fed7aa', dotActive:'#9a3412',
                          dotInactive:'#fb923c', thumb:'#ea580c', thumbShadow:'rgba(234,88,12,0.45)' }}
                onValueChange={setIntensity}
              />
              <IntensityBadge level={intensity} />
            </Card>

            <Card icon="⏱️" title="Rest Timer" value={REST_LABELS[restTimer]}>
              <StepSlider
                dotCount={7} defaultIndex={2} trackHeight={38} trackRadius={6}
                dotRadius={3} thumbWidth={8} thumbHeight={26}
                colors={{ track:'#fdf2f8', fill:'#fbcfe8', dotActive:'#9d174d',
                          dotInactive:'#f9a8d4', thumb:'#be185d', thumbShadow:'rgba(190,24,93,0.4)' }}
                onValueChange={setRestTimer}
              />
              <Row labels={REST_LABELS} active={restTimer} />
            </Card>

            <Card icon="🕹️" title="Difficulty" value={DIFF_LABELS[difficulty]}>
              <StepSlider
                dotCount={6} defaultIndex={2} trackHeight={44} trackRadius={6}
                dotRadius={4} thumbWidth={10} thumbHeight={32}
                dotPaddingStart={20} dotPaddingEnd={20}
                colors={{ track:'#fdf4ff', fill:'#f0abfc', dotActive:'#a21caf',
                          dotInactive:'#e879f9', thumb:'#c026d3', thumbShadow:'rgba(192,38,211,0.45)' }}
                onValueChange={setDifficulty}
              />
              <Row labels={DIFF_LABELS} active={difficulty} />
            </Card>

          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.groupLabel}>{children}</Text>;
}

function Card({ icon, title, value, dark, children }: {
  icon: string; title: string; value: string; dark?: boolean; children: React.ReactNode;
}) {
  return (
    <View style={[styles.card, dark && styles.cardDark]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={[styles.cardTitle, dark && styles.textDim]}>{title}</Text>
        <Text style={[styles.cardValue, dark && styles.textLight]}>{value}</Text>
      </View>
      {children}
    </View>
  );
}

function Row({ labels, active, dark }: { labels: string[]; active: number; dark?: boolean }) {
  return (
    <View style={styles.row}>
      {labels.map((l, i) => (
        <Text
          key={l}
          style={[
            styles.tick,
            dark ? styles.tickDark : null,
            i === active ? (dark ? styles.tickActiveDark : styles.tickActive) : null,
          ]}
        >
          {l}
        </Text>
      ))}
    </View>
  );
}

function VolumeBar({ level }: { level: number }) {
  const bars = 5;
  return (
    <View style={styles.volRow}>
      {Array.from({ length: bars }, (_, i) => (
        <View
          key={i}
          style={[
            styles.volBar,
            { height: 6 + i * 5 },
            i <= level ? styles.volBarActive : styles.volBarInactive,
          ]}
        />
      ))}
    </View>
  );
}

function TempBar({ temp }: { temp: number }) {
  const pct = ((temp - 16) / (26 - 16)) * 100;
  const color = temp <= 19 ? '#3b82f6' : temp <= 22 ? '#22c55e' : '#ef4444';
  return (
    <View style={styles.tempTrack}>
      <View style={[styles.tempFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      <Text style={[styles.tempLabel, { color }]}>{temp}°C</Text>
    </View>
  );
}

function IntensityBadge({ level }: { level: number }) {
  const COLORS = ['#3b82f6','#22c55e','#eab308','#f97316','#ef4444'];
  const LABELS = ['Recovery','Easy','Moderate','Hard','Max'];
  return (
    <View style={[styles.badge, { backgroundColor: COLORS[level] + '22', borderColor: COLORS[level] + '66' }]}>
      <Text style={[styles.badgeText, { color: COLORS[level] }]}>{LABELS[level]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f1f5f9' },
  safe:   { flex: 1, paddingHorizontal: 16 },
  scroll: { paddingTop: 8, paddingBottom: 48, gap: 10 },
  heading: {
    fontSize: 17, fontWeight: '800', color: '#0f172a',
    letterSpacing: -0.4, textAlign: 'center', marginTop: 12, marginBottom: 4,
  },
  groupLabel: {
    fontSize: 12, fontWeight: '700', color: '#64748b',
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginTop: 8, marginBottom: 2, marginLeft: 4,
  },
  card: {
    gap: 10, padding: 16, borderRadius: 18,
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardDark:   { backgroundColor: '#0f172a' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardIcon:   { fontSize: 17 },
  cardTitle:  { flex: 1, fontSize: 13, fontWeight: '700', color: '#1e293b' },
  cardValue:  { fontSize: 13, fontWeight: '700', color: '#3b82f6' },
  textDim:    { color: '#94a3b8' },
  textLight:  { color: '#e2e8f0' },
  row:      { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  tick:     { fontSize: 10, fontWeight: '500', color: '#94a3b8' },
  tickActive:     { color: '#1e293b', fontWeight: '700' },
  tickDark:       { color: '#334155' },
  tickActiveDark: { color: '#e2e8f0', fontWeight: '700' },
  preview: { color: '#64748b', marginTop: 2 },
  emoji: { fontSize: 36, textAlign: 'center' },
  volRow:        { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 26 },
  volBar:        { width: 18, borderRadius: 3 },
  volBarActive:  { backgroundColor: '#2563eb' },
  volBarInactive:{ backgroundColor: '#dbeafe' },
  tempTrack: {
    height: 6, backgroundColor: '#fee2e2', borderRadius: 3,
    overflow: 'hidden', position: 'relative',
  },
  tempFill:  { height: '100%', borderRadius: 3 },
  tempLabel: { position: 'absolute', right: 0, top: -14, fontSize: 10, fontWeight: '700' },
  badge: {
    alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
