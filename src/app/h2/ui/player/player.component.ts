import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SongService} from "../../song.service";
import {first, Subscription} from "rxjs";
import {BarTime, PlayerService} from "../../player.service";
import {ConfigLink, Song} from "../../core/song";
import {TransportService} from "../../transport.service";
import {Time, Transport} from "tone";

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
  measures: BarTime[];
  loopStart: BarTime;
  loopEnd: BarTime;
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
      if (e.kind == 'scheduled') {
        const bars = this.player.barTimes
        this.barTimes = bars
        const lastBar = bars[bars.length - 1]
        this.loopEnd = lastBar
        this.loopStart = bars[0]

        this.progress = 0
        this.currentMeasure = 1
        this.beat = 1
        this.measures = bars

        this.bpm = Math.round(Transport.bpm.value)
        this.cdr.detectChanges()
      }
      this.currentMeasure = e.measure
      this.beat = e.beat
      this.progress = e.ratio
      this.cdr.detectChanges()

    })
  }

  private barTimes: BarTime[]

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
    let start = +($event.currentTarget as HTMLSelectElement).value
    this.loopStart = this.getBarTime(start)
    const end = this.loopEnd
    if (end.bar < start) {
      this.loopEnd = this.loopStart
    }
    this.checkLoopChange()
  }

  private getBarTime = (bar: number) => this.barTimes.find(b => b.bar == bar)

  loopEndChange($event: Event) {
    const end = +($event.currentTarget as HTMLSelectElement).value
    const start = this.loopStart
    this.loopEnd = this.getBarTime(end)
    if (start.bar > end) {
      this.loopStart = this.loopEnd
    }
    this.checkLoopChange()
  }

  checkLoopChange() {
    console.log(this.loopStart, this.loopEnd)
    let loopStart: BarTime = this.loopStart
    let loopEnd: BarTime = this.loopEnd
    let endBar: number = loopEnd.bar + 1
    let next : BarTime = this.getBarTime(endBar)
    if (!next) {
      next = { bar: endBar, ticks: loopEnd.ticks + 192*4 }
    }
    const start = Time(loopStart.ticks, 'i').toBarsBeatsSixteenths()
    Transport.setLoopPoints(start, Time(next.ticks, 'i').toBarsBeatsSixteenths())
    Transport.position = start
  }
}
