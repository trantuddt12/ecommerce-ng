import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatCardModule],
  template: `
    <section class="auth-layout">
      <div class="auth-content">
        <div class="auth-copy">
          <p class="eyebrow">TTL Ecommerce</p>
          <h1>Dang nhap de tiep tuc quan ly va mua sam.</h1>
          <p>Giao dien duoc rut gon de tap trung vao thao tac dang nhap, dang ky va khoi phuc tai khoan.</p>
        </div>

        <mat-card class="auth-panel">
          <router-outlet></router-outlet>
        </mat-card>
      </div>
    </section>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%);
    }

    .auth-content {
      width: min(960px, 100%);
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
      gap: 1.5rem;
      align-items: center;
    }

    .auth-copy {
      color: #0f172a;
      display: grid;
      gap: 1rem;
    }

    .eyebrow {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #2563eb;
      font-size: 0.75rem;
    }

    h1 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3.5rem);
      line-height: 1.08;
    }

    p {
      margin: 0;
      color: #475569;
      max-width: 34rem;
    }

    .auth-panel {
      padding: 0.5rem;
      border-radius: 1.25rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
      background: rgba(255, 255, 255, 0.96);
    }

    @media (max-width: 960px) {
      .auth-content {
        grid-template-columns: 1fr;
      }

      .auth-copy {
        text-align: center;
        justify-items: center;
      }
    }

    @media (max-width: 720px) {
      .auth-layout {
        padding: 1rem;
      }

      .auth-content {
        gap: 1rem;
      }
    }
  `],
})
export class AuthLayoutComponent {}
