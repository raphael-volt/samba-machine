export type InstrumentGroups = { [instrument: number]: number[] }

export interface Instrument {
  id: number
  name: string
  layer: InstrumentLayer[]
}

export interface InstrumentLayer {
  basename: string
  min: number
  max: number
  gain: number
}

export type NoteQuality = 'mp3' | 'wav'

export interface DrumKit {
  name: string
  qualities: NoteQuality[]
  instruments: Instrument[]
  groups: InstrumentGroups
}
