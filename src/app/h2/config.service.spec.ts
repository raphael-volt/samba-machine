import {async, TestBed, waitForAsync} from '@angular/core/testing';

import { ConfigService } from './config.service';
import {HttpClientModule} from "@angular/common/http";
import {first, Subscription} from "rxjs";
import {SongService} from "./song.service";
import {Config} from "./core/song";

describe('ConfigService', () => {
  let configService: ConfigService;
  let songService:SongService
  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    configService = TestBed.inject(ConfigService);
    songService = TestBed.inject(SongService)
  });

  it('should get config', waitForAsync(()=>{
    expect(configService).toBeTruthy();
    let config = configService.config.getValue()
    let s: Subscription
    const done = (cfg: Config) => {
      if(!cfg)return
      if(s)
        s.unsubscribe()
      expect(cfg.songs.length).toBeGreaterThan(0)
      expect(cfg.drumKits.length).toBeGreaterThan(0)
    }
    if(config != null) {
      done(config)
      return
    }
    s = configService.config.subscribe(done)
  }))
  it('should get song', waitForAsync(()=>{
    configService.config.subscribe(config=>{
      if(!config)return
      songService.getSong(config.songs[0].url).pipe(first()).subscribe(
        song=>{
          expect(song).toBeTruthy()
          expect(song.name).toEqual('Ainja')
        }
      )
    })

  }))
});
