import { Component } from '@angular/core';
import { FeatureShellComponent } from '../../../shared/ui/feature-shell.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [FeatureShellComponent],
  template: `
    <app-feature-shell
      eyebrow="User Management"
      title="Trang quan ly nguoi dung"
      description="Day la diem vao sau login khi tai khoan co quyen user. Co the mo rong tiep thanh danh sach, filter, chi tiet va cap nhat user."
      [highlights]="highlights"
    />
  `,
})
export class UsersPage {
  protected readonly highlights = [
    { label: 'Primary Action', value: 'List va search users' },
    { label: 'Expected APIs', value: 'GET /user, GET /user/{id}' },
    { label: 'Next Step', value: 'Table, paging, permission badges' },
  ];
}
