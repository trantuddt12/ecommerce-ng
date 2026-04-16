import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { APP_CONFIG } from './core/tokens/app-config.token';
import { AppInitService } from './core/services/app-init.service';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { errorMappingInterceptor } from './core/interceptors/error-mapping.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { refreshTokenInterceptor } from './core/interceptors/refresh-token.interceptor';

function initializeApp(appInitService: AppInitService) {
  return () => appInitService.initialize();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([
        loadingInterceptor,
        credentialsInterceptor,
        authTokenInterceptor,
        refreshTokenInterceptor,
        errorMappingInterceptor,
      ]),
    ),
    {
      provide: APP_CONFIG,
      useValue: environment,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppInitService],
      multi: true,
    },
  ]
};
