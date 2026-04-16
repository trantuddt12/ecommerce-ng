import { Component } from '@angular/core';
import { FeatureShellComponent } from '../../../shared/ui/feature-shell.component';

@Component({
  selector: 'app-attributes-page',
  standalone: true,
  imports: [FeatureShellComponent],
  template: `
    <app-feature-shell
      eyebrow="Catalog"
      title="Trang attributes"
      description="Khu vuc quan ly attributes va lien ket category attributes."
      [highlights]="highlights"
    />
  `,
})
export class AttributesPage {
  protected readonly highlights = [
    { label: 'Primary Action', value: 'List attributes va assign category' },
    { label: 'Expected APIs', value: 'GET /attributes, GET /categories/{id}/attributes' },
    { label: 'Next Step', value: 'Attribute matrix editor' },
  ];
}
