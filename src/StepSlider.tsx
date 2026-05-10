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

import React, { useState } from 'react';
import { Dimensions, I18nManager, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

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

import type {
  StepShape,
  StepRenderInfo,
  ThumbRenderInfo,
  StepSliderColors,
  StepSliderProps,
} from './types';

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
  isRtl: boolean;
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
  isRtl,
}: SliderStepProps) {
  const color = useDerivedValue(() =>
    (isRtl ? cx >= thumbX.value : cx <= thumbX.value) ? colorActive : colorInactive,
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
        strokeCap={StrokeCap.Round as unknown as 'round'}
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
  showThumb       = true,
  stepPaddingStart,
  stepPaddingEnd,
  colors          = {},
  rtl,
  onValueChange,
  renderStepShape,
  renderThumb,
}: StepSliderProps) {
  // ── RTL ────────────────────────────────────────────────────────────────────
  const IS_RTL = rtl ?? I18nManager.isRTL;
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
  // In RTL the user's index 0 lives at the rightmost canvas position.
  const INIT_X   = DOT_XS[IS_RTL ? N - 1 - initIdx : initIdx];

  // Tracks the current step index in JS state (needed for custom renderStepShape).
  const [activeIndex, setActiveIndex] = useState(initIdx);

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

  // Animated style for the custom RN thumb overlay — mirrors the same physics
  // as the Skia thumb so both options feel identical.
  const thumbAnimStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: 0,
    top: 0,
    transform: [
      { translateX: thumbX.value },
      { translateY: CY },
      { scaleX: thumbScaleX.value },
      { scaleY: thumbScaleY.value },
    ],
  }));

  const progressW = useDerivedValue(() => {
    if (IS_RTL) {
      const x = thumbX.value;
      // Fill whole track when thumb reaches the leftmost step
      if (x <= THUMB_MIN + DOT_STEP / 2) return TRACK_W;
      return TRACK_W - x + DOT_STEP / 2;
    }
    const x = thumbX.value;
    // Fill whole track when thumb reaches the rightmost step
    if (x >= THUMB_MAX - DOT_STEP / 2) return TRACK_W;
    return x + DOT_STEP / 2;
  });

  // RTL: fill is right-anchored; LTR: left-anchored (x=0)
  const progressX = useDerivedValue(() =>
    IS_RTL ? TRACK_W - progressW.value : 0,
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

  const snapNearestIndex = (x: number): number => {
    'worklet';
    let bestIdx = 0;
    let bestD   = Math.abs(x - DOT_XS[0]);
    for (let i = 1; i < DOT_XS.length; i++) {
      const d = Math.abs(x - DOT_XS[i]);
      if (d < bestD) { bestD = d; bestIdx = i; }
    }
    return bestIdx;
  };

  // Last index sent to JS — avoids redundant setState calls on every frame.
  const lastReportedIdx = useSharedValue(initIdx);

  const notifyChange = (snappedX: number) => {
    const ltrIdx = DOT_XS.findIndex(x => Math.abs(x - snappedX) < 0.5);
    if (ltrIdx !== -1) {
      const idx = IS_RTL ? N - 1 - ltrIdx : ltrIdx;
      setActiveIndex(idx);
      onValueChange?.(idx);
    }
  };

  const updateActiveIndex = (idx: number) => {
    setActiveIndex(idx);
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
      // The thumb always follows the finger physically (translationX maps 1:1 to canvas pixels).
      // RTL only affects which user-facing index is reported from the canvas position — that
      // conversion happens in snapNearestIndex + the N-1-ltrIdx flip below.
      thumbX.value = Math.max(THUMB_MIN, Math.min(THUMB_MAX, startX.value + e.translationX));
      // Fire activeIndex update whenever the nearest step changes during drag
      const ltrIdx = snapNearestIndex(thumbX.value);
      const idx = IS_RTL ? N - 1 - ltrIdx : ltrIdx;
      if (idx !== lastReportedIdx.value) {
        lastReportedIdx.value = idx;
        runOnJS(updateActiveIndex)(idx);
      }
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
        <View style={{ width: TRACK_W, height: CANVAS_H }}>
        <Canvas style={StyleSheet.absoluteFill}>

            {/* Track background with inset shadow */}
            <RoundedRect
              x={0} y={CY - TRACK_H / 2}
              width={TRACK_W} height={TRACK_H}
              r={TRACK_R} color={C.track}
            >
              <Shadow dx={0} dy={1} blur={3} color="rgba(0,0,0,0.08)" inner />
            </RoundedRect>

            {/* Progress fill — clipped to pill; right-anchored in RTL */}
            <Group clip={pillClip}>
              <RoundedRect
                x={progressX} y={CY - TRACK_H / 2}
                width={progressW} height={TRACK_H}
                r={TRACK_R} color={C.fill}
              />
            </Group>

            {/* Built-in Skia step shapes — skipped when renderStepShape is provided */}
            {!renderStepShape && DOT_XS.map(cx => (
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
                isRtl={IS_RTL}
              />
            ))}

            {/* Thumb — skipped when renderThumb is provided or showThumb is false */}
            {!renderThumb && showThumb && (
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
            )}

        </Canvas>

          {/* Custom step overlay — rendered as RN views on top of the Canvas */}
          {renderStepShape && (
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
              {DOT_XS.map((cx, ltrI) => {
                // Map canvas LTR index → user-facing index (flipped in RTL)
                const userIdx = IS_RTL ? N - 1 - ltrI : ltrI;
                return (
                  <View
                    key={ltrI}
                    style={{
                      position: 'absolute',
                      left: cx - 50,
                      top: CY - 50,
                      width: 100,
                      height: 100,
                    }}
                  >
                    {renderStepShape({ index: userIdx, isActive: userIdx === activeIndex, x: cx, y: CY })}
                  </View>
                );
              })}
            </View>
          )}

          {/* Custom thumb overlay — animated RN view that mirrors Skia thumb physics */}
          {renderThumb && (
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'visible' }]}>
              <Animated.View style={thumbAnimStyle}>
                <View style={{ position: 'absolute', left: -50, top: -50, width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
                  {renderThumb({ activeIndex, thumbWidth: THUMB_W, thumbHeight: THUMB_H })}
                </View>
              </Animated.View>
            </Animated.View>
          )}
        </View>
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
