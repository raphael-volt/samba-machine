import {Time} from "tone";


describe('time', ()=>{
  it('should convert h2 position to B16', function () {
    let v = Time(192*4, 'i').toBarsBeatsSixteenths()
    let t = Time(192, 'i').toBarsBeatsSixteenths()
    expect('1:0:0').toEqual(v)
    expect('0:1:0').toEqual(t)
  });
})
