import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve the path relative to the project root so all routes reference
// the same file regardless of their working directory.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionsFile = path.join(__dirname, '..', '..', 'sessions.json');


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
