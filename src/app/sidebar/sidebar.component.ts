import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  schoolOutline,
  personOutline,
  businessOutline,
  chatbubblesOutline,
  logOutOutline,
  menuOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styles: [`
    .logout-text { color: #e74c3c; }
    .logout ion-icon { color: #e74c3c; }
    .selected { background: #f0f0f0; }
    ion-title { display: flex; align-items: center; gap: 8px; }
  `]
})
export class SidebarComponent {
  constructor(public authService: AuthService, private router: Router) {
    addIcons({
      'school-outline': schoolOutline,
      'person-outline': personOutline,
      'business-outline': businessOutline,
      'chatbubbles-outline': chatbubblesOutline,
      'log-out-outline': logOutOutline,
      'menu-outline': menuOutline
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
} 