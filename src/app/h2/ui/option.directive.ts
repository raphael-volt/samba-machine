import {Directive, ElementRef, Input} from '@angular/core';

@Directive({
  selector: '[optionSelected]'
})
export class OptionDirective {

  private element: HTMLInputElement
  @Input()
  set optionSelected(value: boolean) {
    const e = this.element
    const k = 'selected'
    if(!value)
      e.removeAttribute(k)
    else
      e.setAttribute(k, k)
  }
  constructor(ref: ElementRef) {
    this.element = ref.nativeElement
  }

}
