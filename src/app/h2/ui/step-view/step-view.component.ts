import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Loop, Time, Transport} from "tone";
import {TransportService, TransportState} from "../../transport.service";
import {Subscription} from "rxjs";
import {PlayerService} from "../../player.service";

@Component({
  selector: 'step-view',
  templateUrl: './step-view.component.html',
  styleUrls: ['./step-view.component.scss']
})
export class StepViewComponent implements AfterViewInit, OnDestroy {

  @ViewChild('left')
  leftRef: ElementRef<SVGElement>
  @ViewChild('right')
  rightRef: ElementRef<SVGElement>

  private subs: Subscription[] = []

  private set sub(val: Subscription) {
    this.subs.push(val)
  }

  constructor(private transport: TransportService, private player: PlayerService) {
  }

  private transportStateChange = (state: TransportState) => {
    switch (state) {
      case "scheduled":
        return this.createLoop()
      case "canceled":
        return this.updatePosition(-1)
    }
  }

  ngOnDestroy(): void {
    for (const sub of this.subs)
      sub.unsubscribe()
  }

  private updateTransition() {
    const d = Time(4, 'n').toMilliseconds() + 'ms'
    for (const s of [this.rightRef.nativeElement.style, this.leftRef.nativeElement.style])
      s.transitionDuration = d
  }

  private highlight(elementRef: ElementRef) {
    const cl: DOMTokenList = elementRef.nativeElement.classList
    cl.add('on')
    setTimeout(() => cl.remove('on'), Time(16, 'n').toMilliseconds())
  }

  private updatePosition(index: number) {
    const r = this.rightRef.nativeElement.style
    const l = this.leftRef.nativeElement.style
    switch (index) {
      case 3: {
        // X--X
        this.highlight(this.rightRef)
        r.left = '75%'
        l.left = '0%'
        break
      }
      case 0: {
        // --XX
        this.highlight(this.rightRef)
        r.left = '75%'
        l.left = '50%'
        break
      }
      case 1: {
        // X--X
        this.highlight(this.leftRef)
        r.left = '75%'
        l.left = '0%'
        break
      }
      case 2: {
        // XX--
        this.highlight(this.leftRef)
        r.left = '25%'
        l.left = '0%'
        break
      }
      case -1 : {
        r.left = '75%'
        l.left = '0%'
        break
      }
    }
  }

  ngAfterViewInit(): void {
    const transport = this.transport

    this.updateTransition()

    this.sub = transport.bpmChange.subscribe(bpm => {
      this.updateTransition()
    })

    this.sub = this.player.progress.subscribe(e => {
      if (e.kind == 'end' || e.kind == 'stop') {
        this.updatePosition(-1)
      }
    })

    this.sub = transport.state.subscribe(this.transportStateChange)

    this.updatePosition(-1)
    this.createLoop()
  }

  private createLoop() {
    new Loop(t => {
      const beat = +Transport.position.toString().split(':')[1]
      this.updatePosition(beat)
    }, '4n').start()
  }
}
