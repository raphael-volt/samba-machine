import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Song} from "./core/song";

@Injectable({
  providedIn: 'root'
})
export class SongService {

  constructor(private http: HttpClient) { }

  getSong(path: string){
    return this.http.get<Song>(`assets/h2/${path}`)
  }
}
