import {Component} from '@angular/core';
import {DrumKitService} from "../../drum-kit.service";
import {sortResult} from "../../core/array-utils";

type InstrumentsMute = {
  name: string
  muted: boolean
  solo: boolean
  instruments: number[]
}
type InstrumentsMuteList = InstrumentsMute[]

@Component({
  selector: 'toggle-mute-instrument',
  templateUrl: './toggle-mute-instrument.component.html',
  styleUrls: ['./toggle-mute-instrument.component.scss']
})
export class ToggleMuteInstrumentComponent {

  private activatedOnSolo: InstrumentsMute[] = []

  instruments: InstrumentsMuteList

  constructor(private dks: DrumKitService) {
    this.init(dks)
  }

  private init(dks: DrumKitService) {
    const instruments: InstrumentsMuteList = []
    const muted: boolean = false
    const solo: boolean = false
    const list = dks.instrumentsList

    for (const id in list) {
      const instrument = dks.midiToInstrument(+id)
      instruments.push({name: instrument.name, instruments: [+id, ...list[id]], muted, solo})
    }

    instruments.sort((a, b) => sortResult(a.instruments[0], b.instruments[0]))
    this.instruments = instruments
  }


  setMuted(instrument: InstrumentsMute) {
    this.activatedOnSolo = []
    const muted = !instrument.muted
    instrument.muted = muted
    this.checkSolo()
    this.dks.setMuted(instrument.instruments[0], muted)
  }


  private checkSolo() {
    const inSolo = this.instruments.find(i => i.solo)
    if (inSolo)
      inSolo.solo = false
  }

  setSolo(instrument: InstrumentsMute) {

    const dks = this.dks
    const solo: boolean = !instrument.solo
    if (solo) {
      this.checkSolo()
    }
    instrument.solo = solo
    const midi = instrument.instruments[0]
    const instruments = this.instruments
    if (solo) {

      this.activatedOnSolo = instruments.filter(i => !i.muted)
      dks.muteAll(true, ...instrument.instruments)
      for (const i of this.instruments) {
        if (i == instrument)
          continue
        i.muted = true
      }
      if (instrument.muted) {
        instrument.muted = false
        dks.setMuted(midi, false)
      }
    } else {
      for (instrument of this.activatedOnSolo) {
        instrument.muted = false
        dks.setMuted(instrument.instruments[0], false)
      }
    }
  }

  muteAllChanged(muted: boolean) {
    this.checkSolo()
    this.dks.muteAll(muted)
    for (const instrument of this.instruments) {
      instrument.muted = muted
    }
  }
}
