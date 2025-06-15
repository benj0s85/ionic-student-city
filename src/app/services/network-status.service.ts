import { Injectable } from '@angular/core';
import { PluginListenerHandle } from '@capacitor/core';
import { Network, ConnectionStatus } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService {
  private networkStatus$: BehaviorSubject<ConnectionStatus | null> = new BehaviorSubject<ConnectionStatus | null>(null);
  private networkListener: PluginListenerHandle | null = null;

  constructor(private platform: Platform) {
    this.platform.ready().then(async () => {
      if (this.platform.is('capacitor')) {
        const initialStatus = await Network.getStatus();
        this.networkStatus$.next(initialStatus);

        this.networkListener = await Network.addListener('networkStatusChange', (status) => {
          console.log('Network status changed', status);
          this.networkStatus$.next(status);
        });
      } else {
        // Handle browser environment (mock or always online)
        this.networkStatus$.next({ connected: navigator.onLine, connectionType: 'unknown' });
        window.addEventListener('online', () => this.networkStatus$.next({ connected: true, connectionType: 'unknown' }));
        window.addEventListener('offline', () => this.networkStatus$.next({ connected: false, connectionType: 'unknown' }));
      }
    });
  }

  public getNetworkStatus(): Observable<ConnectionStatus | null> {
    return this.networkStatus$.asObservable();
  }

  public isOnline(): boolean {
    return this.networkStatus$.value?.connected || false;
  }

  ngOnDestroy() {
    if (this.networkListener && this.platform.is('capacitor')) {
      this.networkListener.remove();
    }
    // Remove browser listeners if added
    if (!this.platform.is('capacitor')) {
      window.removeEventListener('online', () => this.networkStatus$.next({ connected: true, connectionType: 'unknown' }));
      window.removeEventListener('offline', () => this.networkStatus$.next({ connected: false, connectionType: 'unknown' }));
    }
  }
}