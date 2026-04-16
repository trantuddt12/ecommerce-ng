import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <section class="shell">
      <app-header></app-header>

      <div class="shell-body">
        <app-sidebar></app-sidebar>

        <main class="shell-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </section>
  `,
  styles: [`
    .shell {
      min-height: 100vh;
      background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%);
    }

    .shell-body {
      display: grid;
      grid-template-columns: 18rem 1fr;
      gap: 1.25rem;
      padding: 1.25rem;
    }

    .shell-content {
      background: rgba(255, 255, 255, 0.85);
      border-radius: 1.5rem;
      padding: 1.5rem;
      min-height: calc(100vh - 7rem);
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
    }

    @media (max-width: 960px) {
      .shell-body {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class MainLayoutComponent {}
