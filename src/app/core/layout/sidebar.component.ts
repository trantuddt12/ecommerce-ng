import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ADMIN_NAVIGATION_SECTIONS } from './admin-navigation.data';
import { TranslatePipe } from '../i18n/translate.pipe';
import { AuthStore } from '../state/auth.store';
import { hasAnyPermission } from '../utils/permission.util';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <aside id="app-sidebar" class="sidebar" [class.open]="isOpen()">
      <div class="sidebar-header">
        <div>
          <p class="sidebar-eyebrow">{{ 'admin.navigation' | appTranslate }}</p>
          <strong>{{ 'admin.area' | appTranslate }}</strong>
        </div>

        <button type="button" class="close-button" (click)="navigate.emit()" [attr.aria-label]="'common.closeNavigation' | appTranslate">
          ×
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="Admin navigation">
        @for (section of visibleSections(); track section.labelKey) {
          <section class="sidebar-section">
            <p class="sidebar-section-title">{{ section.labelKey | appTranslate }}</p>
            <div class="sidebar-link-list">
              @for (item of section.items; track item.path) {
                <a [routerLink]="item.path" routerLinkActive="active" (click)="navigate.emit()">{{ item.labelKey | appTranslate }}</a>
              }
            </div>
          </section>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      background: #0f172a;
      border-radius: 1rem;
      min-height: calc(100vh - 5.5rem);
      align-content: start;
      position: sticky;
      top: 5rem;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.25rem;
      color: #ffffff;
    }

    .sidebar-eyebrow {
      margin: 0 0 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.72rem;
      color: #94a3b8;
    }

    strong {
      font-size: 1rem;
      font-weight: 700;
    }

    .sidebar-nav {
      display: grid;
      gap: 1rem;
    }

    .sidebar-section {
      display: grid;
      gap: 0.45rem;
    }

    .sidebar-section-title {
      margin: 0;
      color: #94a3b8;
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .sidebar-link-list {
      display: grid;
      gap: 0.35rem;
    }

    .close-button {
      display: none;
      width: 2.25rem;
      height: 2.25rem;
      border: 0;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
    }

    a {
      color: #cbd5e1;
      text-decoration: none;
      padding: 0.8rem 0.9rem;
      border-radius: 0.8rem;
      border: 1px solid transparent;
    }

    a.active,
    a:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.08);
    }

    @media (max-width: 960px) {
      .sidebar {
        position: fixed;
        top: 0.75rem;
        left: 0.75rem;
        bottom: 0.75rem;
        width: min(18rem, calc(100vw - 1.5rem));
        min-height: auto;
        z-index: 30;
        box-shadow: 0 24px 48px rgba(15, 23, 42, 0.35);
        transform: translateX(calc(-100% - 1rem));
        transition: transform 180ms ease;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .close-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }
  `],
})
export class SidebarComponent {
  readonly isOpen = input(false);
  readonly navigate = output<void>();
  private readonly authStore = inject(AuthStore);

  protected readonly visibleSections = computed(() => ADMIN_NAVIGATION_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.permissions || this.canAccess(item.permissions)),
    }))
    .filter((section) => section.items.length > 0));

  protected canAccess(requiredPermissions: readonly string[]): boolean {
    return hasAnyPermission(this.authStore.permissions(), [...requiredPermissions]);
  }
}
