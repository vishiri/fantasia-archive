import { expect, test } from 'vitest'

import { checkIfExternalUrl, isSafeExternalHttpUrl } from '../faExternalUrlPredicate'

/**
 * checkIfExternalUrl
 * Accepts typical public https URL.
 */
test('Test that checkIfExternalUrl returns true for https example host', () => {
  expect(checkIfExternalUrl('https://www.example.com/path')).toBe(true)
})

/**
 * checkIfExternalUrl
 * URL parser normalizes uppercase scheme to http: so uppercase HTTP is allowed.
 */
test('Test that checkIfExternalUrl returns true for uppercase HTTP scheme', () => {
  expect(checkIfExternalUrl('HTTP://example.com/')).toBe(true)
})

/**
 * checkIfExternalUrl
 * Leading and trailing whitespace is trimmed before parsing.
 */
test('Test that checkIfExternalUrl trims surrounding whitespace', () => {
  expect(checkIfExternalUrl('  https://example.com/  ')).toBe(true)
})

/**
 * checkIfExternalUrl
 * Hostname localhost is blocked.
 */
test('Test that checkIfExternalUrl blocks http localhost with port', () => {
  expect(checkIfExternalUrl('http://localhost:3000')).toBe(false)
})

/**
 * checkIfExternalUrl
 * RFC 6761 style *.localhost names are blocked.
 */
test('Test that checkIfExternalUrl blocks sub.localhost', () => {
  expect(checkIfExternalUrl('https://app.localhost/path')).toBe(false)
})

/**
 * checkIfExternalUrl
 * Percent-encoded host decodes to localhost and is blocked.
 */
test('Test that checkIfExternalUrl blocks percent-encoded localhost host', () => {
  expect(checkIfExternalUrl('http://%6Cocalhost/')).toBe(false)
})

/**
 * checkIfExternalUrl
 * IPv4 loopback 127.0.0.1 is blocked.
 */
test('Test that checkIfExternalUrl blocks 127.0.0.1', () => {
  expect(checkIfExternalUrl('http://127.0.0.1:8080/')).toBe(false)
})

/**
 * checkIfExternalUrl
 * IPv4 all-zero address is blocked.
 */
test('Test that checkIfExternalUrl blocks 0.0.0.0', () => {
  expect(checkIfExternalUrl('http://0.0.0.0/')).toBe(false)
})

/**
 * checkIfExternalUrl
 * IPv6 loopback ::1 is blocked (bracketed form in input string).
 */
test('Test that checkIfExternalUrl blocks IPv6 loopback compressed', () => {
  expect(checkIfExternalUrl('http://[::1]/')).toBe(false)
})

/**
 * checkIfExternalUrl
 * Full IPv6 loopback form normalizes to loopback and is blocked.
 */
test('Test that checkIfExternalUrl blocks IPv6 loopback uncompressed', () => {
  expect(
    checkIfExternalUrl('http://[0000:0000:0000:0000:0000:0000:0000:0001]/')
  ).toBe(false)
})

/**
 * checkIfExternalUrl
 * IPv4-mapped IPv6 loopback serializes as ::ffff:7f00:1 and is blocked.
 */
test('Test that checkIfExternalUrl blocks IPv4-mapped IPv6 loopback', () => {
  expect(checkIfExternalUrl('http://[::ffff:127.0.0.1]/')).toBe(false)
})

/**
 * checkIfExternalUrl
 * IPv4-mapped all-zero IPv4 is blocked.
 */
test('Test that checkIfExternalUrl blocks IPv4-mapped all-zero IPv4', () => {
  expect(checkIfExternalUrl('http://[::ffff:0.0.0.0]/')).toBe(false)
})

/**
 * checkIfExternalUrl
 * Non-loopback IPv6 documentation prefix is allowed.
 */
test('Test that checkIfExternalUrl allows non-loopback IPv6', () => {
  expect(checkIfExternalUrl('http://[2001:db8::1]/')).toBe(true)
})

/**
 * checkIfExternalUrl
 * Public hostname that contains localhost as substring is allowed (not a loopback host).
 */
test('Test that checkIfExternalUrl allows notlocalhost in domain label', () => {
  expect(checkIfExternalUrl('https://notlocalhost.example/')).toBe(true)
})

/**
 * checkIfExternalUrl
 * Relative URL fails to parse as absolute and is rejected.
 */
test('Test that checkIfExternalUrl rejects relative path', () => {
  expect(checkIfExternalUrl('/docs/page')).toBe(false)
})

/**
 * checkIfExternalUrl
 * file scheme is not allowlisted.
 */
test('Test that checkIfExternalUrl rejects file URL', () => {
  expect(checkIfExternalUrl('file:///C:/app/index.html')).toBe(false)
})

/**
 * checkIfExternalUrl
 * Unknown scheme resembling https is rejected.
 */
test('Test that checkIfExternalUrl rejects nothttps scheme', () => {
  expect(checkIfExternalUrl('nothttps://example.com')).toBe(false)
})

/**
 * checkIfExternalUrl
 * javascript URL is rejected.
 */
test('Test that checkIfExternalUrl rejects javascript URL', () => {
  expect(checkIfExternalUrl('javascript:alert(1)')).toBe(false)
})

/**
 * checkIfExternalUrl
 * Empty string after trim is rejected.
 */
test('Test that checkIfExternalUrl rejects empty string', () => {
  expect(checkIfExternalUrl('')).toBe(false)
})

/**
 * checkIfExternalUrl
 * Whitespace-only string is rejected.
 */
test('Test that checkIfExternalUrl rejects whitespace-only string', () => {
  expect(checkIfExternalUrl('   \t  ')).toBe(false)
})

/**
 * checkIfExternalUrl
 * Invalid URL string throws internally and returns false.
 */
test('Test that checkIfExternalUrl rejects malformed URL', () => {
  expect(checkIfExternalUrl('http://')).toBe(false)
})

/**
 * checkIfExternalUrl
 * Private IPv4 is still allowed (only loopback and all-zero are blocked).
 */
test('Test that checkIfExternalUrl allows RFC1918 IPv4', () => {
  expect(checkIfExternalUrl('http://192.168.1.1/')).toBe(true)
})

/**
 * checkIfExternalUrl
 * IPv4-mapped private IPv4 is allowed.
 */
test('Test that checkIfExternalUrl allows IPv4-mapped private IPv4', () => {
  expect(checkIfExternalUrl('http://[::ffff:192.0.2.1]/')).toBe(true)
})

/**
 * checkIfExternalUrl
 * Non-canonical IPv4-mapped IPv6 with only one tail hextet is blocked.
 */
test('Test that checkIfExternalUrl blocks single-hextet IPv4-mapped IPv6', () => {
  expect(checkIfExternalUrl('http://[::ffff:7f00]/')).toBe(false)
})

/**
 * isSafeExternalHttpUrl
 * Rejects empty hostname even when protocol is allowlisted.
 */
test('Test that isSafeExternalHttpUrl rejects empty hostname', () => {
  expect(isSafeExternalHttpUrl('https:', '')).toBe(false)
})

/**
 * isSafeExternalHttpUrl
 * Rejects disallowed protocols.
 */
test('Test that isSafeExternalHttpUrl rejects ftp protocol', () => {
  expect(isSafeExternalHttpUrl('ftp:', 'example.com')).toBe(false)
})

/**
 * isSafeExternalHttpUrl
 * Public IPv4 in hostname string is allowed.
 */
test('Test that isSafeExternalHttpUrl allows public IPv4 hostname', () => {
  expect(isSafeExternalHttpUrl('https:', '8.8.8.8')).toBe(true)
})

/**
 * isSafeExternalHttpUrl
 * Invalid hex in IPv4-mapped IPv6 tail is blocked.
 */
test('Test that isSafeExternalHttpUrl blocks invalid hex in IPv4-mapped tail', () => {
  expect(isSafeExternalHttpUrl('https:', '[::ffff:gggg:1]')).toBe(false)
})

/**
 * isSafeExternalHttpUrl
 * Overflowing hextet values in IPv4-mapped tail are blocked.
 */
test('Test that isSafeExternalHttpUrl blocks oversized hextets in IPv4-mapped tail', () => {
  expect(isSafeExternalHttpUrl('https:', '[::ffff:10000:1]')).toBe(false)
})

/**
 * isSafeExternalHttpUrl
 * Dotted host with an octet above 255 is not classified as IPv4 (strict parse rejects in-loop).
 */
test('Test that synthetic dotted host with octet over 255 is not IPv4 literal', () => {
  expect(isSafeExternalHttpUrl('https:', '10.300.1.1')).toBe(true)
})

/**
 * isSafeExternalHttpUrl
 * Leading-zero octet form is not classified as IPv4 literal for synthetic host strings.
 */
test('Test that synthetic dotted host with leading-zero octet is not IPv4 literal', () => {
  expect(isSafeExternalHttpUrl('https:', '127.0.0.01')).toBe(true)
})
