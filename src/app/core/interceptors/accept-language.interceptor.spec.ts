import { TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpRequest } from '@angular/common/http';
import { acceptLanguageInterceptor } from './accept-language.interceptor';
import { LanguageService } from '../services/language.service';

describe('acceptLanguageInterceptor', () => {
  it('should attach current language when request has no Accept-Language header', (done) => {
    TestBed.runInInjectionContext(() => {
      const languageService = TestBed.inject(LanguageService);
      languageService.setLanguage('en');
      const request = new HttpRequest('GET', '/api/products');

      acceptLanguageInterceptor(request, (handledRequest) => {
        expect(handledRequest.headers.get('Accept-Language')).toBe('en');
        done();
        return {} as never;
      });
    });
  });

  it('should preserve explicit Accept-Language header', (done) => {
    TestBed.runInInjectionContext(() => {
      const request = new HttpRequest('GET', '/api/products', {
        headers: new HttpHeaders({ 'Accept-Language': 'vi' }),
      });

      acceptLanguageInterceptor(request, (handledRequest) => {
        expect(handledRequest.headers.get('Accept-Language')).toBe('vi');
        done();
        return {} as never;
      });
    });
  });
});
