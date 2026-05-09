import type React from 'react';

// ─── StepShape ───────────────────────────────────────────────────────────────

/**
 * Shape rendered at each step marker.
 *
 * - `'circle'`  – filled circle (default)
 * - `'square'`  – rounded square
 * - `'diamond'` – rotated square / diamond
 * - `'tick'`    – small checkmark / line
 */
export type StepShape = 'circle' | 'square' | 'diamond' | 'tick';

// ─── Render-callback info ─────────────────────────────────────────────────────

/**
 * Info passed to `renderStepShape` for each step marker.
 */
export interface StepRenderInfo {
  /** Zero-based index of this step. */
  index: number;
  /** Whether this step is the currently selected one. */
  isActive: boolean;
  /** X centre of this step within the slider canvas (dp). */
  x: number;
  /** Y centre of this step within the slider canvas (dp). */
  y: number;
}

/**
 * Info passed to `renderThumb`.
 */
export interface ThumbRenderInfo {
  /** Zero-based index of the currently selected step. */
  activeIndex: number;
  /** Thumb width in dp (from `thumbWidth` prop). */
  thumbWidth: number;
  /** Thumb height in dp (from `thumbHeight` prop). */
  thumbHeight: number;
}

// ─── Colour overrides ─────────────────────────────────────────────────────────

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

// ─── Component props ──────────────────────────────────────────────────────────

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
   * Whether to render the thumb at all.
   * Set to `false` to hide the thumb completely — useful when
   * `renderStepShape` provides sufficient visual feedback on its own.
   * Has no effect when `renderThumb` is provided (use that prop's own
   * logic to conditionally render nothing instead).
   * @default true
   */
  showThumb?: boolean;

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

  /**
   * Custom renderer for each step marker.
   * When provided, the built-in Skia step shapes are skipped and a React
   * Native view overlay is used instead — allowing any RN element as a step.
   *
   * The view you return is placed in a 100×100 container anchored at the
   * step's centre point (left = stepX − 50, top = trackCY − 50).
   * No alignment is forced — position your content however you like.
   *
   * @example
   * renderStepShape={({ index, isActive }) => (
   *   <View style={[
   *     styles.dot,
   *     isActive && styles.dotActive,
   *   ]} />
   * )}
   */
  renderStepShape?: (info: StepRenderInfo) => React.ReactNode;

  /**
   * Custom renderer for the draggable thumb.
   * When provided, the built-in Skia thumb pill is hidden and a React Native
   * view is rendered instead, animated with the same spring/scale physics.
   *
   * The view is anchored at the thumb's centre point — use
   * `transform: [{ translateX: -halfW }, { translateY: -halfH }]` to centre it.
   *
   * `thumbWidth` / `thumbHeight` from props are forwarded as hints.
   *
   * @example
   * renderThumb={({ activeIndex, thumbWidth, thumbHeight }) => (
   *   <View style={[styles.thumb, { width: thumbWidth, height: thumbHeight }]} />
   * )}
   */
  renderThumb?: (info: ThumbRenderInfo) => React.ReactNode;
}
