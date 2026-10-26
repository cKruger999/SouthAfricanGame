// Builds an installable Android APK in one go: `npm run apk`.
// 1. Vite builds the games into dist/
// 2. Capacitor copies dist/ into the Android project
// 3. Gradle builds the APK, using the Java that comes with Android Studio
// 4. The APK is copied to apk/South-African-Brainrot.apk
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const env = { ...process.env };
if (!env.JAVA_HOME) env.JAVA_HOME = 'C:\\Program Files\\Android\\Android Studio\\jbr';
if (!env.ANDROID_HOME) env.ANDROID_HOME = join(env.LOCALAPPDATA || '', 'Android', 'Sdk');

function run(label, command, cwd = root) {
  console.log(`\n== ${label}`);
  const r = spawnSync(command, { cwd, env, stdio: 'inherit', shell: true });
  if (r.status !== 0) { console.error(`\n${label} failed.`); process.exit(r.status || 1); }
}

if (!existsSync(env.JAVA_HOME)) { console.error(`Java not found at ${env.JAVA_HOME}. Is Android Studio installed?`); process.exit(1); }
run('Building the games', 'npx vite build');
run('Copying them into the Android project', 'npx cap sync android');
const gradlew = join(root, 'android', process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
run('Building the APK (the first time takes a few minutes)', `"${gradlew}" assembleDebug --console=plain -q`, join(root, 'android'));

const built = join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
mkdirSync(join(root, 'apk'), { recursive: true });
const out = join(root, 'apk', 'South-African-Brainrot.apk');
copyFileSync(built, out);
console.log(`\nDone! Your APK is at:\n  ${out}\n`);
