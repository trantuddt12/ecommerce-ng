import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loading-backdrop" aria-live="polite" aria-label="Dang tai du lieu">
        <div class="loading-spinner"></div>
      </div>
    }
  `,
  styles: [`
    .loading-backdrop {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgba(15, 23, 42, 0.18);
      backdrop-filter: blur(2px);
      z-index: 1000;
    }

    .loading-spinner {
      width: 3rem;
      height: 3rem;
      border-radius: 999px;
      border: 4px solid rgba(255, 255, 255, 0.35);
      border-top-color: #ffffff;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `],
})
export class GlobalLoadingComponent {
  protected readonly loadingService = inject(LoadingService);
}
