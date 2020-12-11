import { Tagged, lines, map, toArray } from '../lib'

type Voltage = number

type Differential = number

type Differentials = Record<Differential, number>

type Sorted<A> = Tagged<'Sorted', A>

const differential = (v1: Voltage, v2: Voltage): Differential =>
  v1 - v2

const by = (v: Voltage, d: Differential): Voltage =>
  v + d as Voltage

const parseVoltages = (x: readonly number[]): readonly Voltage[] => x as readonly Voltage[]

const sortVoltages = (adapters: readonly Voltage[]): Sorted<readonly Voltage[]> =>
  [...adapters].sort((x, y) => x - y) as unknown as Sorted<readonly Voltage[]>

// Part 1
const findDifferentials = (adapters: Sorted<readonly Voltage[]>): Differentials =>
  foldAdjacentPairs((differentials, v1, v2) => {
    const d = differential(v2, v1)
    return { ...differentials, [d]: d in differentials ? differentials[d] + 1 : 1 }
  }, adapters, {} as Differentials)

const foldAdjacentPairs = <A, S>(f: (s: S, a1: A, a2: A) => S, as: readonly A[], s: S): S =>
  as.length < 2 ? s : foldAdjacentPairs(f, as.slice(1), f(s, as[0], as[1]))

// Part 2
const sumIncomingEdges = (voltages: Sorted<readonly Voltage[]>, counts: Record<Voltage, number>): Record<Voltage, number> =>
  voltages.slice(1).reduce((counts, v) => ({ ...counts, [v]: countIncomingEdges(counts, v) }), counts)

const countIncomingEdges = (counts: Record<Voltage, number>, v: Voltage): number =>
  (counts[by(v, -1)] ?? 0) +
  (counts[by(v, -2)] ?? 0) +
  (counts[by(v, -3)] ?? 0)

toArray(map(Number, lines(process.stdin)))
  .then(inputs => {
    const wall = 0
    const device = Math.max(...inputs) + 3
    const voltages = sortVoltages(parseVoltages([wall, ...inputs, device]))

    // Part 1
    const differentials = findDifferentials(voltages)
    const d1 = differentials[1] ?? 0
    const d3 = differentials[3] ?? 0
    console.log(differentials, '1-jolt * 3-jolt:', d1 * d3)

    // Part 2
    const edgeSums = sumIncomingEdges(voltages, { [voltages[0]]: 1 })
    console.log('Adapter arrangements:', edgeSums[voltages[voltages.length - 1]])
  })
