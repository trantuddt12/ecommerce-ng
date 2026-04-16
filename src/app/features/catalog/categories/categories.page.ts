import { Component } from '@angular/core';
import { FeatureShellComponent } from '../../../shared/ui/feature-shell.component';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [FeatureShellComponent],
  template: `
    <app-feature-shell
      eyebrow="Catalog"
      title="Trang categories"
      description="Khu vuc danh muc san pham, san sang de noi tree/category form va attribute mapping."
      [highlights]="highlights"
    />
  `,
})
export class CategoriesPage {
  protected readonly highlights = [
    { label: 'Primary Action', value: 'List va cap nhat categories' },
    { label: 'Expected APIs', value: 'GET /categories, PATCH /categories/{id}' },
    { label: 'Next Step', value: 'Nested category UI' },
  ];
}
