import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LanguageService, SupportedLanguage } from '../services/language.service';
import { TranslatePipe } from './translate.pipe';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="language-switcher" role="group" [attr.aria-label]="'common.language' | appTranslate">
      @for (option of options; track option.value) {
        <button
          type="button"
          class="language-option"
          [class.active]="languageService.language() === option.value"
          [attr.aria-pressed]="languageService.language() === option.value"
          (click)="setLanguage(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
  styles: [`
    .language-switcher {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      padding: 0.2rem;
      border: 1px solid #cbd5e1;
      border-radius: 999px;
      background: #ffffff;
    }

    .language-option {
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: #475569;
      cursor: pointer;
      font: inherit;
      font-size: 0.82rem;
      font-weight: 700;
      padding: 0.45rem 0.65rem;
      min-width: 2.4rem;
    }

    .language-option.active {
      background: #0f172a;
      color: #ffffff;
    }
  `],
})
export class LanguageSwitcherComponent {
  protected readonly languageService = inject(LanguageService);
  protected readonly options: readonly { value: SupportedLanguage; label: string }[] = [
    { value: 'vi', label: 'VI' },
    { value: 'en', label: 'EN' },
  ];

  protected setLanguage(language: SupportedLanguage): void {
    this.languageService.setLanguage(language);
  }
}
