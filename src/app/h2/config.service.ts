import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, first} from "rxjs";
import {Config} from "./core/song";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public config: BehaviorSubject<Config> = new BehaviorSubject<Config>(null)

  constructor(private http: HttpClient) {
    http.get<Config>('assets/h2/config.json').pipe(first()).subscribe(config => this.config.next(config))
  }
}
