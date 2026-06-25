import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from "./components/login/login.component";
import { ChatbotWidgetComponent } from './components/chatbot-widget/chatbot-widget.component';
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterModule, HomeComponent, LoginComponent, ChatbotWidgetComponent],
})
export class AppComponent {}
  

  
