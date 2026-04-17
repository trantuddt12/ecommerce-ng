import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ImportExportDomain } from '../../../core/models/catalog.models';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { ImportExportApiService } from '../../../core/services/import-export-api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-operations-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header class="hero">
        <p class="eyebrow">Catalog Operations</p>
        <h2>Import va export interface files</h2>
        <p>
          Trigger cac job import/export text response cua basecommerce bang dung query contract
          interfaceFileId va fileName.
        </p>
      </header>

      <section class="panel form-panel">
        <div class="field-grid">
          <label>
            <span>Domain</span>
            <select [(ngModel)]="selectedDomain">
              @for (option of domainOptions; track option.value) {
                <option [value]="option.value">{{ option.label }}</option>
              }
            </select>
          </label>

          <label>
            <span>Interface file ID</span>
            <input [(ngModel)]="interfaceFileId" placeholder="IF-001" />
          </label>

          <label>
            <span>File name</span>
            <input [(ngModel)]="fileName" placeholder="brands.csv" />
          </label>
        </div>

        <div class="actions">
          <button type="button" (click)="run('import')" [disabled]="loading()">Import</button>
          <button type="button" class="secondary" (click)="run('export')" [disabled]="loading()">Export</button>
        </div>
      </section>

      <section class="panel response-panel">
        <div class="section-header">
          <h3>Last response</h3>
          @if (loading()) {
            <span class="badge">Dang chay</span>
          }
        </div>

        <pre>{{ responseMessage() || 'Chua co response.' }}</pre>
      </section>
    </section>
  `,
  styles: [`
    .page-shell {
      display: grid;
      gap: 1rem;
    }

    .hero,
    .panel {
      border-radius: 1.25rem;
      background: #fff;
      border: 1px solid rgba(148, 163, 184, 0.18);
      padding: 1.5rem;
    }

    .hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #fff;
    }

    .eyebrow,
    .badge,
    label span {
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.75rem;
    }

    .eyebrow {
      margin: 0;
      color: #bfdbfe;
    }

    h2,
    h3 {
      margin: 0;
    }

    .field-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    label {
      display: grid;
      gap: 0.5rem;
      color: #0f172a;
      font-weight: 600;
    }

    input,
    select,
    button {
      border-radius: 0.85rem;
      border: 1px solid rgba(148, 163, 184, 0.35);
      padding: 0.75rem 0.9rem;
      font: inherit;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    button {
      cursor: pointer;
      background: #1d4ed8;
      color: #fff;
      font-weight: 700;
    }

    button.secondary {
      background: #fff;
      color: #1d4ed8;
    }

    button:disabled {
      cursor: wait;
      opacity: 0.7;
    }

    .response-panel pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      color: #0f172a;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .badge {
      color: #1d4ed8;
      font-weight: 700;
    }

    @media (max-width: 960px) {
      .field-grid {
        grid-template-columns: 1fr;
      }

      .actions {
        flex-direction: column;
      }
    }
  `],
})
export class OperationsPage {
  private readonly importExportApi = inject(ImportExportApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  protected readonly loading = signal(false);
  protected readonly responseMessage = signal('');
  protected readonly domainOptions: Array<{ value: ImportExportDomain; label: string }> = [
    { value: 'brand', label: 'Brand' },
    { value: 'category', label: 'Category' },
    { value: 'product', label: 'Product' },
    { value: 'attributes', label: 'Attributes' },
    { value: 'category-attributes', label: 'Category attributes' },
  ];

  protected selectedDomain: ImportExportDomain = 'brand';
  protected interfaceFileId = '';
  protected fileName = '';

  protected run(mode: 'import' | 'export'): void {
    if (!this.interfaceFileId.trim() || !this.fileName.trim()) {
      this.notifications.error('Can nhap interface file ID va file name truoc khi chay job.');
      return;
    }

    this.loading.set(true);
    this.responseMessage.set('');

    const request = {
      interfaceFileId: this.interfaceFileId.trim(),
      fileName: this.fileName.trim(),
    };

    const action$ = mode === 'import'
      ? this.importExportApi.import(this.selectedDomain, request)
      : this.importExportApi.export(this.selectedDomain, request);

    action$
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (message) => {
          this.responseMessage.set(message);
          this.notifications.success(`${mode === 'import' ? 'Import' : 'Export'} thanh cong.`);
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.responseMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }
}
