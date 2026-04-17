import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loading-backdrop" aria-live="polite" aria-label="Dang tai du lieu">
        <mat-progress-spinner mode="indeterminate" diameter="52"></mat-progress-spinner>
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

    .loading-backdrop ::ng-deep .mdc-circular-progress__indeterminate-circle-graphic {
      stroke: #ffffff;
    }
  `],
})
export class GlobalLoadingComponent {
  protected readonly loadingService = inject(LoadingService);
}
