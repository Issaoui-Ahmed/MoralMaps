export function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const key = parts.shift().trim();
    const value = decodeURIComponent(parts.join('='));
    list[key] = value;
  });
  return list;
}

export function requireAdmin(req) {
  const cookies = parseCookies(req);
  return cookies.adminAuth === '1';
}
