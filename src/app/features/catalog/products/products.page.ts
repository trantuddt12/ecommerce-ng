import { Component } from '@angular/core';
import { FeatureShellComponent } from '../../../shared/ui/feature-shell.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [FeatureShellComponent],
  template: `
    <app-feature-shell
      eyebrow="Catalog"
      title="Trang products"
      description="Khu vuc quan tri san pham. Day la landing page uu tien cho nhom permission lien quan product."
      [highlights]="highlights"
    />
  `,
})
export class ProductsPage {
  protected readonly highlights = [
    { label: 'Primary Action', value: 'List, create, detail products' },
    { label: 'Expected APIs', value: 'GET /products, POST /products' },
    { label: 'Next Step', value: 'Filters, upload media, forms' },
  ];
}
