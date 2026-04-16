import { Component } from '@angular/core';
import { FeatureShellComponent } from '../../shared/ui/feature-shell.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [FeatureShellComponent],
  template: `
    <app-feature-shell
      eyebrow="Search Service"
      title="Trang search"
      description="Khu vuc tich hop search service tach rieng tren port 8082."
      [highlights]="highlights"
    />
  `,
})
export class SearchPage {
  protected readonly highlights = [
    { label: 'Primary Action', value: 'Search brands theo keyword' },
    { label: 'Expected APIs', value: 'GET /search/brand' },
    { label: 'Next Step', value: 'Search box va result cards' },
  ];
}
