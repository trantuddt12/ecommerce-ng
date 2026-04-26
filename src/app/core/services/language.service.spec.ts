import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should use browser language and update document language', () => {
    const service = TestBed.inject(LanguageService);

    expect(service.getCurrentLanguage()).toBe('en');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
  });

  it('should translate by current language', () => {
    const service = TestBed.inject(LanguageService);

    service.setLanguage('vi');
    expect(service.translate('common.logout')).toBe('Đăng xuất');

    service.setLanguage('en');
    expect(service.translate('common.logout')).toBe('Log out');
  });
});
