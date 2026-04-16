import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="state-page">
      <p>404</p>
      <h1>Khong tim thay trang ban dang mo.</h1>
      <a routerLink="/admin/dashboard">Ve dashboard</a>
    </section>
  `,
  styles: [`.state-page { min-height: 100vh; display: grid; place-items: center; text-align: center; padding: 2rem; } p { margin: 0; font-size: 5rem; font-weight: 800; color: #1d4ed8; } h1 { margin: 0.5rem 0 1rem; } a { color: #1d4ed8; text-decoration: none; }`],
})
export class NotFoundPage {}
