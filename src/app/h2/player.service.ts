import {Injectable} from '@angular/core';
import {DrumKitService} from "./drum-kit.service";
import {Time, Transport} from "tone";
import {TransportService} from "./transport.service";
import {Subject, Subscription} from "rxjs";
import {MidiSong, MidiSongService} from "./midi-song.service";

export type SongProgressKind = 'scheduled' | 'stop' | 'begin' | 'count' | 'end' | 'measure' | 'progress'
export type SongProgress = {
  kind: SongProgressKind
  measure: number,
  ratio: number,
  beat: number
}
export type BarTime = { ticks: number, bar: number }

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

  private _song: MidiSong

  private _midiPath: string
  public numMeasure: number

  get barTimes(): BarTime[] {
    return this._song.barsBeatsEvents.filter(e=>(e.beat == 0)).map(e=>({ticks: e.time.toTicks(), bar: e.bar}))
  }
  set midiPath(value: string) {
    if (value == this._midiPath) return
    this._midiPath = value;
    if (!value) return
    Transport.stop()
    Transport.cancel()
    this.currentMeasure = 0
    this.currentBeat = 0
    this._progress = 0
    this._playing = false
    this.midi.getSong(value).then(song => {
      this._song = song
      const end = song.lastBarBeatEvent
      const numMeasure = end.bar
      this.numMeasure = numMeasure
      const numTicks = end.time.toTicks()
      this.numTicks = numTicks
      this.unsubscribeSong()
      this.songSubscription = song.event.subscribe(e=>{
        this.currentMeasure = e.bar + 1
        this.currentBeat = e.beat
        this._progress = e.time.toTicks() / numTicks
        this.nextEvent('progress')
      })
      Transport.loop = true
      Transport.loopStart = 0
      Transport.loopEnd = end.time.toBarsBeatsSixteenths()

      this.transport.bpm = song.bpm
      this.transport.scheduled()
      this.nextEvent('scheduled', 0)
    })
  }

  private clickFlg = false

  constructor(private drumKit: DrumKitService, private transport: TransportService, private midi: MidiSongService) {
  }


  play(time?: any) {
    if(! this.clickFlg) {
      this.transport.handleClick().then(() => {
        this.clickFlg = true
        this.play(time)
      })
      return
    }
    this.transport.start(undefined,'0:0:0')
    this._playing = true
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
    this.currentMeasure = 0
    this.transport.stop()
    this._playing = false
    Transport.stop()
    Transport.position = '0:0:0'
    this.nextEvent('stop')

  }

  seek(ratio: number) {
    const ticks: number = Math.floor(ratio * this.numTicks)
    this._progress = ratio
    if(this._midiPath) {
      Transport.position = Time(ticks, 'i').toBarsBeatsSixteenths()
    }
  }

  private songSubscription: Subscription
  private unsubscribeSong() {
    if(this.songSubscription) {
      this.songSubscription.unsubscribe()
      this.songSubscription = null
    }
  }
  cancel() {
    this.transport.cancel()
    this.unsubscribeSong()
    this._song = null
  }

  private nextEvent(kind: SongProgressKind, ratio: number = -1) {
    ratio = ratio == -1 ? this._progress : ratio
    this.progress.next({kind, ratio: ratio, measure: this.currentMeasure, beat: this.currentBeat})
  }
}
