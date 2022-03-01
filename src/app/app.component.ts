import {Component} from '@angular/core';
import {getNamedRoutes, NamedRoutes} from "./app-routing.module";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  routes: NamedRoutes = getNamedRoutes()
}
