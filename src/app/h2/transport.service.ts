import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject, first} from "rxjs";
import {start, Transport} from "tone";
export type TransportState = 'started'|'stopped'|'canceled'|'scheduled'

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  get currentState(): TransportState {
    return this._currentState;
  }

  bpmChange: EventEmitter<number> = new EventEmitter<number>()
  state: EventEmitter<TransportState> = new EventEmitter<TransportState>()
  private _currentState: TransportState = 'stopped'
  private _bpm: number
  get bpm(): number {
    return this._bpm;
  }

  set bpm(value: number) {
    this._bpm = value;
    Transport.bpm.value = value
    this.bpmChange.next(value)
  }

  ready: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  private _ready: boolean= false
  private _startFlag: boolean= false
  private set nextReady(value:boolean) {
    if(value != this._ready) {
      this._ready = value
      this.ready.next(value)
    }
  }

  constructor() {
    this._bpm = Transport.bpm.value
  }

  start(time?: any, position?: any) {
    Transport.start(time)
    if(position)
      Transport.position = position
    this.setState('started')
  }

  stop(time?: any) {
    Transport.stop(time)
    this.setState('stopped')
  }

  cancel(stop: boolean = true) {
    Transport.cancel()
    this.setState('canceled')
    if(stop)
      this.stop()
  }

  scheduled() {
    this.setState('scheduled')
  }

  toggle() {
    Transport.toggle()
    const started  = Transport.state == 'started'
    this.setState(started ? 'started':'stopped')
  }
  handleClick(){
    return new Promise<void>(resolve => {
      if(this._ready)return resolve()
      if(this._startFlag) {
        this.ready.pipe(first()).subscribe(ready=>resolve())
        return
      }
      this._startFlag = true
      start().then(()=>{
        this._startFlag = false
        this.nextReady = true
        resolve()
        this.start(undefined, '0:0:0')
      })
    })
  }

  private setState(value: TransportState) {
    this._currentState = value
    this.state.next(value)
  }
}
