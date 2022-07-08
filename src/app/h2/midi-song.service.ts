import {Injectable} from '@angular/core';
import {DrumKitService} from "./drum-kit.service";
import {Midi} from "@tonejs/midi";
import {Part, Time, TimeClass, Transport} from "tone";

export type Note = {
  instrument: number
  time: TimeClass
  velocity: number
  durationTicks: number
}

export const getBarsBeatsSixteenths = (value: string): number[] => value.split(':').map(s => +s)
export const ticksToBBS = (ticks: number): number[] => getBarsBeatsSixteenths(Time(ticks, 'i').toBarsBeatsSixteenths())

const getBears = (ticks: number): number => ticksToBBS(ticks)[0]

export class MidiSong {

  private _bpm: number
  get bpm(): number {
    return this._bpm;
  }

  signature: [number, number] = [4, 4]
  length: number

  constructor(midi: Midi, dk: DrumKitService) {
    const header = midi.header
    Transport.bpm.value = this._bpm = header.tempos[0].bpm
    let o = header.timeSignatures[0].timeSignature
    this.signature = [o[0], o[1]]
    this.length = getBears(midi.durationTicks) + 1
    Transport.timeSignature = this.signature
    let notes: { time: any, player: number, volume: number }[]
    const DECIBEL_VALUE = 12
    for (const t of midi.tracks) {
      notes = []
      for (const note of t.notes) {
        const ins = dk.midiToInstrument(note.midi)
        const v = note.velocity
        const player = ins.layer.find(l => l.min <= v && v < l.max).id

        notes.push({
          time: Time(note.ticks, 'i'),
          player,
          volume: DECIBEL_VALUE * (note.velocity - 1)
        })
      }
      new Part(dk.start, notes).start()
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
