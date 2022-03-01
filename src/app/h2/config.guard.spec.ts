import {TestBed, waitForAsync} from '@angular/core/testing';

import {ConfigGuard} from './config.guard';
import {HttpClientModule} from "@angular/common/http";
import {DrumKitService} from "./drum-kit.service";
import {ConfigService} from "./config.service";

describe('ConfigGuard', () => {
  let guard: ConfigGuard;
  let dm: DrumKitService
  let cfg: ConfigService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    guard = TestBed.inject(ConfigGuard);
    dm = TestBed.inject(DrumKitService);
    cfg = TestBed.inject(ConfigService);

  });

  it('should activate',waitForAsync(()=>{
    const canActivate = guard.canActivate(null, null)

    const done = (activated: boolean) => {
      expect(activated).toBeTrue()
      const c = cfg.config.getValue()
      expect(c).toBeTruthy()
      expect(c.songs).toBeDefined()
      expect(c.songs.length).toBeGreaterThan(0)
      expect(dm.loaded).toBeTrue()

    }
    if(typeof canActivate == 'boolean') {
      done(canActivate)
      return
    }
    canActivate.subscribe(done)
  }))

});
