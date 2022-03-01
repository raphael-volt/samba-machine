import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {first} from "rxjs";
import {Gain, Player, Players, PlayersOptions, TimeClass} from "tone";
import {INote} from "./core/note";
import {NoteCallback} from "./core/song-loop";
import {DrumKit, Instrument, InstrumentLayer, NoteQuality} from "./core/drum-kit";
import {ConfigLink} from "./core/song";

type InstrumentMap = { [id: number]: Instrument }
const playerName = (id: number, layer: InstrumentLayer) => `${id}-${layer.min}`
const DECIBEL_VALUE: number = 12
const noteVolume = (velocity: number) => DECIBEL_VALUE * (velocity - 1)

@Injectable({
  providedIn: 'root'
})
export class DrumKitService {
  get drumKit(): DrumKit {
    return this._drumKit;
  }

  get loaded(): boolean {
    return this._loaded;
  }

  private instrumentMap: InstrumentMap

  private players: Players
  private gainMap: { [playerId: string]: Gain } = {}
  private destinationFlag: boolean = true

  constructor(private http: HttpClient) {
  }

  private _loaded: boolean

  load(value: ConfigLink) {
    return new Promise<void>((resolve, reject) => {
      this.getDrumkit(value.url).pipe(first())
        .subscribe(
          drumKit => {
            this.setup(drumKit, value).then(() => {
              const instMap = this.instrumentMap
              const gainMap = this.gainMap
              for (const id in instMap) {
                for (const layer of instMap[id].layer) {
                  const name = playerName(+id, layer)
                  const g = new Gain().toDestination()
                  const p = this.players.player(name)
                  g.gain.value = layer.gain
                  p.connect(g)
                  gainMap[name] = g
                }
              }
              this._loaded = true
              resolve()
            }).catch(reject)
          }), reject
    })
  }

  private getDrumkit(url: string) {
    return this.http.get<DrumKit>(`assets/h2/${url}`)
  }

  private _drumKit: DrumKit

  private setup(kit: DrumKit, link: ConfigLink, quality: NoteQuality = 'mp3') {
    this._drumKit = kit
    return new Promise<void>((resolve, reject) => {
      const map: InstrumentMap = {}
      const parts = link.url.split("/")
      parts.pop()
      const baseUrl: string = `assets/h2/${parts.join("/")}/${quality}/`
      const playersOptions: Partial<PlayersOptions> = {
        urls: {},
        baseUrl,
        onload: resolve
      }
      this.instrumentMap = map
      for (const instrument of kit.instruments) {
        const id = instrument.id
        map[id] = instrument

        for (const layer of instrument.layer) {
          if (layer.max >= 1)
            layer.max = 1.1
          playersOptions.urls[playerName(id, layer)] = `${layer.basename}.${quality}`
        }
      }
      this.players = new Players(playersOptions)
    })
  }

  start: NoteCallback<TimeClass> = (time: any, note: INote<TimeClass>) => {
    if (this.destinationFlag) {
      this.destinationFlag = false
      this.players.toDestination()
    }
    const id = note.instrument
    const v = note.velocity
    try {
      const layer = this.instrumentMap[id].layer.find(l => l.min <= v && v < l.max)
      const name = playerName(id, layer)
      const player = this.players.player(name)
      if (player.mute)
        return
      player.volume.value = noteVolume(note.velocity)
      player.start(time)//.stop('+4n')
    }
    catch (e) {
      console.log(note)
    }

  }

  private getInstrumentPlayers(id: number) {
    const result: Player[] = []
    let instrument = this.instrumentMap[id]
    const players = this.players
    const groups = this._drumKit.groups
    const map = this.instrumentMap
    const l = [instrument]
    if (id in groups)
      l.push(...groups[id].map(i => map[i]))

    for (instrument of l)
      for (const layer of instrument.layer)
        result.push(players.player(playerName(instrument.id, layer)))

    return result
  }

  setMuted(id: number, muted: boolean) {
    const players = this.getInstrumentPlayers(id)
    for (const player of players) {
      player.mute = muted
    }
  }

  muteAll(mute: boolean, ...skipped: number[]) {

    for (const id in this.instrumentMap) {
      const i = +id
      if (skipped.indexOf(i) != -1)
        continue
      this.setMuted(i, mute)
    }
  }

  get instrumentsList() {
    const dk = this._drumKit
    const groups = dk.groups
    const grouped: number[] = []
    for (const id in groups) {
      for (const i of groups[id]) {
        if (grouped.indexOf(i) == -1)
          grouped.push(i)
      }
    }
    const result: { [id: number]: number[] } = {}
    for (const instrument of dk.instruments) {
      const id = instrument.id
      if (grouped.indexOf(id) != -1)
        continue
      result[instrument.id] = (id in groups) ? groups[id] : []
    }
    return result
  }

  getInstrument = (id: number) => this._drumKit.instruments.find(i => i.id == id)


}
