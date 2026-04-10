/**
 * StepSlider
 *
 * A smooth, fully Skia-rendered horizontal slider with dot step markers,
 * animated progress fill, spring snap, and tap-to-select.
 *
 * Peer dependencies:
 *   @shopify/react-native-skia    >= 1.0.0
 *   react-native-reanimated       >= 3.0.0 | 4.x
 *   react-native-gesture-handler  >= 2.0.0
 */

import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import {
  Canvas,
  Circle,
  Group,
  Line,
  Path,
  RoundedRect,
  Shadow,
  rect,
  rrect,
  Skia,
  StrokeCap,
} from '@shopify/react-native-skia';

import {
  Easing,
  interpolate,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Shape rendered at each step marker.
 *
 * - `'circle'`  – filled circle (default)
 * - `'square'`  – rounded square
 * - `'diamond'` – rotated square / diamond
 * - `'tick'`    – small checkmark / line
 */
export type StepShape = 'circle' | 'square' | 'diamond' | 'tick';

export interface StepSliderColors {
  /** Background colour of the pill track. @default '#dbeafe' */
  track?: string;
  /** Colour of the progress fill (left of thumb). @default '#bfdbfe' */
  fill?: string;
  /** Active step colour (left of / at thumb). @default '#3b82f6' */
  stepActive?: string;
  /** Inactive step colour (right of thumb). @default '#93c5fd' */
  stepInactive?: string;
  /** Thumb colour. @default '#3b82f6' */
  thumb?: string;
  /** Thumb shadow colour. @default 'rgba(59,130,246,0.5)' */
  thumbShadow?: string;
}

export interface StepSliderProps {
  /**
   * Number of selectable step positions.
   * Must be >= 2. Odd values place a step at the exact centre.
   * @default 11
   */
  stepCount?: number;

  /**
   * Zero-based index of the initially selected dot.
   * Clamped to [0, dotCount - 1].
   * @default Math.floor(dotCount / 2)
   */
  defaultIndex?: number;

  /**
   * Width of the slider track in dp.
   * Defaults to screen width minus 64 dp of horizontal padding.
   */
  width?: number;

  /** Height of the pill track in dp. @default 56 */
  trackHeight?: number;

  /**
   * Corner radius of the track.
   * @default trackHeight / 2  (full pill / stadium shape)
   */
  trackRadius?: number;

  /**
   * Radius of each step marker in dp.
   * The active step pulses up to 1.45× this value.
   * @default 3.5
   */
  stepRadius?: number;

  /**
   * Shape to use for the step markers.
   * @default 'circle'
   */
  stepShape?: StepShape;

  /**
   * Width of the thumb pill in dp.
   * @default 10
   */
  thumbWidth?: number;

  /**
   * Height of the thumb pill in dp.
   * Defaults to 57 % of trackHeight.
   */
  thumbHeight?: number;

  /**
   * Show the gloss sheen overlay on the thumb.
   * @default true
   */
  showThumbGloss?: boolean;

  /**
   * Extra space (in dp) between the track's left edge and the first step.
   * Defaults to the track corner radius so the first step sits visually
   * inside the pill.
   */
  stepPaddingStart?: number;

  /**
   * Extra space (in dp) between the last step and the track's right edge.
   * Defaults to the track corner radius so the last step sits visually
   * inside the pill.
   */
  stepPaddingEnd?: number;

  /** Colour overrides — any unset key falls back to its default. */
  colors?: StepSliderColors;

  /**
   * Called whenever the selected step index changes (0-based).
   * Fired on gesture end after the spring snap target is determined.
   */
  onValueChange?: (index: number) => void;
}

// ─── SliderStep (internal sub-component) ──────────────────────────────────────

interface SliderStepProps {
  cx: number;
  cy: number;
  stepSpacing: number;
  stepRadius: number;
  stepShape: StepShape;
  thumbX: ReturnType<typeof useSharedValue<number>>;
  colorActive: string;
  colorInactive: string;
}

/** Build a static Skia path for shapes that don't need live radius updates. */
function makeStepPath(shape: StepShape, cx: number, cy: number, r: number) {
  const path = Skia.Path.Make();
  if (shape === 'square') {
    path.addRRect(Skia.RRectXY(Skia.XYWHRect(cx - r, cy - r, r * 2, r * 2), r * 0.35, r * 0.35));
  } else if (shape === 'diamond') {
    path.moveTo(cx,     cy - r);
    path.lineTo(cx + r, cy);
    path.lineTo(cx,     cy + r);
    path.lineTo(cx - r, cy);
    path.close();
  }
  return path;
}

function SliderStep({
  cx,
  cy,
  stepSpacing,
  stepRadius,
  stepShape,
  thumbX,
  colorActive,
  colorInactive,
}: SliderStepProps) {
  const color = useDerivedValue(() =>
    cx <= thumbX.value ? colorActive : colorInactive,
  );

  const r = useDerivedValue(() => {
    const dist = Math.abs(cx - thumbX.value);
    const pulse = interpolate(dist, [0, stepSpacing], [1.3, 1.0], 'clamp');
    return stepRadius * pulse;
  });

  // Stroke width for tick (pulses like r, but thinner)
  const tickStrokeWidth = useDerivedValue(() => {
    const dist = Math.abs(cx - thumbX.value);
    const pulse = interpolate(dist, [0, stepSpacing], [1.3, 1.0], 'clamp');
    return (stepRadius * 0.75) * pulse;
  });

  // Scale transform for square / diamond
  const shapeTransform = useDerivedValue(() => {
    const dist = Math.abs(cx - thumbX.value);
    const pulse = interpolate(dist, [0, stepSpacing], [1.3, 1.0], 'clamp');
    return [
      { translateX:  cx },
      { translateY:  cy },
      { scale: pulse },
      { translateX: -cx },
      { translateY: -cy },
    ];
  });

  if (stepShape === 'circle') {
    return <Circle cx={cx} cy={cy} r={r} color={color} />;
  }

  if (stepShape === 'tick') {
    const halfH = useDerivedValue(() => {
      const dist  = Math.abs(cx - thumbX.value);
      const pulse = interpolate(dist, [0, stepSpacing], [1.3, 1.0], 'clamp');
      return stepRadius * 1.3 * pulse;
    });
    const p1 = useDerivedValue(() => ({ x: cx, y: cy - halfH.value }));
    const p2 = useDerivedValue(() => ({ x: cx, y: cy + halfH.value }));
    return (
      <Line
        p1={p1}
        p2={p2}
        color={color}
        strokeWidth={tickStrokeWidth}
        strokeCap={StrokeCap.Round}
      />
    );
  }

  // square | diamond — scale a pre-built path
  const path = makeStepPath(stepShape, cx, cy, stepRadius);
  return (
    <Group transform={shapeTransform}>
      <Path path={path} color={color} />
    </Group>
  );
}

// ─── StepSlider ────────────────────────────────────────────────────────────────

export function StepSlider({
  stepCount       = 11,
  defaultIndex,
  width,
  trackHeight     = 56,
  trackRadius,
  stepRadius      = 3.5,
  stepShape       = 'circle',
  thumbWidth,
  thumbHeight,
  showThumbGloss  = true,
  stepPaddingStart,
  stepPaddingEnd,
  colors          = {},
  onValueChange,
}: StepSliderProps) {
  // ── Layout ─────────────────────────────────────────────────────────────────

  const { width: SW } = Dimensions.get('window');
  const TRACK_W  = width  ?? SW - 64;
  const TRACK_H  = trackHeight;
  const TRACK_R  = trackRadius ?? TRACK_H / 2;
  const CANVAS_H = TRACK_H + 32;
  const CY       = CANVAS_H / 2;

  const THUMB_W  = thumbWidth  ?? 7;
  const THUMB_H  = thumbHeight ?? Math.round(TRACK_H * 0.62);
  const THUMB_R  = THUMB_W / 2;

  const PAD_START = stepPaddingStart ?? TRACK_R;
  const PAD_END   = stepPaddingEnd   ?? TRACK_R;
  const N        = Math.max(2, stepCount);
  const DOT_AREA = TRACK_W - PAD_START - PAD_END;
  const DOT_STEP = DOT_AREA / (N - 1);
  const DOT_XS   = Array.from({ length: N }, (_, i) => PAD_START + i * DOT_STEP);

  const THUMB_MIN = DOT_XS[0];
  const THUMB_MAX = DOT_XS[N - 1];

  const initIdx  = defaultIndex !== undefined
    ? Math.max(0, Math.min(N - 1, defaultIndex))
    : Math.floor(N / 2);
  const INIT_X   = DOT_XS[initIdx];

  // ── Colours ────────────────────────────────────────────────────────────────

  const C = {
    track:        colors.track        ?? '#dbeafe',
    fill:         colors.fill         ?? '#bfdbfe',
    stepActive:   colors.stepActive   ?? '#3b82f6',
    stepInactive: colors.stepInactive ?? '#93c5fd',
    thumb:        colors.thumb        ?? '#3b82f6',
    thumbShadow:  colors.thumbShadow  ?? 'rgba(59,130,246,0.5)',
  };

  // Pill clip path (keeps progress fill inside the track boundary)
  const pillClip = rrect(rect(0, CY - TRACK_H / 2, TRACK_W, TRACK_H), TRACK_R, TRACK_R);

  // ── Shared values ──────────────────────────────────────────────────────────

  const thumbX   = useSharedValue(INIT_X);
  const dragging = useSharedValue(0);
  const startX   = useSharedValue(INIT_X);

  // ── Derived values ─────────────────────────────────────────────────────────

  const thumbScaleY = useDerivedValue(() =>
    interpolate(dragging.value, [0, 1], [1.0, 1.08]),
  );
  const thumbScaleX = useDerivedValue(() =>
    interpolate(dragging.value, [0, 1], [1.0, 0.88]),
  );

  const thumbTransform = useDerivedValue(() => [
    { translateX:  thumbX.value },
    { translateY:  CY },
    { scaleX:      thumbScaleX.value },
    { scaleY:      thumbScaleY.value },
    { translateX: -thumbX.value },
    { translateY: -CY },
  ]);

  const progressW = useDerivedValue(() => {
    const x = thumbX.value;
    // Once the thumb passes the midpoint between the last two steps, fill the whole track
    if (x >= THUMB_MAX - DOT_STEP / 2) return TRACK_W;
    return x + DOT_STEP / 2;
  });

  const thumbRectX  = useDerivedValue(() => thumbX.value - THUMB_W / 2);
  const thumbRectY  = useDerivedValue(() => CY - THUMB_H / 2);
  const shadowBlur  = useDerivedValue(() =>
    interpolate(dragging.value, [0, 1], [3, 10]),
  );

  // ── Snap helper (worklet) ──────────────────────────────────────────────────

  const snapNearest = (x: number): number => {
    'worklet';
    let best = DOT_XS[0];
    let bestD = Math.abs(x - best);
    for (let i = 1; i < DOT_XS.length; i++) {
      const d = Math.abs(x - DOT_XS[i]);
      if (d < bestD) { bestD = d; best = DOT_XS[i]; }
    }
    return best;
  };

  const notifyChange = (snappedX: number) => {
    const idx = DOT_XS.findIndex(x => Math.abs(x - snappedX) < 0.5);
    if (idx !== -1) onValueChange?.(idx);
  };

  // ── Gesture ────────────────────────────────────────────────────────────────

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin(() => {
      'worklet';
      startX.value   = thumbX.value;
      dragging.value = withTiming(1, { duration: 100, easing: Easing.out(Easing.quad) });
    })
    .onUpdate((e: { translationX: number }) => {
      'worklet';
      thumbX.value = Math.max(THUMB_MIN, Math.min(THUMB_MAX, startX.value + e.translationX));
    })
    .onEnd(() => {
      'worklet';
      dragging.value = withTiming(0, { duration: 200 });
      const nearest  = snapNearest(thumbX.value);
      thumbX.value   = withSpring(nearest, { damping: 28, stiffness: 320, mass: 0.5 });
      runOnJS(notifyChange)(nearest);
    });

  const tap = Gesture.Tap()
    .onEnd((e: { x: number }) => {
      'worklet';
      const nearest  = snapNearest(e.x);
      dragging.value = withTiming(1, { duration: 80 });
      thumbX.value   = withSpring(
        nearest,
        { damping: 28, stiffness: 320, mass: 0.5 },
        () => { dragging.value = withTiming(0, { duration: 200 }); },
      );
      runOnJS(notifyChange)(nearest);
    });

  const gesture = Gesture.Race(tap, pan);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.wrap}>
        <Canvas style={{ width: TRACK_W, height: CANVAS_H }}>

            {/* Track background with inset shadow */}
            <RoundedRect
              x={0} y={CY - TRACK_H / 2}
              width={TRACK_W} height={TRACK_H}
              r={TRACK_R} color={C.track}
            >
              <Shadow dx={0} dy={1} blur={3} color="rgba(0,0,0,0.08)" inner />
            </RoundedRect>

            {/* Progress fill — clipped to pill */}
            <Group clip={pillClip}>
              <RoundedRect
                x={0} y={CY - TRACK_H / 2}
                width={progressW} height={TRACK_H}
                r={TRACK_R} color={C.fill}
              />
            </Group>

            {/* Steps */}
            {DOT_XS.map(cx => (
              <SliderStep
                key={cx}
                cx={cx}
                cy={CY}
                stepSpacing={DOT_STEP}
                stepRadius={stepRadius}
                stepShape={stepShape}
                thumbX={thumbX}
                colorActive={C.stepActive}
                colorInactive={C.stepInactive}
              />
            ))}

            {/* Thumb */}
            <Group transform={thumbTransform}>
              {/* Shadow layer */}
              <RoundedRect
                x={thumbRectX} y={thumbRectY}
                width={THUMB_W} height={THUMB_H}
                r={THUMB_R} color="transparent"
              >
                <Shadow dx={0} dy={1} blur={shadowBlur} color={C.thumbShadow} />
              </RoundedRect>
              {/* Body */}
              <RoundedRect
                x={thumbRectX} y={thumbRectY}
                width={THUMB_W} height={THUMB_H}
                r={THUMB_R} color={C.thumb}
              />
              {/* Gloss — thin top-edge strip only */}
              {showThumbGloss && (
                <RoundedRect
                  x={thumbRectX} y={thumbRectY}
                  width={THUMB_W} height={THUMB_H * 0.28}
                  r={THUMB_R} color="rgba(255,255,255,0.12)"
                />
              )}
            </Group>

        </Canvas>
      </View>
    </GestureDetector>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
