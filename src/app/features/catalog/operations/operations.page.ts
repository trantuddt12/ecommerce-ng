import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { ImportExportDomain } from '../../../core/models/catalog.models';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { ImportExportApiService } from '../../../core/services/import-export-api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-operations-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  template: `
    <section class="catalog-page">
      <mat-card class="catalog-hero">
        <mat-card-content>
          <p class="catalog-eyebrow">Catalog Operations</p>
          <h2>Import va export interface files</h2>
          <p>Trigger cac job import/export text response cua basecommerce bang dung query contract interfaceFileId va fileName.</p>
        </mat-card-content>
      </mat-card>

      <section class="catalog-grid">
        <mat-card class="catalog-panel catalog-span-5">
          <mat-card-content>
            @if (loading()) { <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar> }
            <div class="catalog-panel-header">
              <div>
                <h3>Run job</h3>
                <p>Chon domain va thong tin interface file de kick off job.</p>
              </div>
              <mat-chip class="catalog-chip-soft">{{ selectedDomain }}</mat-chip>
            </div>

            <div class="catalog-form-grid catalog-surface-muted">
              <mat-form-field appearance="outline">
                <mat-label>Domain</mat-label>
                <mat-select [(ngModel)]="selectedDomain">
                  @for (option of domainOptions; track option.value) {
                    <mat-option [value]="option.value">{{ option.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Interface file ID</mat-label>
                <input matInput [(ngModel)]="interfaceFileId" placeholder="IF-001" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>File name</mat-label>
                <input matInput [(ngModel)]="fileName" placeholder="brands.csv" />
              </mat-form-field>
            </div>

            <div class="catalog-actions">
              <button mat-flat-button color="primary" type="button" (click)="run('import')" [disabled]="loading()">Import</button>
              <button mat-stroked-button type="button" (click)="run('export')" [disabled]="loading()">Export</button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-panel catalog-span-7">
          <mat-card-content>
            <div class="catalog-panel-header">
              <div>
                <h3>Last response</h3>
                <p>Ket qua response text tu job import/export gan nhat.</p>
              </div>
              @if (loading()) {
                <mat-chip class="catalog-chip-neutral">Dang chay</mat-chip>
              }
            </div>

            <pre class="catalog-response-block">{{ responseMessage() || 'Chua co response.' }}</pre>
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [],
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
