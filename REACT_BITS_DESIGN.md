# React Bits redesign

All eight existing pages use a shared design based on the React Bits website: ink-purple surfaces, Geist typography, a violet accent, large headlines, outlined controls, and restrained motion.

## Pages

- Home: download workspace, video/audio previews, numbered workflow, and FAQ.
- MP4: video-first download workspace and resolution guide.
- MP3: audio-first download workspace and audio format guide.
- About: editorial story and principles.
- Contact: labeled email preparation form and support links. Messages open in the user's email application; the page does not claim to send them.
- Privacy, Terms, and DMCA: document layouts with section navigation. Existing policy body text is preserved.
- Unknown routes: a branded recovery page.

## Official component source

Repository: https://github.com/DavidHDev/react-bits

Cloned reference: `../react-bits-reference`, commit `e1bbb696`.

Local components in `src/components/reactbits`: Threads, BlurText, DecryptedText, SpotlightCard, and Magnet. The upstream license is included in that directory. BlurText uses a span wrapper for valid heading markup; DecryptedText exposes stable screen-reader text. The shared motion wrapper respects reduced motion and provides a static fallback if WebGL is unavailable.

Dependencies: `motion` and `ogl`. The manifest also declares `youtubei.js`, already required by the existing backend.

## Verification

- Production Vite build passes.
- All eight pages checked in the browser at desktop width and 390px and 320px mobile widths, without horizontal overflow.
- Mobile menu opens and closes on navigation.
- Empty and invalid URL validation, loading state, MP3 audio default, format switching, clear/reset, and generated download request parameters verified using controlled metadata responses. No test media file was downloaded.
- FAQ expansion, cross-page anchors, document deep links, and the unknown-route recovery page checked.
- Simulated reduced-motion preference renders static artwork with no WebGL canvas.
- Contact fields have associated labels and browser validation.
- Existing backend status endpoint returns HTTP 200. The download pipeline remains unchanged; a complete live YouTube transfer was not tested.

## Run

`npm run dev` runs the frontend at http://localhost:5173 and the API at http://localhost:3000. `npm run build` refreshes the production files in `dist`.
