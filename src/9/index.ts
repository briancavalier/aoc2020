import { lines, map, toArray } from '../lib'

export type Sums = {
  inputs: readonly number[]
  sums: readonly number[]
}
export const initSums = (inputs: readonly number[]): Sums =>
  ({ inputs, sums: computePairSums(inputs).flat() })

export const computePairSums = (inputs: readonly number[]): readonly (readonly number[])[] =>
  inputs.map((n, i, inputs) => inputs.slice(i + 1).map(x => n + x))

export const verify = (n: number, { sums }: Sums): boolean =>
  sums.includes(n)

// Brute force recompute for now
// Probably could be incremental
export const update = (n: number, { inputs }: Sums): Sums =>
  initSums([...inputs.slice(1), n])

// Part 1
export const findInvalidInput = (preambleSize: number, ns: readonly number[]): number | undefined => {
  let sums = initSums(ns.slice(0, preambleSize))
  for (const n of ns.slice(preambleSize)) {
    if (!verify(n, sums)) return n
    sums = update(n, sums)
  }
  return undefined
}

// Part 2
// I'm sure this could be more modular and incremental, but I don't have time.
export const findVulnerableRange = (value: number, ns: readonly number[]): readonly number[] | undefined => {
  for (let i = 0; i < ns.length; ++i) {
    let sum = ns[i]
    for (let j = i + 1; j < ns.length; ++j) {
      sum += ns[j]
      if (value === sum) return ns.slice(i, j)
    }
  }
  return undefined
}

toArray(map(Number, lines(process.stdin))).then(inputs => {
  const maybeInvalid = findInvalidInput(25, inputs)
  if (typeof maybeInvalid === 'number') {
    console.log('Found invalid input:', maybeInvalid)
    const vulnurableRange = findVulnerableRange(maybeInvalid, inputs)
    if (vulnurableRange) {
      const min = Math.min(...vulnurableRange)
      const max = Math.max(...vulnurableRange)
      console.log('Found vulnurable range, min:', min, ', max: ', max, ', sum:', min + max)
    }
  }
  else console.log('All inputs valid')
})
