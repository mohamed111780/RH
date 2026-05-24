import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from "./components/login/login.component";
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule, HomeComponent, LoginComponent],
})
export class AppComponent {}
  

  