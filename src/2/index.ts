import { foldLeft, lines } from '../lib'

export type Password = { min: number, max: number, letter: string, password: string }

export const countValidPasswords = async (isValid: (p: Password) => boolean, inputs: AsyncIterable<string>): Promise<number> =>
  foldLeft((n, line) => {
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


countValidPasswords(isValid1, lines(process.stdin))
  .then(console.log.bind(console, 'Valid passwords 1:'))

countValidPasswords(isValid2, lines(process.stdin))
  .then(console.log.bind(console, 'Valid passwords 2:'))
