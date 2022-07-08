import { TestBed } from '@angular/core/testing';

import { MidiSongService } from './midi-song.service';

describe('MidiSongService', () => {
  let service: MidiSongService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MidiSongService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
