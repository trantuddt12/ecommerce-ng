import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatCardModule],
  template: `
    <section class="auth-layout">
      <div class="auth-hero">
        <p class="eyebrow">Angular Frontend</p>
        <h1>Van hanh he thong ecommerce tren mot bo khung core ro rang.</h1>
        <p>
          Bo khung nay da duoc tach core, shared, features, san sang cho auth, route guard,
          session refresh va cac module quan tri tiep theo.
        </p>
      </div>

      <mat-card class="auth-panel">
        <router-outlet></router-outlet>
      </mat-card>
    </section>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      background: radial-gradient(circle at top left, #1d4ed8, #0f172a 55%);
      color: #fff;
    }

    .auth-hero,
    .auth-panel {
      padding: 3rem;
      display: flex;
      align-items: center;
    }

    .auth-hero {
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 1rem;
    }

    .auth-panel {
      background: rgba(255, 255, 255, 0.98);
      color: #0f172a;
      justify-content: center;
      border-radius: 0;
      box-shadow: none;
    }

    .eyebrow {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #93c5fd;
      font-size: 0.75rem;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.2rem, 4vw, 4.2rem);
      line-height: 1.05;
    }

    p {
      max-width: 36rem;
      color: rgba(255, 255, 255, 0.82);
    }

    @media (max-width: 960px) {
      .auth-layout {
        grid-template-columns: 1fr;
      }

      .auth-hero {
        padding-bottom: 0;
      }
    }
  `],
})
export class AuthLayoutComponent {}
