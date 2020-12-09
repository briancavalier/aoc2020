import { createInterface } from 'readline'

// ----------------------------------------------------------------------------------------
// Useful types

declare const TAG: unique symbol
export type Tagged<T, A> = A & { [TAG]: T }

// ----------------------------------------------------------------------------------------
// AsyncIterable

export async function* map<A, B>(f: (a: A) => B, as: AsyncIterable<A>): AsyncIterable<B> {
  for await (const a of as) yield f(a)
}

export const foldLeft = async <A, B>(f: (b: B, a: A) => B, as: AsyncIterable<A>, b: B): Promise<B> => {
  for await (const a of as) b = f(b, a)
  return b
}

export const toArray = async <A>(as: AsyncIterable<A>): Promise<readonly A[]> =>
  foldLeft((array, a) => [...array, a], as, [] as A[])

// ----------------------------------------------------------------------------------------
// IO

export { createInterface as lines }

export async function* groups(lines: AsyncIterable<string>): AsyncIterable<readonly string[]> {
  let group: string[] = []
  for await (const line of lines) {
    if (line.trim().length > 0) {
      group.push(line)
    } else {
      if (group.length > 0) {
        yield group
        group = []
      }
    }
  }
  if (group.length > 0) yield group
}
