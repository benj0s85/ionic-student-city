import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core'; // Import HostBinding
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SidebarComponent } from './sidebar/sidebar.component';
import { Platform } from '@ionic/angular/standalone';
import { StatusBar } from '@capacitor/status-bar';
import { Router } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';
import { NetworkStatusService } from './services/network-status.service'; // Import the service
import { Subscription } from 'rxjs';
import { ConnectionStatus } from '@capacitor/network';

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
export class AppComponent implements OnInit, OnDestroy {
  @HostBinding('class.offline-active') isOffline = false; // Add HostBinding
  private networkStatusSubscription: Subscription | undefined;

  constructor(
    private platform: Platform,
    private router: Router,
    private networkStatusService: NetworkStatusService // Inject the service
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
        // await SplashScreen.hide(); // Consider when to hide splash screen
        await StatusBar.setBackgroundColor({ color: '#3880ff' });
      }
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de l\'app:', err);
    }
  }

  ngOnInit() {
    this.networkStatusSubscription = this.networkStatusService.getNetworkStatus().subscribe((status: ConnectionStatus | null) => {
      if (status) {
        this.isOffline = !status.connected;
        console.log('App component: Online status:', !this.isOffline);
        // Here you can add logic to disable/enable features globally if needed
      }
    });
  }

  ngOnDestroy() {
    if (this.networkStatusSubscription) {
      this.networkStatusSubscription.unsubscribe();
    }
  }
}