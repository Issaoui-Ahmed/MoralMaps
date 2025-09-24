import { NextResponse } from 'next/server';
import { isValidAdminBasicAuth } from '../../src/utils/adminAuth';

/**
 * Returns true if the request carries a valid Basic Auth header
 * recognized by your admin validator.
 */
export function requireAdmin(req) {
  const authHeader = req.headers.get('authorization') ?? '';
  return isValidAdminBasicAuth(authHeader);
}

/**
 * Convenience guard for route handlers. Usage:
 *   const guard = assertAdmin(req);
 *   if (guard) return guard; // 401 response
 */
export function assertAdmin(req) {
  if (requireAdmin(req)) return undefined;
  return new NextResponse(
    JSON.stringify({ error: 'Authentication required' }),
    {
      status: 401,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        // Helps browsers prompt for creds during manual testing
        'www-authenticate': 'Basic realm="Admin", charset="UTF-8"',
      },
    }
  );
}
