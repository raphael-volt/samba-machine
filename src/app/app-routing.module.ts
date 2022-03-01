import {NgModule} from '@angular/core';
import {Route, RouterModule, Routes} from '@angular/router';
import {ConfigGuard} from "./h2/config.guard";
import {H2Module} from "./h2/h2.module";
import {HomeComponent} from "./home/home.component";
import {SongsComponent} from "./songs/songs.component";
export type NamedRoute = Route & {name?: string}
export type NamedRoutes = NamedRoute[]
export const routes: NamedRoutes = [
  {
    path:'',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    name: 'Home',
    path:'home', component: HomeComponent
  },
  {
    name: 'Morceaux',
    path:'songs', component: SongsComponent, canActivate: [ConfigGuard]
  }
];
export const getNamedRoutes = () => routes.filter(r=>r.name != undefined)
@NgModule({
  imports: [RouterModule.forRoot(routes), H2Module],
  exports: [RouterModule]
})
export class AppRoutingModule { }
