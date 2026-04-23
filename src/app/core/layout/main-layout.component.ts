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
      background: #f8fafc;
    }

    .shell-body {
      display: grid;
      grid-template-columns: 17rem minmax(0, 1fr);
      gap: 1rem;
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
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1.25rem;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
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
        padding: 1rem;
      }

      .sidebar-backdrop.visible {
        display: block;
        position: fixed;
        inset: 0;
        border: 0;
        background: rgba(15, 23, 42, 0.35);
        z-index: 25;
      }
    }

    @media (max-width: 720px) {
      .shell-body {
        padding: 0.5rem;
      }

      .shell-content-inner {
        border-radius: 0.875rem;
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
