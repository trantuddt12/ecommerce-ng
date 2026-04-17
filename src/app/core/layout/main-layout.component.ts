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
      position: relative;
    }

    .shell-content {
      background: rgba(255, 255, 255, 0.85);
      border-radius: 1.5rem;
      padding: 1.5rem;
      min-height: calc(100vh - 7rem);
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
    }

    .sidebar-backdrop {
      display: none;
    }

    @media (max-width: 960px) {
      .shell-body {
        grid-template-columns: 1fr;
        padding: 1rem;
      }

      .shell-content {
        padding: 1.25rem;
        min-height: calc(100vh - 8rem);
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
        padding: 0.75rem;
      }

      .shell-content {
        border-radius: 1.25rem;
        padding: 1rem;
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
