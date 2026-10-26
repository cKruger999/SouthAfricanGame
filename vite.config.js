import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Every page in the app must be listed here so `npm run build` includes it.
// When a new game is added, add its index.html below.
const page = p => resolve(import.meta.dirname, p);

export default defineConfig({
  base: './',                 // relative paths, so the build also works inside the Android app later
  server: { host: true },     // also serve on the home network so a phone can open it
  preview: { host: true },
  build: {
    rollupOptions: {
      input: {
        home: page('index.html'),
        bottleStoreDash: page('games/bottle-store-dash/index.html'),
        hadedaAlarmClock: page('games/hadeda-alarm-clock/index.html')
      }
    }
  }
});
