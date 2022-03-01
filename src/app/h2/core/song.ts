import {INote} from './note'
import {Instrument} from './drum-kit'

export interface ConfigLink {
  name: string
  url: string
}

export interface Config {
  songs: ConfigLink[]
  drumKits: ConfigLink[]
}

export interface Pattern {
  size: number
  name: string
  notes: INote<number>[]
}

export type Sequences = string[][]

export interface Song {
  author: string
  bpm: number,
  instruments: Instrument[]
  name: string
  patterns: Pattern[]
  sequences: Sequences
}
