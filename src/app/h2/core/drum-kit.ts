export type InstrumentGroups = { [instrument: number]: number[] }

export interface Instrument {
  id: number
  midi: number
  name: string
  layer: InstrumentLayer[]
}

export interface InstrumentLayer {
  id?: number
  basename: string
  min: number
  max: number
  gain: number
}

export type NoteQuality = 'mp3' | 'wav'

export interface IDrumKit {
  id?: number
  name: string
  qualities: NoteQuality[]
  instruments: Instrument[]
  groups: InstrumentGroups
}
