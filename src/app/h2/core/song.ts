export interface ConfigLink {
  name: string
  url: string
}

export interface Config {
  songs: ConfigLink[]
  drumKits: ConfigLink[]
}

export interface Song {
  author: string
  bpm: number,
  name: string
}
