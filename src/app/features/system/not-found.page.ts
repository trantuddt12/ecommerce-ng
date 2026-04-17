import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule],
  template: `
    <section class="state-shell">
      <mat-card class="state-card">
        <mat-card-content>
          <p class="state-code state-code-primary">404</p>
          <h1>Khong tim thay trang ban dang mo.</h1>
          <p>Duong dan co the da thay doi hoac tai nguyen nay khong ton tai trong he thong.</p>
          <a mat-flat-button color="primary" routerLink="/admin/dashboard">Ve dashboard</a>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: [],
})
export class NotFoundPage {}
