import { Tagged, foldLeft, groups, lines, map } from '../lib'

export type Answers = Tagged<'Answers', Set<string>>

export const parseAnswers = (s: string): Answers =>
  (/[a-z]+/.test(s) ? new Set([...s]) : new Set()) as Answers

const unionAnswers = (group: readonly string[]): Answers =>
  parseAnswers(group.join(''))

const intersectAnswers = (group: readonly string[]): Answers =>
  group.map(parseAnswers).reduce(intersect)

const intersect = <A, S extends Set<A>>(s1: S, s2: S): S => {
  const i = new Set<A>() as S
  for (const a of s1) if (s2.has(a)) i.add(a)
  return i
}

const sumSize = (n: number, s: Set<unknown>) => n + s.size

foldLeft(sumSize, map(unionAnswers, groups(lines(process.stdin))), 0)
  .then(count => console.log('Part 1. yes answers:', count))

foldLeft(sumSize, map(intersectAnswers, groups(lines(process.stdin))), 0)
  .then(count => console.log('Part 2. yes answers:', count))
