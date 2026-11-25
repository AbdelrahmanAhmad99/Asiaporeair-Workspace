import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

// Components Integration
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

// Services
import { AuthStateService } from '../../../core/auth/auth-state.service';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
@Component({
  selector: 'app-main-customer-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Essential for <router-outlet>
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    TranslateModule
  ],
  templateUrl: './main-customer-layout.component.html',
  styleUrls: ['./main-customer-layout.component.scss']
})
export class MainCustomerLayoutComponent {

  // Inject Auth Service to manage global layout state based on user role
  private authService = inject(AuthStateService);

  // Expose the Signal to be used in the template (e.g. passing to Navbar)
  isLoggedIn = this.authService.isAuthenticated;

  constructor() {

  }
}