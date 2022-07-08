import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SongService} from "../../song.service";
import {first, Subscription} from "rxjs";
import {PlayerService} from "../../player.service";
import {ConfigLink, Song} from "../../core/song";
import {TransportService} from "../../transport.service";
import {Transport} from "tone";

@Component({
  selector: 'h2-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent implements OnInit, OnDestroy {

  private sub: Subscription

  progress: number = 0;
  songData: Partial<Song>
  playing: boolean = false;
  bpm: number;
  measures: number[];
  loopStart: number;
  loopEnd: number;
  beat: number = 0
  currentMeasure: number = 1

  @Input()
  set song(value: ConfigLink) {
    if (!value) return
    this.midiPath = value.url
  }

  private _midiPath: string
  public set midiPath(value: string) {
    this._midiPath = value
    this.player.midiPath = value
    this.songData = {name: value}
  }


  constructor(private cdr: ChangeDetectorRef,
              private transport: TransportService,
              private songService: SongService,
              private player: PlayerService) {
    this.sub = this.player.progress.subscribe(e => {
      if(e.kind== 'scheduled') {

        const n = this.loopEnd = this.player.numMeasure + 1
        let i: number = 0
        const measures = []
        for (i=1; i<n; i++) {
          measures.push(i)
        }
        this.progress = 0
        this.currentMeasure = 1
        this.beat = 1
        this.measures = measures
        this.loopStart = 0
        this.loopEnd = n-1
        this.bpm = Math.round(Transport.bpm.value)
        this.cdr.detectChanges()
      }
      this.currentMeasure = e.measure
      this.beat = e.beat
      this.progress = e.ratio
      this.cdr.detectChanges()

    })
  }

  private handelKeys = (event: KeyboardEvent) => {
    if (event.code == 'Space') {
      this.transport.toggle()
    }
  }
  ngOnInit(): void {
    document.body.addEventListener("keydown", this.handelKeys)
  }

  ngOnDestroy(): void {
    document.body.removeEventListener("keydown", this.handelKeys)

    this.transport.cancel()
    if (this.sub)
      this.sub.unsubscribe()
  }

  play() {
    this.player.play()
    this.playing = true
    this.cdr.detectChanges()
  }

  seek(value: string) {
    this.player.seek(+value)
  }

  stop() {
    this.player.stop()
    this.currentMeasure = 1
    this.beat = 0
    this.progress = 0
    this.playing = false
    this.cdr.detectChanges()
  }

  loopStartChange($event: Event) {
    let start = +($event.currentTarget as HTMLSelectElement).value - 1
    const end = this.loopEnd
    this.loopStart = start
    if (end < start) {
      this.loopEnd = start
    }
    this.checkLoopChange()
  }

  loopEndChange($event: Event) {
    const end = +($event.currentTarget as HTMLSelectElement).value
    const start = this.loopStart
    this.loopEnd = end
    if (start > end) {
      this.loopStart = end
    }
    this.checkLoopChange()
  }

  checkLoopChange() {
    let loopStart: number = this.loopStart
    const start = `${loopStart}:0:0`
    Transport.setLoopPoints(start, `${this.loopEnd}:0:0`)
    Transport.position = start
  }
}
