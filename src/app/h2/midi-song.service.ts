import {Injectable} from '@angular/core';
import {DrumKitService} from "./drum-kit.service";
import {Midi} from "@tonejs/midi";
import {Part, Time, TimeClass, Transport} from "tone";
import {Subject} from "rxjs";

const BEAT_TICKS: number = 192
const BAR_TICKS: number = BEAT_TICKS * 4

export type Signature = [number, number]
export type Note = {
  instrument: number
  time: number
  velocity: number
  durationTicks: number
}
type BarsBeatsEvent = { time: TimeClass, bar: number, beat: number }
type BarsBeatsEvents = BarsBeatsEvent[]

export type PlayerNote = { time: TimeClass, player: number, volume: number }

export const getBarsBeatsSixteenths = (value: string): number[] => value.split(':').map(s => +s)
export const ticksToBBS = (ticks: number): number[] => getBarsBeatsSixteenths(Time(ticks, 'i').toBarsBeatsSixteenths())

const getBears = (ticks: number): number => ticksToBBS(ticks)[0]

export class MidiSong {

  private _event: Subject<BarsBeatsEvent> = new Subject<BarsBeatsEvent>()
  get event(): Subject<BarsBeatsEvent> {
    return this._event;
  }

  get lastBarBeatEvent(): BarsBeatsEvent {
    const l = this._barsBeatsEvents
    return l[l.length - 1]
  }

  private _barsBeatsEvents: BarsBeatsEvents
  get barsBeatsEvents(): BarsBeatsEvents {
    return this._barsBeatsEvents;
  }

  private _signature: Signature = [4, 4]
  get signature(): Signature {
    return this._signature.slice() as Signature
  }

  private _length: number
  get length(): number {
    return this._length;
  }

  private _barTicks: number[] = [0]

  private _bpm: number
  get bpm(): number {
    return this._bpm;
  }


  constructor(midi: Midi, private dk: DrumKitService) {
    this.init(midi, dk)
  }

  private addBeatMarker(ticks: number) {
    const bars = this._barTicks
    const n: number = bars.length
    let t: number = bars[n - 1]
    if (ticks <= t)
      return
    while (t + BAR_TICKS < ticks) {
      t += BAR_TICKS
      bars.push(t)
    }
    bars.push(ticks)
  }

  private createBBEvents(): BarsBeatsEvent[] {
    const events: BarsBeatsEvent[] = []
    let beat: number = 0
    let bar: number = 0
    let time: number = 0
    let barEnd: number

    const bars = this._barTicks
    const n = bars.length
    for (let i = 0; i < n; i++) {
      time = bars[i]
      if (i == n - 1)
        barEnd = time + BAR_TICKS
      else
        barEnd = bars[i + 1]
      beat = 0
      for (time = bars[i]; time < barEnd; time += BEAT_TICKS) {
        events.push({time: Time(time, 'i'), bar, beat})
        beat++
      }
      bar++
    }
    this._barsBeatsEvents = events
    return events
  }

  private init(midi: Midi, dk: DrumKitService) {
    const header = midi.header
    Transport.bpm.value = this._bpm = header.tempos[0].bpm
    let o = header.timeSignatures[0].timeSignature
    this._signature = [o[0], o[1]]
    this._length = getBears(midi.durationTicks) + 1
    Transport.timeSignature = this._signature
    let notes: PlayerNote[]
    const DECIBEL_VALUE = 12
    const bm = dk.beatMarker

    for (const t of midi.tracks) {
      notes = []
      for (const note of t.notes) {
        const midi = note.midi
        if (midi == bm.midi) {
          this.addBeatMarker(note.ticks)
          continue
        }
        const ins = dk.midiToInstrument(midi)
        const v = note.velocity
        const player = ins.layer.find(l => l.min <= v && v < l.max).id

        notes.push({
          time: Time(note.ticks, 'i'),
          player,
          volume: DECIBEL_VALUE * (note.velocity - 1)
        })
      }
      if (!notes.length)
        return

      const lastTicks = notes[notes.length - 1].time.toTicks()
      this.addBeatMarker(lastTicks)
      new Part((t: any, e: BarsBeatsEvent) => {
        this._event.next(e)
      }, this.createBBEvents()).start()//25728 25776
      new Part(this.dk.start, notes).start()

    }
  }


}

@Injectable({
  providedIn: 'root'
})
export class MidiSongService {

  constructor(private dk: DrumKitService) {
  }

  getSong(path: string): Promise<MidiSong> {
    return new Promise((res, rej) => {
      Midi.fromUrl(`assets/h2/${path}`).then((midi => {
        res(new MidiSong(midi, this.dk))
      })).catch(rej)
    })
  }
}
