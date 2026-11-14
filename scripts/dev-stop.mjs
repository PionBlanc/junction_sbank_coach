// Stops leftover `npm run dev` processes, then anything still listening on the dev ports.
// Run with: npm run dev:stop
//
// Why both: an orphaned dev session often holds no port at all (e.g. `node --watch` whose
// server child died), but respawns the server on the next file save and grabs 8787 again.
import { execFileSync, execSync } from 'node:child_process';
import path from 'node:path';

// Vite moves up from 5173 when a port is busy, so cover its fallback range too.
const PORTS = [8787, 5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180];
const REPO = path
  .resolve(import.meta.dirname, '..')
  .toLowerCase()
  .replaceAll('\\', '/');

// The processes `npm run dev` starts (see package.json and the app package.json files).
function isDevProcess(commandLine) {
  const cmd = commandLine.toLowerCase().replaceAll('\\', '/');
  if (/npm-cli\.js"?\s+run\s+dev(\s+-w\s+@coach\/\S+)?\s*$/.test(cmd)) return true;
  if (cmd.includes('--watch --import tsx src/index.ts')) return true;
  if (cmd.includes(REPO) && (cmd.includes('/concurrently/') || cmd.includes('/vite/'))) return true;
  return false;
}

// Returns [pid, commandLine] for every node process.
function nodeProcesses() {
  try {
    if (process.platform === 'win32') {
      const script =
        'Get-CimInstance Win32_Process -Filter "Name=\'node.exe\'" | ' +
        "ForEach-Object { [string]$_.ProcessId + ' ' + $_.CommandLine }";
      const out = execFileSync('powershell', ['-NoProfile', '-Command', script], {
        encoding: 'utf8',
      });
      return parsePidLines(out);
    }
    return parsePidLines(execSync('ps -eo pid=,args=', { encoding: 'utf8' }));
  } catch {
    return [];
  }
}

function parsePidLines(out) {
  const rows = [];
  for (const line of out.split('\n')) {
    const match = /^\s*(\d+)\s+(.*)$/.exec(line.trim());
    if (match?.[1] && match[2]) rows.push([match[1], match[2]]);
  }
  return rows;
}

function pidsOnPort(port) {
  try {
    if (process.platform === 'win32') {
      // Columns: Proto, Local Address, Foreign Address, State, PID.
      // No "-p tcp": that flag hides IPv6 sockets, and Vite listens on [::1].
      const out = execSync('netstat -ano', { encoding: 'utf8' });
      const pids = new Set();
      for (const line of out.split('\n')) {
        const cols = line.trim().split(/\s+/);
        if (
          cols.length >= 5 &&
          cols[0] === 'TCP' &&
          cols[1]?.endsWith(`:${port}`) &&
          cols[3] === 'LISTENING'
        ) {
          pids.add(cols[4]);
        }
      }
      return [...pids];
    }
    const out = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, { encoding: 'utf8' });
    return out.split('\n').filter(Boolean);
  } catch {
    // lsof exits non-zero when nothing listens; netstat can fail too. Either way: nothing to stop.
    return [];
  }
}

function killPid(pid) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(Number(pid), 'SIGTERM');
    }
    return true;
  } catch {
    // Usually already gone because an earlier kill took its whole tree.
    return false;
  }
}

let stopped = 0;
for (const [pid, commandLine] of nodeProcesses()) {
  if (pid === String(process.pid) || !isDevProcess(commandLine)) continue;
  if (killPid(pid)) {
    stopped++;
    console.log(`stopped pid ${pid}: ${commandLine.trim().slice(0, 100)}`);
  }
}

for (const port of PORTS) {
  for (const pid of pidsOnPort(port)) {
    if (killPid(pid)) {
      stopped++;
      console.log(`port ${port}: stopped pid ${pid}`);
    }
  }
}

console.log(stopped === 0 ? 'nothing to stop' : `done, stopped ${stopped}`);
