import {Ticks, TimeClass} from "tone";

export type NoteTime = string | number | TimeClass
export type BB16 = [number, number, number]

export interface INote<T extends NoteTime> {
  time: T
  instrument: number
  velocity: number
}

const BB16_SEPARATOR: string = ':'
const BB16_LENGTH: number = 3
export const DEFAULT_VELOCITY: number = .8
export const ticksToB16 = (value: number): string => Ticks(value, 'number').toBarsBeatsSixteenths()

export const h2NoteToEvent = (note: INote<number>): INote<string> => ({
  time: ticksToB16(note.time),
  instrument: note.instrument,
  velocity: note.velocity
})

export const bb16 = (bars: number = 0, beats: number = 0, quarters: number = 0): BB16 => [bars, beats, quarters]

export const isBB16 = (value: number[]): value is BB16 => value.length == BB16_LENGTH

export const stringToBB16 = (value: string): BB16 => {
  const values = value.split(BB16_SEPARATOR).map(v => +v)
  if (isBB16(values))
    return values

  const n = values.length
  for (let i = n; i < BB16_LENGTH; i++)
    values[i] = 0

  return values as BB16
}

export const bb16ToString = (value: BB16): string => value.join(BB16_SEPARATOR)

export const getNote = <T extends NoteTime>(time: T, instrument: number, velocity: number = DEFAULT_VELOCITY): INote<T> => ({time, instrument, velocity})
