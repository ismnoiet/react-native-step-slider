
<div align="center">

<table>
  <tr>
    <th align="center">iOS</th>
    <th align="center">Android</th>
  </tr>
  <tr>
    <td align="center">
      <img src="./step-slider-ios-demos.gif" width="300" height="700" alt="iOS demo" />
    </td>
    <td align="center">
      <img src="./step-slider-android-demos.gif" width="300" height="700" alt="Android demo" />
    </td>
  </tr>
</table>


<h1>react-native-step-slider</h1>

<p>A beautifully animated step slider for React Native — with spring snap and tap-to-select gestures.</p>

<p>
  <img src="https://img.shields.io/npm/v/react-native-step-slider.svg?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue.svg" alt="Platform" />
  <img src="https://img.shields.io/badge/PRs-welcome-purple.svg" alt="PRs Welcome" />
</p>

</div>

---

## ✨ Features

- 📱 **Works on iOS & Android** — consistent behaviour and look across both platforms
- 🎨 **Fully customisable** — colours, step count, size, shape and layout
- ⚡ **Silky smooth performance** — animations and gestures never block your UI
- 🎯 **Tap to jump** — tap any step marker to jump straight to that position
- 🟣 **Active step pulse** — the selected step marker pops with a springy highlight
- 🌊 **Progress fill** — a live fill tracks your position across the slider

---

## Installation

```sh
npm install react-native-step-slider
# or
yarn add react-native-step-slider
```

### Peer dependencies

Install all three peer packages if they aren't already in your project:

```sh
npm install @shopify/react-native-skia react-native-reanimated react-native-gesture-handler
```

| Package | Minimum version |
|---|---|
| `@shopify/react-native-skia` | `>= 1.0.0` |
| `react-native-reanimated` | `>= 3.0.0` |
| `react-native-gesture-handler` | `>= 2.0.0` |
| `react` | `>= 18` |
| `react-native` | `>= 0.72` |

### iOS

```sh
cd ios && pod install
```

### Babel config

Make sure `react-native-reanimated/plugin` is the **last** item in your `babel.config.js` plugins array:

```js
// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

---

## Quick start

Wrap your app in `GestureHandlerRootView` (once, at the root) and drop in `StepSlider`:

```tsx
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StepSlider } from 'react-native-step-slider';

export default function App() {
  const [step, setStep] = useState(5);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ padding: 32 }}>
        <Text>Step {step + 1} of 11</Text>
        <StepSlider stepCount={11} defaultIndex={5} onValueChange={setStep} />
      </View>
    </GestureHandlerRootView>
  );
}
```

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `stepCount` | `number` | `11` | Number of selectable step positions. |
| `defaultIndex` | `number` | `Math.floor(stepCount / 2)` | Initially selected index (0-based). |
| `width` | `number` | `screenWidth − 64` | Total width of the slider track in dp. |
| `trackHeight` | `number` | `56` | Height of the pill-shaped track in dp. |
| `trackRadius` | `number` | `trackHeight / 2` | Corner radius of the track. |
| `stepRadius` | `number` | `3.5` | Radius of each step marker in dp. |
| `stepShape` | `StepShape` | `'circle'` | Shape of the step markers — `'circle'`, `'square'`, `'diamond'`, or `'tick'`. |
| `thumbWidth` | `number` | `7` | Width of the thumb pill in dp. |
| `thumbHeight` | `number` | `trackHeight × 0.62` | Height of the thumb pill in dp. |
| `showThumbGloss` | `boolean` | `true` | Show the gloss sheen overlay on the thumb. |
| `stepPaddingStart` | `number` | `trackRadius` | Space between the track's left edge and the first step marker. |
| `stepPaddingEnd` | `number` | `trackRadius` | Space between the last step marker and the track's right edge. |
| `colors` | `StepSliderColors` | *(blue theme)* | Override any or all colour tokens. |
| `onValueChange` | `(index: number) => void` | `undefined` | Called every time the selected index changes. |

---

## StepSliderColors

All fields are optional — only provide the tokens you want to override.

| Field | Default | Description |
|---|---|---|
| `track` | `'#dbeafe'` | Track background fill. |
| `fill` | `'#bfdbfe'` | Progress fill (left of thumb). |
| `stepActive` | `'#3b82f6'` | Step marker colour when active (at or left of thumb). |
| `stepInactive` | `'#93c5fd'` | Step marker colour when inactive (right of thumb). |
| `thumb` | `'#3b82f6'` | Thumb pill colour. |
| `thumbShadow` | `'rgba(59,130,246,0.5)'` | Thumb drop-shadow colour. |

```tsx
<StepSlider
  stepCount={7}
  stepShape="diamond"
  colors={{
    track: '#fdf2f8',
    fill: '#fbcfe8',
    stepActive: '#ec4899',
    stepInactive: '#f9a8d4',
    thumb: '#ec4899',
    thumbShadow: 'rgba(236,72,153,0.45)',
  }}
  onValueChange={(i) => console.log('selected:', i)}
/>
```

---

## Example app

A runnable demo is in [`Demos.tsx`](./Demos.tsx) at the root of the repo. It shows a wide variety of real-world use cases — volume, brightness, font size, filters, ratings and more.

---

## How it works

The slider is rendered on a single hardware-accelerated canvas, so every dot, the progress fill and the animated thumb are drawn in one efficient pass — no layout thrashing. Animations run on a dedicated UI thread, meaning dragging and snapping stay perfectly smooth even when your JavaScript is busy. The `onValueChange` callback is only fired when the selected step actually changes, keeping unnecessary re-renders to a minimum.

---

## ⭐ Support

If you find this library useful, please consider **[starring the repo](https://github.com/ismnoiet/react-native-step-slider)** — it helps others discover it and motivates further development.

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

---

## License

MIT © [ismnoiet](https://github.com/ismnoiet) — see [LICENSE](./LICENSE) for details.
