import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <section class="shell">
      <app-header [sidebarOpen]="isSidebarOpen()" (menuToggle)="toggleSidebar()"></app-header>

      <div class="shell-body">
        <button
          type="button"
          class="sidebar-backdrop"
          [class.visible]="isSidebarOpen()"
          (click)="closeSidebar()"
          aria-label="Dong menu dieu huong"
        ></button>

        <app-sidebar [isOpen]="isSidebarOpen()" (navigate)="closeSidebar()"></app-sidebar>

        <main class="shell-content" (click)="closeSidebar()">
          <div class="shell-content-inner">
            <router-outlet></router-outlet>
          </div>

          <footer class="shell-footer">
            <span>TTL Ecommerce Admin</span>
            <span>Van hanh gon gang va tap trung vao noi dung chinh</span>
          </footer>
        </main>
      </div>
    </section>
  `,
  styles: [`
    .shell {
      min-height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 30rem),
        linear-gradient(180deg, #ffffff 0%, #f6f7fb 100%);
    }

    .shell-body {
      display: grid;
      grid-template-columns: 16rem minmax(0, 1fr);
      gap: 1rem;
      width: min(1440px, 100%);
      margin: 0 auto;
      padding: 1rem;
      position: relative;
      align-items: start;
    }

    .shell-content {
      min-height: calc(100vh - 5.5rem);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .shell-content-inner {
      flex: 1;
      min-width: 0;
      background: rgba(255, 255, 255, 0.86);
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 1.5rem;
      padding: clamp(1rem, 2vw, 1.5rem);
      box-shadow: 0 14px 36px rgba(15, 23, 42, 0.06);
      backdrop-filter: blur(14px);
    }

    .shell-footer {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0 0.25rem 0.25rem;
      color: #64748b;
      font-size: 0.875rem;
      flex-wrap: wrap;
    }

    .sidebar-backdrop {
      display: none;
    }

    @media (max-width: 960px) {
      .shell-body {
        grid-template-columns: 1fr;
        padding: 0.75rem;
      }

      .shell-content {
        min-height: calc(100vh - 6rem);
      }

      .shell-content-inner {
        border-radius: 1.25rem;
        padding: 1rem;
      }

      .sidebar-backdrop.visible {
        display: block;
        position: fixed;
        inset: 0;
        border: 0;
        background: rgba(15, 23, 42, 0.32);
        z-index: 25;
      }
    }

    @media (max-width: 720px) {
      .shell-body {
        padding: 0.5rem;
      }

      .shell-content-inner {
        border-radius: 1rem;
        padding: 0.875rem;
      }

      .shell-footer {
        font-size: 0.8125rem;
      }
    }
  `],
})
export class MainLayoutComponent {
  protected readonly isSidebarOpen = signal(false);

  protected toggleSidebar(): void {
    this.isSidebarOpen.update((value) => !value);
  }

  protected closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}
