import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {ConfigService} from "./config.service";
import {DrumKitService} from "./drum-kit.service";

@Injectable({
  providedIn: 'root'
})
export class ConfigGuard implements CanActivate, CanActivateChild {

  private _checked: boolean = false
  constructor(private config: ConfigService, private drumKit:DrumKitService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean>|boolean {
    if(this._checked) return true
    return this.setupH2()
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }

  private setupH2() {
    return new Observable<boolean>(obs=>{
      let s: Subscription
      s = this.config.config.subscribe(config=>{
        if(!config)
          return
        this.drumKit.load(config.drumKits[0]).then(()=>{
          obs.next(true)
          obs.complete()
          s.unsubscribe()
        })
      }, obs.error)//pipe(map(config=>config!=null));
    })
  }

}
