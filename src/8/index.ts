import { Tagged, lines, map, toArray } from '../lib'

type Line = Tagged<'Line', number> & keyof Program<any>
type Offset = Tagged<'Offset', number>

type Program<Instruction> = readonly Instruction[]

type Step<State, Reason> =
  | { type: 'step', state: State }
  | { type: 'fail', state: State, reason: Reason }

type Instruction = NOP | JMP | ACC
type NOP = { type: 'nop', value: number }
type JMP = { type: 'jmp', by: Offset }
type ACC = { type: 'acc', value: number }

type InvalidInstruction = { type: 'invalid', text: string }

const inc = (l: Line): Line => jmp(l, 1 as Offset)
const jmp = (l: Line, by: Offset): Line => line(l as number + by)
const line = (n: number): Line => Math.floor(Math.max(0, n)) as Line

const flipNopJmp = (i: Instruction): Instruction =>
  i.type === 'nop' ? { type: 'jmp', by: i.value as Offset }
    : i.type === 'jmp' ? { type: 'nop', value: i.by }
      : i

const parseInstruction = (s: string): Instruction | InvalidInstruction => {
  const m = /(nop|jmp|acc)\s+([+-]\d+)/.exec(s)
  if (!m) return { type: 'invalid', text: s }

  const type = m[1]
  const value = parseInt(m[2], 10)
  return type === 'nop' ? { type, value }
    : type === 'jmp' ? { type, by: value as Offset }
      : type === 'acc' ? { type, value }
        : { type: 'invalid', text: s }
}

// Validate a program
const isValidProgram = (program: Program<Instruction | InvalidInstruction>): program is Program<Instruction> =>
  !program.some(i => i.type === 'invalid')

type AccState = { acc: number }

type ProgramState = { line: Line }

// Step a program by interpreting the current instruction
const stepProgram = <S extends ProgramState & AccState>(i: Instruction, s: S): Step<S, never> =>
  i.type === 'jmp' ? { type: 'step', state: { ...s, line: jmp(s.line, i.by) } }
    : i.type === 'acc' ? { type: 'step', state: { ...s, line: inc(s.line), acc: s.acc + i.value } }
      : { type: 'step', state: { ...s, line: inc(s.line) } }

type TraceState = { trace: Set<Line> }
const infiniteLoop = { type: 'InfiniteLoop' } as const
type InfiniteLoop = typeof infiniteLoop

// Track execution and detect when an instruction is executed a second time
const detectInfiniteLoop = <I, S extends ProgramState, Reason>(step: (i: I, s: S) => Step<S, Reason>) =>
  (i: I, state: TraceState & S): Step<TraceState & S, InfiniteLoop | Reason> => {
    if (state.trace.has(state.line)) return { type: 'fail', state, reason: infiniteLoop }
    const s = step(i, state)
    return s.type === 'step'
      ? { type: 'step', state: { ...s.state, trace: new Set([...state.trace, state.line]) } }
      : { type: 'fail', state: { ...s.state, trace: state.trace }, reason: s.reason }
  }

// Try to run a program to completion and get the result
const getResult = <I, S extends ProgramState, Reason>(
  step: (i: I, s: S) => Step<S, Reason>,
  program: Program<I>,
  state: S
): Step<S, Reason> => {
  if (state.line >= program.length) return { type: 'step', state }

  const s = step(program[state.line], state)
  return s.type === 'step' ? getResult(step, program, s.state) : s
}

type Infinite<P extends Program<unknown>> = Tagged<'Infinite', P>

const isInfinite = <I, S extends ProgramState, Reason>(
  step: (i: I, s: S) => Step<S, Reason>,
  program: Program<I>,
  state: S
): program is Infinite<Program<I>> => {
  const result = getResult(detectInfiniteLoop(step), program, { ...state, trace: new Set<Line>() })
  return result.type === 'fail' && result.reason === infiniteLoop
}

// Very specific optimization that assumes input Program contains an infinite loop
// n! rather than n^2
const fixInfinite = <S extends ProgramState & TraceState, Reason>(
  step: (i: Instruction, s: S) => Step<S, Reason>,
  program: Infinite<Program<Instruction>>,
  state: S
): Step<S, Reason> => {
  // flip nop/jmp and resume at same state
  // If it completes, we're done
  const i = program[state.line]
  if (i.type === 'nop' || i.type === 'jmp') {
    const newProgram = [...program.slice(0, state.line), flipNopJmp(i), ...program.slice(inc(state.line))]
    const result = getResult(step, newProgram, state)
    if (result.type === 'step') return result
  }

  // If there was a loop, it must be caused by a later instruction
  // try to find the failure by resuming at the next step
  const s = step(i, state)
  return s.type === 'fail' ? s : fixInfinite(step, program, s.state)
}

const printResult = <S extends AccState & ProgramState, R>(p: Program<unknown>, s: Step<S, R>): void => {
  if (s.type === 'fail') console.error('FAIL', s.reason, 'at line:', s.state.line, 'instruction:', p[s.state.line], 'acc:', s.state.acc)
  else console.log('SUCCESS acc:', s.state.acc)
}

toArray(map(parseInstruction, lines(process.stdin))).then(program => {
  if (!isValidProgram(program)) throw new SyntaxError(`Invalid program instruction: ${program}`)
  return program
}).then(program => {
  const initialState = { trace: new Set<Line>(), acc: 0, line: 0 as Line }

  // Part 1
  const result1 = getResult(detectInfiniteLoop(stepProgram), program, initialState)
  printResult(program, result1)

  // Part 2
  // Could probably figure out a way to combine parts 1 and 2, but for now
  // just evaluate the program an extra time
  if (isInfinite(stepProgram, program, initialState)) {
    console.log('Trying to fix infinite program')
    const result2 = fixInfinite(detectInfiniteLoop(stepProgram), program, initialState)
    printResult(program, result2)
  }
})
