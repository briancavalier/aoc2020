import { Tagged, lines } from '../lib'

type Row = ArrayLike<'F' | 'B'>
type Seat = ArrayLike<'L' | 'R'>
type SeatLocation = { row: Row, seat: Seat }

type SeatId = Tagged<'SeatId', number>
const minSeatId = 0 as SeatId

export const parseSeatLocation = (s: string): SeatLocation | undefined =>
  /[FB]{7}[RL]{3}/.test(s) ? { row: s.slice(0, 7), seat: s.slice(7, s.length) } as SeatLocation : undefined

export const getSeatId = (s: SeatLocation): SeatId =>
  (getRowNumber(s) * 8 + getSeatNumber(s)) as SeatId

export const maxSeatId = (...ids: readonly SeatId[]): SeatId =>
  Math.max(...ids) as SeatId

export const getRowNumber = (s: SeatLocation): number =>
  find('F', 'B', s.row, 0, 127, 0)

export const getSeatNumber = (s: SeatLocation): number =>
  find('L', 'R', s.seat, 0, 7, 0)

export const find = <L extends string, R extends String>(l: L, r: R, s: ArrayLike<L | R>, lo: number, hi: number, index: number): number => {
  if (lo === hi) return lo

  const c = s[index]
  const mid = (hi - lo) / 2
  return c === l
    ? find(l, r, s, lo, Math.floor(hi - mid), index + 1)
    : find(l, r, s, Math.ceil(lo + mid), hi, index + 1)
}

export const findMaxSeatId = async (lines: AsyncIterable<string>): Promise<SeatId> => {
  let max: SeatId = minSeatId
  for await (const l of lines) {
    const seatLocation = parseSeatLocation(l)
    if (seatLocation) max = maxSeatId(max, getSeatId(seatLocation))
  }
  return max
}

export const readSeatIds = async (lines: AsyncIterable<string>): Promise<readonly SeatId[]> => {
  const seatIds: SeatId[] = []
  for await (const l of lines) {
    const seatLocation = parseSeatLocation(l)
    if (seatLocation) seatIds.push(getSeatId(seatLocation))
  }
  return seatIds
}

export const findMySeat = (seatIds: readonly SeatId[]): SeatId =>
  findMissingSeatId([...seatIds].sort((a, b) => a - b))

const findMissingSeatId = ([id1, id2, ...ids]: readonly SeatId[]): SeatId =>
  id1 + 1 === id2 ? findMissingSeatId([id2, ...ids]) : id1 + 1 as SeatId

findMaxSeatId(lines(process.stdin))
  .then(seatId => console.log('Max seat ID:', seatId))

readSeatIds(lines(process.stdin))
  .then(findMySeat)
  .then(seatId => console.log('My seat ID:', seatId))
