import { TestBed } from '@angular/core/testing';

import { DrumKitService } from './drum-kit.service';
import {HttpClientModule} from "@angular/common/http";

describe('DrumKitService', () => {
  let service: DrumKitService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(DrumKitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
