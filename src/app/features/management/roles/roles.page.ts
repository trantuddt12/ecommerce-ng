import { Component } from '@angular/core';
import { FeatureShellComponent } from '../../../shared/ui/feature-shell.component';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [FeatureShellComponent],
  template: `
    <app-feature-shell
      eyebrow="Role Management"
      title="Trang quan ly vai tro"
      description="Khu vuc nay phu hop cho tai khoan co quyen role. San sang de noi CRUD role va mapping permissions."
      [highlights]="highlights"
    />
  `,
})
export class RolesPage {
  protected readonly highlights = [
    { label: 'Primary Action', value: 'Danh sach role va permissions' },
    { label: 'Expected APIs', value: 'GET /role, POST /role' },
    { label: 'Next Step', value: 'Role form va delete confirm' },
  ];
}
