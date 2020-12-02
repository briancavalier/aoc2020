import { createInterface } from 'readline'

export type Password = { min: number, max: number, letter: string, password: string }

export const countValidPasswords = async (isValid: (p: Password) => boolean, inputs: AsyncIterable<string>): Promise<number> =>
  foldl((n, line) => {
    const p = parsePassword(line)
    return p && isValid(p) ? n + 1 : n
  }, inputs, 0)

export const isValid1 = (p: Password): boolean => {
  let n = 0
  for (const l of p.password) if (l === p.letter) n += 1
  return n >= p.min && n <= p.max
}

export const isValid2 = ({ min, max, letter, password }: Password): boolean =>
  (password[min - 1] === letter) !== (password[max - 1] === letter)

export const parsePassword = (x: string): Password | undefined => {
  const m = /^(\d+)-(\d+)\s+(\S):\s*(\S+)/.exec(x)
  if (!m) return undefined

  return { min: parseInt(m[1], 10), max: parseInt(m[2], 10), letter: m[3], password: m[4] }
}

export const foldl = async <A, B>(f: (b: B, a: A) => B, as: AsyncIterable<A>, b: B): Promise<B> => {
  for await (const a of as) b = f(b, a)
  return b
}

countValidPasswords(isValid1, createInterface(process.stdin))
  .then(console.log.bind(console, 'Valid passwords 1:'))

countValidPasswords(isValid2, createInterface(process.stdin))
  .then(console.log.bind(console, 'Valid passwords 2:'))
