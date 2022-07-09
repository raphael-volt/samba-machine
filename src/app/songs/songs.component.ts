import {ChangeDetectorRef, Component} from '@angular/core';
import {ConfigService} from "../h2/config.service";
import {ConfigLink} from "../h2/core/song";

@Component({
  selector: 'songs',
  templateUrl: './songs.component.html',
  styleUrls: ['./songs.component.scss']
})
export class SongsComponent {
  song: ConfigLink

  songs: ConfigLink[]
  constructor(config: ConfigService, private cdr: ChangeDetectorRef) {
    this.songs = config.config.getValue().songs

  }

  songChanged(event: Event) {
    const i = +(event.currentTarget as HTMLSelectElement).value
    this.song = i >= 0 ?this.songs[i]:undefined
  }
}
