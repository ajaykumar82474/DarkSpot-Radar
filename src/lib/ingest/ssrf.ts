/**
 * SSRF Guard - Security utility to block private IP ranges, localhost,
 * cloud metadata endpoints, and non-http/https protocols.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254", // AWS/GCP metadata
  "metadata.google.internal",
  "instance-data",
]);

export interface SSRFCheckResult {
  safe: boolean;
  reason?: string;
}

/**
 * Checks if a given IP address belongs to private or link-local ranges.
 */
function isPrivateIp(ip: string): boolean {
  // IPv4 private ranges:
  // 10.0.0.0 - 10.255.255.255
  // 172.16.0.0 - 172.31.255.255
  // 192.168.0.0 - 192.168.255.255
  // 127.0.0.0 - 127.255.255.255 (loopback)
  // 169.254.0.0 - 169.254.255.255 (link-local)
  const parts = ip.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 0) return true;
  }
  return false;
}

/**
 * Validates a target URL against SSRF vulnerabilities.
 */
export function isSafeUrl(inputUrl: string): SSRFCheckResult {
  if (!inputUrl || typeof inputUrl !== "string") {
    return { safe: false, reason: "Empty or invalid URL" };
  }

  let parsed: URL;
  try {
    parsed = new URL(inputUrl);
  } catch {
    return { safe: false, reason: "Malformed URL" };
  }

  // Only allow HTTP and HTTPS
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { safe: false, reason: `Unsupported protocol '${parsed.protocol}'. Only HTTP and HTTPS are permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and known metadata hostnames
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    return { safe: false, reason: `Host '${hostname}' is restricted for security.` };
  }

  // Block IPv4 loopback / private IP
  if (isPrivateIp(hostname)) {
    return { safe: false, reason: `Private IP address '${hostname}' is restricted.` };
  }

  return { safe: true };
}
