import { createInterface } from 'readline'

export type NonEmptyList<A> = [A, ...readonly A[]]

// A traversal through a terrain map
export type Traversal<Map> = { move: Move, at: At<Map> }

// How to move at each step of a traversal
export type Move = { x: number, y: number }

// Current location within a map
export type At<Map> = { x: number, y: number, map: Map }

export type Map<A> = NonEmptyList<NonEmptyList<A>>

// A particular path that was taken and recorded
export type Path<A> = readonly A[]

// Specific type of terrain
const open = '.' as const
const tree = '#' as const
export type Terrain = typeof open | typeof tree

// Count trees in a traversal
// Enforce the requirement to move first (i.e. don't count first row)
export const countTrees = (tr: Traversal<Map<Terrain>>): number =>
  count(tree, traverse(next(tr)))

// Count trees in a path
export const count = <T>(t: T, p: Path<T>): number => p.filter(x => x === t).length

// Create a traversal through a terrain map
export const start = <T>(move: Move, map: Map<T>): Traversal<Map<T>> =>
  ({ move, at: { x: 0, y: 0, map } })

// Get the terrain at the current location
export const at = <T>({ at }: Traversal<Map<T>>): T => {
  const row = at.map[at.y % at.map.length]
  return row[at.x % row.length]
}

// Fully traverse a map and record the paths
export const traverse = <T>(t: Traversal<Map<T>>): Path<T> =>
  atEnd(t) ? [] : [at(t), ...traverse(next(t))]

export const next = <Map>({ move, at }: Traversal<Map>): Traversal<Map> =>
  ({ move, at: { ...at, x: at.x + move.x, y: at.y + move.y } })

export const atEnd = <T>({ at }: Traversal<Map<T>>): boolean =>
  at.y > at.map.length - 1

export const parseMap = async (input: AsyncIterable<string>): Promise<Map<Terrain>> => {
  const m: (readonly string[])[] = []
  for await (const line of input) {
    if (/[.#]+/.test(line)) m.push([...line])
  }
  return m.length === 0 ? Promise.reject(new Error('Invalid map input')) : m as Map<Terrain>
}

const moves = [
  { x: 1, y: 1 },
  { x: 3, y: 1 },
  { x: 5, y: 1 },
  { x: 7, y: 1 },
  { x: 1, y: 2 }
]

parseMap(createInterface(process.stdin))
  .then(map => {
    if (!map) throw new Error('Invalid map input')
    const result = moves.reduce((n, move) => n * countTrees(start(move, map)), 1)
    console.log(result)
  })
