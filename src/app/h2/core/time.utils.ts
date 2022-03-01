import {Time, TimeClass} from "tone";

const T16 = 48

export enum TickValues {
  BAR = T16 * 16,
  BEAT = T16 * 4,
  SIXTEENTH = T16
}

export const toTicks = (ticks: number): TimeClass => Time(ticks, 'i')
