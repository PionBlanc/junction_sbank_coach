// Stops anything left listening on the dev ports (server 8787, web 5173 and up, Vite's fallbacks).
// Run with: npm run dev:stop
import { execSync } from 'node:child_process';

// Vite moves up from 5173 when a port is busy, so cover its fallback range too.
const PORTS = [8787, 5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180];

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
    return false;
  }
}

for (const port of PORTS) {
  const pids = pidsOnPort(port);
  if (pids.length === 0) {
    console.log(`port ${port}: free`);
    continue;
  }
  for (const pid of pids) {
    const ok = killPid(pid);
    console.log(`port ${port}: stopped pid ${pid}${ok ? '' : ' (failed)'}`);
  }
}
