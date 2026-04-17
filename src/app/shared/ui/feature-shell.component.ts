import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-feature-shell',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <section class="feature-page">
      <mat-card class="feature-hero">
        <mat-card-content>
          <p class="feature-eyebrow">{{ eyebrow }}</p>
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </mat-card-content>
      </mat-card>

      <div class="feature-cards">
        @for (item of highlights; track item.label) {
          <mat-card class="feature-card">
            <mat-card-content>
              <p class="feature-card-label">{{ item.label }}</p>
              <p class="feature-card-value">{{ item.value }}</p>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </section>
  `,
  styles: [],
})
export class FeatureShellComponent {
  @Input({ required: true }) eyebrow = '';
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
  @Input({ required: true }) highlights: Array<{ label: string; value: string }> = [];
}
