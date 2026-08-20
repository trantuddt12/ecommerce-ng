import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize } from 'rxjs';
import { SystemSettingResponse } from '../../../core/models/system-setting.models';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SystemSettingApiService } from '../../../core/services/system-setting-api.service';

@Component({
  selector: 'app-system-settings-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatProgressBarModule, MatSlideToggleModule],
  template: `
    <section class="catalog-page">
      <mat-card class="catalog-hero">
        <mat-card-content>
          <p class="catalog-eyebrow">System</p>
          <h2>Cờ hệ thống</h2>
          <p>
            Các cờ bật/tắt hành vi runtime, lưu trong DB nên có hiệu lực ngay cho mọi service dùng
            chung database, không cần restart.
          </p>
        </mat-card-content>
      </mat-card>

      <section class="catalog-grid">
        <mat-card class="catalog-panel catalog-span-12">
          <mat-card-content>
            @if (loading()) { <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar> }

            <div class="catalog-panel-header">
              <div>
                <h3>Danh sách cờ</h3>
                <p>Đổi giá trị là áp dụng ngay. Cờ khác mặc định được đánh dấu để dễ soát lại.</p>
              </div>
              @if (settings().length) {
                <mat-chip class="catalog-chip-soft">{{ settings().length }} cờ</mat-chip>
              }
            </div>

            @if (loadError()) {
              <p class="settings-error">{{ loadError() }}</p>
            } @else if (!settings().length && !loading()) {
              <p>Chưa có cờ nào được khai báo.</p>
            }

            @for (setting of settings(); track setting.key) {
              <div class="settings-row catalog-surface-muted">
                <div class="settings-row-main">
                  <div class="settings-row-title">
                    <strong>{{ setting.label }}</strong>
                    @if (setting.value !== setting.defaultValue) {
                      <mat-chip class="catalog-chip-neutral">khác mặc định</mat-chip>
                    }
                  </div>
                  <p class="settings-row-description">{{ setting.description }}</p>
                  <p class="settings-row-meta">
                    <code>{{ setting.key }}</code>
                    <span> · mặc định: {{ setting.defaultValue ? 'bật' : 'tắt' }}</span>
                    @if (setting.lastModifiedAt) {
                      <span> · sửa lần cuối: {{ setting.lastModifiedAt }}</span>
                    }
                    @if (setting.lastModifiedBy) {
                      <span> bởi {{ setting.lastModifiedBy }}</span>
                    }
                  </p>
                </div>

                <mat-slide-toggle
                  [checked]="setting.value"
                  [disabled]="saving() === setting.key || loading()"
                  (change)="toggle(setting, $event.checked)"
                >
                  {{ setting.value ? 'Bật' : 'Tắt' }}
                </mat-slide-toggle>
              </div>
            }
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [
    `
      .settings-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1.5rem;
        padding: 1rem 1.25rem;
        border-radius: 0.75rem;
        margin-bottom: 0.75rem;
      }
      .settings-row-main {
        min-width: 0;
      }
      .settings-row-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .settings-row-description,
      .settings-row-meta {
        margin: 0.35rem 0 0;
        font-size: 0.85rem;
        opacity: 0.75;
      }
      .settings-error {
        margin: 0;
        color: var(--mat-sys-error, #b3261e);
      }
    `,
  ],
})
export class SystemSettingsPage implements OnInit {
  private readonly systemSettingApi = inject(SystemSettingApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  protected readonly settings = signal<SystemSettingResponse[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal('');
  /** Key of the flag currently being written, so only that toggle is disabled. */
  protected readonly saving = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadError.set('');

    this.systemSettingApi
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (settings) => this.settings.set(settings),
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.loadError.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected toggle(setting: SystemSettingResponse, value: boolean): void {
    if (setting.value === value) {
      return;
    }

    this.saving.set(setting.key);
    this.systemSettingApi
      .update(setting.key, value)
      .pipe(finalize(() => this.saving.set(null)))
      .subscribe({
        next: (updated) => {
          this.settings.update((current) => current.map((item) => (item.key === updated.key ? updated : item)));
          this.notifications.success(`Đã ${value ? 'bật' : 'tắt'} "${updated.label}".`);
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.notifications.error(mappedError.message);
          // The write failed, so the server still holds the old value. Re-read instead of
          // flipping the toggle back by hand: another admin may have changed it meanwhile.
          this.load();
        },
      });
  }
}
