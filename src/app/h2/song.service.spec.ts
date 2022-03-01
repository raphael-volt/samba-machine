import { TestBed } from '@angular/core/testing';

import { SongService } from './song.service';
import {HttpClientModule} from "@angular/common/http";

describe('SongService', () => {
  let service: SongService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule]
    });
    service = TestBed.inject(SongService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
