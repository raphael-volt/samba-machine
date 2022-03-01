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
  private loopActive: boolean = false

  progress: number = 0;
  songData: Song
  startCounter: boolean = false;
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
    this.songService.getSong(value.url).pipe(first()).subscribe(
      song => {
        this.songData = song
        this.player.song = song
        const measures: number[] = []
        let i: number = 1
        for (const sequence of song.sequences) {
          measures.push(i++)
        }
        this.progress = 0
        this.currentMeasure = 1
        this.beat = 0
        this.measures = measures
        this.loopStart = 1
        this.loopEnd = i - 1
        this.cdr.detectChanges()
      }
    )
  }

  constructor(private cdr: ChangeDetectorRef,
              private transport: TransportService,
              private songService: SongService,
              private player: PlayerService) {
  }

  ngOnInit(): void {
    document.body.addEventListener("keydown", ev => {
      if (ev.code == 'Space') {
        this.transport.toggle()
      }
    })
    this.sub = this.player.progress.subscribe(e => {
      if(e.kind == 'end') {
        if(! this.loopActive) {
          this.stop()
        }
      }
      if (e.kind == "count") {
        e.ratio = (e.ratio + 1) / 4
        this.currentMeasure = 1
      }
      else
        this.currentMeasure = e.measure
      this.beat =  e.beat
      this.progress = e.ratio
      this.cdr.detectChanges()
    })
  }

  ngOnDestroy(): void {
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

  startCounterChange(event: Event) {
    const b = (event.currentTarget as HTMLInputElement).checked
    this.startCounter = b
    this.player.playCount = b
  }

  stop() {
    this.player.stop()
    this.currentMeasure = 1
    this.beat = 1
    this.progress = 0
    this.playing = false
    this.cdr.detectChanges()
  }

  loopStartChange($event: Event) {
    let start = +($event.currentTarget as HTMLSelectElement).value
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


  loopStateChange($event: Event) {
    const active = ($event.currentTarget as HTMLInputElement).checked
    this.loopActive = active
    Transport.loop = active
    this.checkLoopChange()

  }

  checkLoopChange() {
    if (this.loopActive) {
      let loopStart: number = this.loopStart
      if(loopStart == 1 && this.startCounter)
        loopStart = 0
      const start = `${loopStart}:0:0`
      Transport.setLoopPoints(start, `${this.loopEnd+1}:0:0`)
      Transport.position = start
    }
  }
}
