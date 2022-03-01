import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PlayerComponent} from './ui/player/player.component';
import {HttpClientModule} from "@angular/common/http";
import {BpmRangeDirective} from './ui/bpm-range.directive';
import {ToggleMuteInstrumentComponent} from './ui/toggle-mute-Instrument/toggle-mute-instrument.component';
import {OptionDirective} from "./ui/option.directive";
import {StepViewComponent} from './ui/step-view/step-view.component';


@NgModule({
  declarations: [
    PlayerComponent,
    BpmRangeDirective,
    ToggleMuteInstrumentComponent,
    OptionDirective,
    StepViewComponent
  ],
  exports: [
    PlayerComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ]
})
export class H2Module {
}
