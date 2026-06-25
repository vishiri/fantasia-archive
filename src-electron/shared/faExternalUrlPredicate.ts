/**
 * Parsed http(s) URLs only; blocks loopback and non-network IPv4 targets so 'shell.openExternal'
 * does not target the local machine. Hostnames come from WHATWG 'URL' after normalization
 * (percent-decoding, IPv6 compression, IPv4-mapped IPv6 in hex hextets).
 *
 * No Node.js built-in or package imports: this module is bundled into sandboxed preload as well as main.
 */
const ALLOWED_PROTOCOLS = new Set([
  'http:',
  'https:'
])

/**
 * True when 'host' is a strict four-part decimal IPv4 (no leading-zero octets except a single '0').
 * Matches typical 'URL.hostname' output for IPv4 literals without using 'node:net' (preload sandbox).
 */
function isIpv4DottedDecimalHost (host: string): boolean {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host)

  if (!m) {
    return false
  }

  for (let i = 1; i <= 4; i++) {
    const s = m[i]!
    const n = Number(s)

    if (Number.isNaN(n) || n > 255) {
      return false
    }

    if (s.length > 1 && s.startsWith('0')) {
      return false
    }
  }

  return true
}

function stripIpv6Brackets (hostname: string): string {
  if (
    hostname.length >= 2 &&
    hostname.startsWith('[') &&
    hostname.endsWith(']')
  ) {
    return hostname.slice(1, -1)
  }

  return hostname
}

function isIpv4LoopbackOrAllZero (ipv4: string): boolean {
  const parts = ipv4.split('.').map((x) => Number.parseInt(x, 10))

  if (parts[0] === 127) {
    return true
  }

  if (parts.every((n) => n === 0)) {
    return true
  }

  return false
}

/**
 * True for RFC1918 private IPv4, link-local 169.254.0.0/16, loopback, and all-zero.
 */
function isBlockedPrivateOrLocalIpv4 (ipv4: string): boolean {
  if (isIpv4LoopbackOrAllZero(ipv4)) {
    return true
  }

  const [a, b] = partsFromIpv4(ipv4)

  if (a === 10) {
    return true
  }

  if (a === 172 && b >= 16 && b <= 31) {
    return true
  }

  if (a === 192 && b === 168) {
    return true
  }

  if (a === 169 && b === 254) {
    return true
  }

  return false
}

function partsFromIpv4 (ipv4: string): [number, number, number, number] {
  const parts = ipv4.split('.').map((x) => Number.parseInt(x, 10))
  return [parts[0]!, parts[1]!, parts[2]!, parts[3]!]
}

/**
 * IPv4-mapped IPv6 tail after '::ffff:' (WHATWG serializes mapped IPv4 as two hextets).
 * Malformed tails are treated as blocked so 'openExternal' never sees odd '::ffff' shapes.
 */
function isBlockedIpv4MappedIpv6Tail (tail: string): boolean {
  const hexParts = tail.split(':').filter((p) => p.length > 0)

  if (hexParts.length !== 2) {
    return true
  }

  const high = Number.parseInt(hexParts[0]!, 16)
  const low = Number.parseInt(hexParts[1]!, 16)

  if (
    Number.isNaN(high) ||
    Number.isNaN(low) ||
    high > 0xffff ||
    low > 0xffff
  ) {
    return true
  }

  const combined = (high << 16) | low
  const firstOctet = (combined >>> 24) & 0xff
  const secondOctet = (combined >>> 16) & 0xff

  if (firstOctet === 127) {
    return true
  }

  if (combined === 0) {
    return true
  }

  if (firstOctet === 10) {
    return true
  }

  if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) {
    return true
  }

  if (firstOctet === 192 && secondOctet === 168) {
    return true
  }

  if (firstOctet === 169 && secondOctet === 254) {
    return true
  }

  return false
}

function isBlockedIpv6 (inner: string): boolean {
  const h = inner.toLowerCase()

  if (h === '::1') {
    return true
  }

  const mapped = /^::ffff:(.+)$/i.exec(h)

  if (!mapped) {
    return false
  }

  return isBlockedIpv4MappedIpv6Tail(mapped[1]!)
}

function isBlockedHost (rawHostname: string): boolean {
  const hostname = stripIpv6Brackets(rawHostname).toLowerCase()

  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return true
  }

  if (isIpv4DottedDecimalHost(hostname)) {
    return isBlockedPrivateOrLocalIpv4(hostname)
  }

  if (hostname.includes(':')) {
    return isBlockedIpv6(hostname)
  }

  return false
}

/**
 * True when 'protocol' is 'http:' or 'https:' and 'hostname' (after URL parsing) is allowed for
 * opening in the system browser. Exposed for focused unit tests; prefer 'checkIfExternalUrl' for
 * call sites that start from a string.
 */
export function isSafeExternalHttpUrl (protocol: string, hostname: string): boolean {
  if (!ALLOWED_PROTOCOLS.has(protocol)) {
    return false
  }

  if (hostname === '') {
    return false
  }

  if (isBlockedHost(hostname)) {
    return false
  }

  return true
}

/**
 * True when 'url' is an absolute 'http:' or 'https:' URL whose host is not loopback, all-zero IPv4,
 * or a 'localhost' name (including percent-encoded 'localhost' after parsing).
 */
export function checkIfExternalUrl (url: string): boolean {
  const trimmed = url.trim()

  if (trimmed === '') {
    return false
  }

  if (!URL.canParse(trimmed)) {
    return false
  }

  const parsedUrl = new URL(trimmed)

  return isSafeExternalHttpUrl(parsedUrl.protocol, parsedUrl.hostname)
}
