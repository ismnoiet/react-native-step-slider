/**
 * DotSlider
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
  RoundedRect,
  Shadow,
  rect,
  rrect,
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

export interface DotSliderColors {
  /** Background colour of the pill track. @default '#dbeafe' */
  track?: string;
  /** Colour of the progress fill (left of thumb). @default '#bfdbfe' */
  fill?: string;
  /** Active dot colour (left of / at thumb). @default '#3b82f6' */
  dotActive?: string;
  /** Inactive dot colour (right of thumb). @default '#93c5fd' */
  dotInactive?: string;
  /** Thumb colour. @default '#3b82f6' */
  thumb?: string;
  /** Thumb shadow colour. @default 'rgba(59,130,246,0.5)' */
  thumbShadow?: string;
}

export interface DotSliderProps {
  /**
   * Number of selectable dot positions.
   * Must be >= 2. Odd values place a dot at the exact centre.
   * @default 11
   */
  dotCount?: number;

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
   * Radius of each dot in dp.
   * The active dot pulses up to 1.45× this value.
   * @default 3.5
   */
  dotRadius?: number;

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
   * Extra space (in dp) between the track's left edge and the first dot.
   * Defaults to the track corner radius so the first dot sits visually
   * inside the pill.
   */
  dotPaddingStart?: number;

  /**
   * Extra space (in dp) between the last dot and the track's right edge.
   * Defaults to the track corner radius so the last dot sits visually
   * inside the pill.
   */
  dotPaddingEnd?: number;

  /** Colour overrides — any unset key falls back to its default. */
  colors?: DotSliderColors;

  /**
   * Called whenever the selected dot index changes (0-based).
   * Fired on gesture end after the spring snap target is determined.
   */
  onValueChange?: (index: number) => void;
}

// ─── SliderDot (internal sub-component) ──────────────────────────────────────

interface SliderDotProps {
  cx: number;
  cy: number;
  dotStep: number;
  dotRadius: number;
  thumbX: ReturnType<typeof useSharedValue<number>>;
  colorActive: string;
  colorInactive: string;
}

function SliderDot({
  cx,
  cy,
  dotStep,
  dotRadius,
  thumbX,
  colorActive,
  colorInactive,
}: SliderDotProps) {
  const color = useDerivedValue(() =>
    cx <= thumbX.value ? colorActive : colorInactive,
  );

  const r = useDerivedValue(() => {
    const dist = Math.abs(cx - thumbX.value);
    const pulse = interpolate(dist, [0, dotStep], [1.3, 1.0], 'clamp');
    return dotRadius * pulse;
  });

  return <Circle cx={cx} cy={cy} r={r} color={color} />;
}

// ─── DotSlider ────────────────────────────────────────────────────────────────

export function DotSlider({
  dotCount        = 11,
  defaultIndex,
  width,
  trackHeight     = 56,
  trackRadius,
  dotRadius       = 3.5,
  thumbWidth,
  thumbHeight,
  showThumbGloss  = true,
  dotPaddingStart,
  dotPaddingEnd,
  colors          = {},
  onValueChange,
}: DotSliderProps) {
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

  const PAD_START = dotPaddingStart ?? TRACK_R;
  const PAD_END   = dotPaddingEnd   ?? TRACK_R;
  const N        = Math.max(2, dotCount);
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
    dotActive:    colors.dotActive    ?? '#3b82f6',
    dotInactive:  colors.dotInactive  ?? '#93c5fd',
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

  const progressW = useDerivedValue(() =>
    Math.min(thumbX.value + THUMB_W / 2 + DOT_STEP / 2, TRACK_W + TRACK_R),
  );

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

            {/* Dots */}
            {DOT_XS.map(cx => (
              <SliderDot
                key={cx}
                cx={cx}
                cy={CY}
                dotStep={DOT_STEP}
                dotRadius={dotRadius}
                thumbX={thumbX}
                colorActive={C.dotActive}
                colorInactive={C.dotInactive}
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
