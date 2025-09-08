import fs from 'fs';
import path from 'path';

const sessionsFile = path.join(process.cwd(), 'sessions.json');

export function loadSessions() {
  try {
    const data = fs.readFileSync(sessionsFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export function saveSessions(sessions) {
  fs.writeFileSync(sessionsFile, JSON.stringify(sessions), 'utf8');
}
