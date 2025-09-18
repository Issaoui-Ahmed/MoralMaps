import { isValidAdminBasicAuth } from "../../src/utils/adminAuth";

export function requireAdmin(req) {
  const authHeader = req.headers.get("authorization") ?? "";
  return isValidAdminBasicAuth(authHeader);
}
