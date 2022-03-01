import {Directive, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output} from '@angular/core';
import {Transport} from "tone";
import {TransportService} from "../transport.service";
import {Subscription} from "rxjs";

@Directive({
  selector: 'input[bpmRange]',
  host: {
    class: 'bpm-range',
    'min': '30',
    'max': '240',
    'type': 'range',
    'step': '1'
  }
})
export class BpmRangeDirective implements OnDestroy {
  private sub: Subscription
  private setInternal: boolean = false
  ngOnDestroy(): void {
    if(this.sub)
      this.sub.unsubscribe()
  }

  @Output()
  bpmChange: EventEmitter<number>

  @HostListener('input')
  private inputChange(event: Event) {
    this.setInternal = true
    this.transport.bpm = +this.element.value
    this.setInternal = false
  }

  private element: HTMLInputElement

  constructor(ref: ElementRef, private transport: TransportService) {
    this.element = ref.nativeElement
    this.sub = transport.bpmChange.subscribe(bpm=>{
      if(!this.setInternal)
        this.element.value = bpm.toString()
    })
    this.element.value = transport.bpm.toString()
    this.bpmChange = transport.bpmChange
  }

  ngOnInit(): void {

  }

}
