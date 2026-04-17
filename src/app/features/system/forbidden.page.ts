import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule],
  template: `
    <section class="state-shell">
      <mat-card class="state-card">
        <mat-card-content>
          <p class="state-code state-code-danger">403</p>
          <h1>Ban khong co quyen truy cap khu vuc nay.</h1>
          <p>Hay quay ve dashboard hoac dang nhap bang tai khoan co quyen phu hop.</p>
          <a mat-flat-button color="primary" routerLink="/admin/dashboard">Ve dashboard</a>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: [],
})
export class ForbiddenPage {}
