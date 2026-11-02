import { randomInt } from "crypto"

// Every record a test creates is named   Qa <run stamp> [Label] <random>
//   Qa         fixed marker
//   run stamp  7 lowercase letters: the run's start time in seconds, base 26 (a = 0).
//              Fixed width, so alphabetical order is chronological order
//   Label      optional, one capital letter + lowercase letters (e.g. "Type", "Renamed")
//   random     6 lowercase letters
// Example: QafxkqzmaTypeqwerty. Letters only, because owner names reject anything else (BUG-010).
// A small set of known security payloads may follow the name (SEC-002).

export const TEST_MARKER = "Qa"
const STAMP_LENGTH = 7
const RANDOM_LENGTH = 6
const ALPHABET_SIZE = 26
const CHAR_CODE_A = 97

// Names whose stamp decodes outside this window are never treated as test data
const EARLIEST_RUN = Date.UTC(2026, 0, 1)

export const XSS_IMG = "<img src=x onerror=alert(1)>"
export const XSS_SCRIPT = "\"><script>alert(1)</script>"
export const XSS_TAG = "<b>x</b>"
const PAYLOADS = [XSS_IMG, XSS_SCRIPT, XSS_TAG]

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export const TEST_NAME_PATTERN = new RegExp(
  `^${TEST_MARKER}([a-z]{${STAMP_LENGTH}})(?:[A-Z][a-z]+)?[a-z]{${RANDOM_LENGTH}}(?:${PAYLOADS.map(escapeRegExp).join("|")})?$`
)

function randomLetters(length: number): string {
  return Array.from({ length }, () => String.fromCharCode(CHAR_CODE_A + randomInt(ALPHABET_SIZE))).join("")
}

export function encodeStamp(epochMs: number): string {
  let value = Math.floor(epochMs / 1000)
  let stamp = ""
  for (let i = 0; i < STAMP_LENGTH; i++) {
    stamp = String.fromCharCode(CHAR_CODE_A + (value % ALPHABET_SIZE)) + stamp
    value = Math.floor(value / ALPHABET_SIZE)
  }
  return stamp
}

export function decodeStamp(stamp: string): number {
  return [...stamp].reduce((value, letter) => value * ALPHABET_SIZE + letter.charCodeAt(0) - CHAR_CODE_A, 0) * 1000
}

// Set once per run in global setup (support/global-sweep.ts) and inherited by the workers.
// The fallback only applies when this module is used outside the test runner.
const FALLBACK_STAMP = encodeStamp(Date.now())

export function currentRunStamp(): string {
  return process.env.TEST_RUN_STAMP ?? FALLBACK_STAMP
}

export function testName(label: string = ""): string {
  if (label !== "" && !/^[A-Z][a-z]+$/.test(label)) throw new Error(`Invalid test name label "${label}": use one capital letter + lowercase letters`)
  return `${TEST_MARKER}${currentRunStamp()}${label}${randomLetters(RANDOM_LENGTH)}`
}

// Random letters for values that are not record names (descriptions, search texts, URLs)
export function randomText(length: number = 8): string {
  return randomLetters(length)
}

// The run start time encoded in a test name, or undefined if the name is not a test name
export function stampOf(name: string | undefined): string | undefined {
  const match = name === undefined ? null : TEST_NAME_PATTERN.exec(name)
  if (!match) return undefined
  const time = decodeStamp(match[1])
  return time >= EARLIEST_RUN && time <= Date.now() ? match[1] : undefined
}

export function isTestName(name: string | undefined): boolean {
  return stampOf(name) !== undefined
}
