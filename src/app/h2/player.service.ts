import {Injectable} from '@angular/core';
import {DrumKitService} from "./drum-kit.service";
import {Loop, Time, Transport} from "tone";
import {TransportService} from "./transport.service";
import {Subject} from "rxjs";
import {createCounterPart, createSongParts} from "./core/song-loop";
import {Song} from "./core/song";
import {TickValues, toTicks} from "./core/time.utils";

export type SongProgressKind = 'scheduled' | 'stop' | 'begin' | 'count' | 'end' | 'measure' | 'progress'
export type SongProgress = {
  kind: SongProgressKind
  measure: number,
  ratio: number,
  beat: number
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private _loop: boolean = false

  get loop(): boolean {
    return this._loop;
  }

  set loop(value: boolean) {
    this._loop = value;
    Transport.loop = value
    if (value)
      Transport.loopStart = this.startPosition
  }

  private _playCount: boolean = false

  set playCount(value: boolean) {
    this._playCount = value
  }

  get playCount(): boolean {
    return this._playCount
  }

  progress: Subject<SongProgress> = new Subject()
  private currentMeasure: number = 0
  private currentBeat: number = 0;
  private _progress: number = 0
  private numTicks: number = 0
  private _playing = false

  private get startPosition() {
    return `${this._playCount ? 0 : 1}:0:0`
  }

  private _song: Song
  set song(song: Song) {
    if (this._song) {
      this.transport.cancel()
    }
    this.initSong(song)
  }


  constructor(private drumKit: DrumKitService, private transport: TransportService) {
  }

  play(time?: any) {
    this.transport.handleClick().then(() => {
      this.transport.start(undefined, this.startPosition)
      this._playing = true
    })
  }

  pause() {
    Transport.pause()
    this._playing = false
  }

  resume() {
    this.transport.start()
    this._playing = true
  }


  stop() {
    this._progress = 0
    this.currentBeat = 1
    this.currentMeasure = 1
    this.transport.stop()
    this._playing = false
    this.nextEvent('stop')
  }

  seek(ratio: number) {
    const ticks: number = Math.floor(ratio * this.numTicks)
    this._progress = ratio
    Transport.position = toTicks(ticks + TickValues.BAR).toBarsBeatsSixteenths()
  }

  cancel() {
    this.transport.cancel()
    this._song = null
  }

  private startParts() {
    if (Transport.state != 'started') {
      this.transport.start(0, 0)
    }
  }

  private initSong(song: Song) {
    this._song = song
    this.transport.bpm = song.bpm
    this._progress = 0
    this.currentMeasure = 0
    const numSequences = song.sequences.length
    const numBars = numSequences + 1
    const end = toTicks(TickValues.BAR * numBars).toBarsBeatsSixteenths()
    this.numTicks = numSequences * TickValues.BAR

    createCounterPart((time, event) => {
      this.nextEvent('count', event.time.toTicks() / TickValues.BEAT)
      this.drumKit.start(time, event)
    })
    createSongParts(this.drumKit.start, song, TickValues.BAR)

    new Loop(time => {
      const tp = Time(Transport.position)
      const bb16 = tp.toBarsBeatsSixteenths().split(':').map(v => +v)
      const cm = bb16[0]
      if (bb16[0] != this.currentMeasure)
        this.currentMeasure = bb16[0]
      if (bb16[1] != this.currentBeat)
        this.currentBeat = bb16[1]

      this._progress = (tp.toTicks() - TickValues.BAR) / this.numTicks
      this.nextEvent('progress')
      if (cm == numBars) {
        this.stop()
        this.nextEvent('end')
      }
    }, '16n').start(toTicks(TickValues.BAR).toBarsBeatsSixteenths())
      .stop(toTicks(TickValues.BAR * numBars + TickValues.SIXTEENTH).toBarsBeatsSixteenths())
    Transport.loopEnd = end
    this.transport.scheduled()
  }

  private nextEvent(kind: SongProgressKind, ratio: number = -1) {
    ratio = ratio == -1 ? this._progress : ratio
    this.progress.next({kind, ratio: ratio, measure: this.currentMeasure, beat: this.currentBeat})
  }
}
