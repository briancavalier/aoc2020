import { createInterface } from 'readline'

declare const TAG: unique symbol
export type Tagged<T, A> = A & { [TAG]: T }

export { createInterface as lines }
