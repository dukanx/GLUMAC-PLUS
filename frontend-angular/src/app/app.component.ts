import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { StatusPorudzbineComponent } from './components/status-porudzbine/status-porudzbine.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CartDrawerComponent, StatusPorudzbineComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend-angular';
}
