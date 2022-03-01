import {Pattern, Song} from "./song";
import {Part, Time, TimeClass} from "tone";
import {getNote, INote, NoteTime} from "./note";
import {TickValues, toTicks} from "./time.utils";

export type NoteCallback<T extends NoteTime> = (time: any, event: INote<T>) => void
type TickNote = INote<TimeClass>
type TickNotes = TickNote[]

export const createCounterPart = (callback: NoteCallback<TimeClass>, instrument: number = 26) => {
  const events: TickNotes = []
  const d: number = TickValues.BEAT
  const n: number = TickValues.BAR

  for (let i = 0; i < n; i += d)
    events.push(getNote(toTicks(i), instrument))

  new Part<TickNote>(callback, events)
    .start(Time(0, 'i').toBarsBeatsSixteenths())
    .stop(Time(n, 'i').toBarsBeatsSixteenths())
}

export const createPart = (pattern: Pattern, callback: NoteCallback<TimeClass>, start: number) => {
  const part = new Part<TickNote>(
    callback,
    pattern.notes
      .map(n => getNote(toTicks(n.time), n.instrument, n.velocity))
  )

  return part
    .start(Time(start, 'i').toBarsBeatsSixteenths())
    .stop(Time(start + pattern.size, 'i').toBarsBeatsSixteenths())
}

export const createSongParts = (callback: NoteCallback<TimeClass>, song: Song, t: number = 0) => {
  const partMap: { [name: string]: Pattern } = {}
  const patterns = song.patterns
  for (const pattern of patterns)
    partMap[pattern.name] = pattern
  const i = TickValues.BAR
  for (const sequences of song.sequences) {
    for (const name of sequences)
      createPart(partMap[name], callback, t)
    t += i
  }
}
