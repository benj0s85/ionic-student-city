import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SidebarComponent } from './sidebar/sidebar.component';
import { Platform } from '@ionic/angular/standalone';
import { StatusBar } from '@capacitor/status-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <app-sidebar></app-sidebar>
      <div class="ion-page" id="main-content">
        <ion-router-outlet></ion-router-outlet>
      </div>
    </ion-app>
  `,
  standalone: true,
  imports: [
    IonApp, 
    IonRouterOutlet, 
    SidebarComponent
  ],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private router: Router
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    try {
      await this.platform.ready();
      
      // Configuration du thème clair par défaut
      document.body.classList.remove('dark');
      
      // Configuration de la barre de statut
      if (this.platform.is('capacitor')) {
        await StatusBar.setBackgroundColor({ color: '#3880ff' });
      }
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de l\'app:', err);
    }
  }
}