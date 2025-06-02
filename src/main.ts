import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideIonicAngular({
      mode: 'md'
    }),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const corsReq = req.clone({
            headers: req.headers
              .set('Content-Type', 'application/json')
              .set('Accept', 'application/json'),
            withCredentials: false
          });
          return next(corsReq);
        }
      ])
    )
  ]
}).catch(err => console.log(err));