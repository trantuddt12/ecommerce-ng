import { Component } from '@angular/core';
import { FeatureShellComponent } from '../../../shared/ui/feature-shell.component';

@Component({
  selector: 'app-brands-page',
  standalone: true,
  imports: [FeatureShellComponent],
  template: `
    <app-feature-shell
      eyebrow="Catalog"
      title="Trang brands"
      description="Khu vuc quan tri thuong hieu. Day la page dich rieng de tiep tuc dung CRUD brands."
      [highlights]="highlights"
    />
  `,
})
export class BrandsPage {
  protected readonly highlights = [
    { label: 'Primary Action', value: 'List, create, update brands' },
    { label: 'Expected APIs', value: 'GET /brands, POST /brands' },
    { label: 'Next Step', value: 'Data table va modal form' },
  ];
}
