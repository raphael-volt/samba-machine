import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {first} from "rxjs";
import {Gain, Player, Players, PlayersOptions} from "tone";
import {IDrumKit, Instrument, InstrumentGroups, InstrumentLayer, NoteQuality} from "./core/drum-kit";
import {ConfigLink} from "./core/song";

type InstrumentMap = { [id: number]: Instrument }

@Injectable({
  providedIn: 'root'
})
export class DrumKitService {

  private instrumentMap: InstrumentMap
  private players: Players
  private destinationFlag: boolean = true
  private _drumKit: IDrumKit

  private _loaded: boolean
  get loaded(): boolean {
    return this._loaded;
  }

  get instrumentsList() {
    const result: { [id: number]: number[] } = {}
    const dk = this._drumKit
    const groups = dk.groups
    let grouped: number[] = []

    for (const midi in groups) {
      for (const i of groups[midi]) {
        if (grouped.indexOf(i) == -1) {
          grouped.push(i)
        }
      }
    }
    for (const instrument of dk.instruments) {
      const midi = instrument.midi
      if (grouped.indexOf(midi) != -1)
        continue
      result[midi] = (midi in groups) ? groups[midi] : []
    }
    return result
  }

  private _beatMarker: Instrument
  get beatMarker(): Instrument {
    return this._beatMarker;
  }

  constructor(private http: HttpClient) {
  }

  midiToInstrument = (midi: number) => this.instrumentMap[midi]

  load(value: ConfigLink) {
    return new Promise<void>((resolve, reject) => {
      this.getDrumkit(value.url).pipe(first())
        .subscribe(
          drumKit => {
            let id = 0
            const instruments = drumKit.instruments
            for (const instrument of instruments) {
              if(instrument.name == "beatMarker") {
                this._beatMarker = instrument
              }
              for (const layer of instrument.layer) {
                layer.id = id++
              }
            }
            if(! this._beatMarker) {
              return reject('Beat marker instrument not found')
            }
            const i = instruments.indexOf(this._beatMarker)
            instruments.splice(i, 1)
            this.setup(drumKit, value).then(() => {
              const instMap = this.instrumentMap
              for (const midi in instMap) {
                for (const layer of instMap[midi].layer) {
                  const player = this.players.player(layer.id.toString())
                  const g = new Gain().toDestination()
                  g.gain.value = layer.gain
                  player.connect(g)
                }
              }
              this._loaded = true
              resolve()
            }).catch(reject)
          }), reject
    })
  }

  start = (time: any, note: any) => {
    if (this.destinationFlag) {
      this.destinationFlag = false
      this.players.toDestination()
    }
    const player = this.getPlayer(note.player)
    if (!player || player.mute) return
    player.volume.value = note.volume
    player.start(time)
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

  private getDrumkit(url: string) {
    return this.http.get<IDrumKit>(`assets/h2/${url}`)
  }


  private setup(kit: IDrumKit, link: ConfigLink, quality: NoteQuality = 'mp3') {

    const g = kit.groups
    let instrument: Instrument
    const groups: InstrumentGroups = {}
    const i2m: { [i: number]: number } = {}
    for (instrument of kit.instruments) {
      const midi = instrument.midi
      const id = instrument.id
      i2m[id] = midi
    }
    for (const id in g) {
      groups[i2m[id]] = g[id].map(i => i2m[i])
    }
    kit.groups = groups
    this._drumKit = kit
    return new Promise<void>((resolve, reject) => {
      const map: InstrumentMap = {}
      this.instrumentMap = map
      const parts = link.url.split("/")
      parts.pop()
      const baseUrl: string = `assets/h2/${parts.join("/")}/${quality}/`
      let players: Players
      const playersOptions: Partial<PlayersOptions> = {
        urls: {},
        baseUrl,
        onload: resolve
      }

      for (instrument of kit.instruments) {
        const midi = instrument.midi
        map[midi] = instrument
        for (const layer of instrument.layer) {
          if (layer.max >= 1)
            layer.max = 1.1
          playersOptions.urls[layer.id] = `${layer.basename}.${quality}`
        }
      }

      players = new Players(playersOptions)

      this.players = players
    })
  }

  private getPlayer(id: string | number): Player {
    if (typeof id != 'string')
      id = id.toString()
    return this.players.player(id)
  }

  private getInstrumentPlayers(midi: number) {
    const result: Player[] = []
    const g = this._drumKit.groups
    let l = [midi]
    if (midi in g) {
      l.push(...g[midi])
    }
    for (const m of l) {
      for (const layer of this.instrumentMap[m].layer) {
        result.push(this.getPlayer(layer.id))
      }
    }
    return result
  }
}
