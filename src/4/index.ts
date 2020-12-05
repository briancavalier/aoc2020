import { createInterface } from 'readline'

declare const TAG: unique symbol
type Tagged<T, A> = A & { [TAG]: T }

export type TravelDocument = Passport | NorthPoleCredentials

export type Passport = {
  pid: PID,
  cid: CID,
  byr: BYR,
  iyr: IYR,
  eyr: EYR,
  hgt: HGT,
  hcl: HCL,
  ecl: ECL
}

export type NorthPoleCredentials = Omit<Passport, 'cid'>

type PID = Tagged<'PID', string>
type BYR = Tagged<'BYR', string>
type IYR = Tagged<'IYR', string>
type EYR = Tagged<'EYR', string>
type HGT = Tagged<'HGT', string>
type HCL = Tagged<'HCL', string>
type ECL = Tagged<'ECL', string>
type CID = Tagged<'CID', string>

const isPID = (s: unknown): s is PID => typeof s === 'string' && /^\d{9}$/.test(s)
const isBYR = (s: unknown): s is BYR => {
  if (typeof s !== 'string') return false
  const y = parseInt(s, 10)
  return y >= 1920 && y <= 2002
}
const isIYR = (s: unknown): s is IYR => {
  if (typeof s !== 'string') return false
  const y = parseInt(s, 10)
  return y >= 2010 && y <= 2020
}
const isEYR = (s: unknown): s is EYR => {
  if (typeof s !== 'string') return false
  const y = parseInt(s, 10)
  return y >= 2020 && y <= 2030
}
const isHGT = (s: unknown): s is HGT => {
  if (typeof s !== 'string') return false

  const x = parseInt(s, 10)
  if (/\d+cm/.test(s)) return x >= 150 && x <= 193
  if (/\d+in/.test(s)) return x >= 59 && x <= 76

  return false
}
const isHCL = (s: unknown): s is HCL =>
  typeof s === 'string' && /^#[0-9a-f]{6}$/.test(s)

const isECL = (s: unknown): s is ECL =>
  typeof s === 'string' && /^amb|blu|brn|gry|grn|hzl|oth$/.test(s)

const parseTravelDocument = (s: string): TravelDocument | undefined => {
  const d = {} as Record<string, string>
  for (const field of s.split(/\s+/)) {
    const m = /^(pid|cid|byr|iyr|eyr|hgt|hcl|ecl):(\S+)$/.exec(field)
    if (m) d[m[1]] = m[2]
  }

  return (isPID(d.pid) && isBYR(d.byr) && isIYR(d.iyr) && isEYR(d.eyr) && isHGT(d.hgt) && isHCL(d.hcl) && isECL(d.ecl))
    ? d as TravelDocument
    : undefined
}

export async function* readInputs(input: AsyncIterable<string>): AsyncIterable<string> {
  let docString = ''
  for await (const line of input) {
    const l = line.trim()
    if (!l) {
      if (docString) yield docString
      docString = ''
    } else {
      docString = `${docString} ${l}`
    }
  }

  if (docString) yield docString
}

export async function* parseTravelDocuments(docStrings: AsyncIterable<string>): AsyncIterable<TravelDocument> {
  for await (const s of docStrings) {
    const d = parseTravelDocument(s)
    if (d) yield d
  }
}

export const count = async <A>(as: AsyncIterable<A>): Promise<number> => {
  let n = 0
  for await (const _ of as) n += 1
  return n
}

count(parseTravelDocuments(readInputs(createInterface(process.stdin))))
  .then(count => console.log('Valid passports:', count))
