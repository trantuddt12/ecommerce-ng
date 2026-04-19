import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { PermissionResponse, RoleResponse } from '../../../core/models/auth.models';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RoleApiService } from '../../../core/services/role-api.service';
import { AuthStore } from '../../../core/state/auth.store';
import { hasPermission } from '../../../core/utils/permission.util';

@Component({
  selector: 'app-roles-page',
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
    MatTableModule,
  ],
  template: `
    <section class="management-page">
      <mat-card class="management-hero">
        <mat-card-content>
          <p class="management-eyebrow">Management</p>
          <h2>Roles workspace</h2>
          <p>Quan ly full CRUD role va mapping permission that tu backend <code>GET /permissions</code>.</p>
        </mat-card-content>
      </mat-card>

      <section class="management-stats">
        <mat-card class="management-stat-card"><mat-card-content><p class="management-stat-label">Tong roles</p><p class="management-stat-value">{{ roles().length }}</p></mat-card-content></mat-card>
        <mat-card class="management-stat-card"><mat-card-content><p class="management-stat-label">Dang hien thi</p><p class="management-stat-value">{{ filteredRoles().length }}</p></mat-card-content></mat-card>
        <mat-card class="management-stat-card"><mat-card-content><p class="management-stat-label">Permission catalog</p><p class="management-stat-value">{{ permissionOptions().length }}</p></mat-card-content></mat-card>
      </section>

      <section class="management-grid">
        <mat-card class="management-panel management-editor-panel">
          <mat-card-content>
            @if (loading()) {
              <mat-progress-bar class="management-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="management-panel-header">
              <div>
                <h3>{{ editingId() ? 'Cap nhat role' : 'Tao role moi' }}</h3>
                <p>Backend flow: <code>POST /role</code>, <code>PATCH /role/&#123;id&#125;</code>, <code>DELETE /role/&#123;id&#125;</code>.</p>
              </div>

              @if (editingId()) {
                <button mat-stroked-button type="button" (click)="resetForm()">Huy sua</button>
              }
            </div>

            @if (!canManageRoles()) {
              <div class="management-empty">Ban dang o che do xem. Can <code>ROLE_MANAGE</code> de tao, sua hoac xoa role.</div>
            }

            @if (errorMessage()) {
              <div class="management-error">{{ errorMessage() }}</div>
            }

            <div class="management-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput [ngModel]="form.name" (ngModelChange)="form.name = $event" [disabled]="!canManageRoles()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <input matInput [ngModel]="form.description" (ngModelChange)="form.description = $event" [disabled]="!canManageRoles()" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Permissions</mat-label>
              <mat-select multiple [ngModel]="form.permissionIds" (ngModelChange)="form.permissionIds = $event" [disabled]="!canManageRoles() || permissionsLoading()">
                @for (permission of permissionOptions(); track permission.id) {
                  <mat-option [value]="permission.id">{{ permission.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="management-actions">
              <button mat-flat-button color="primary" type="button" (click)="save()" [disabled]="loading() || !canManageRoles()">
                {{ editingId() ? 'Luu cap nhat' : 'Tao role' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="management-panel management-list-panel">
          <mat-card-content>
            @if (loading()) {
              <mat-progress-bar class="management-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="management-toolbar">
              <div>
                <h3>Danh sach roles</h3>
                <p>Tim theo role name, description hoac permission name.</p>
              </div>

              <button mat-stroked-button type="button" (click)="loadRoles()" [disabled]="loading()">Tai lai</button>
            </div>

            <div class="management-surface-muted">
              <mat-form-field appearance="outline" class="management-search">
                <mat-label>Tim role</mat-label>
                <input matInput [ngModel]="keyword()" (ngModelChange)="keyword.set($event)" placeholder="role, description, permission" />
              </mat-form-field>
            </div>

            @if (filteredRoles().length) {
              <table mat-table [dataSource]="filteredRoles()" class="management-table">
                <ng-container matColumnDef="identity">
                  <th mat-header-cell *matHeaderCellDef>Role</th>
                  <td mat-cell *matCellDef="let role">
                    <div>
                      <strong>{{ role.name }}</strong>
                      <div class="management-subtext">#{{ role.id }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let role">{{ role.description || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="permissions">
                  <th mat-header-cell *matHeaderCellDef>Permissions</th>
                  <td mat-cell *matCellDef="let role">
                    <div class="management-chip-list">
                      @if (role.permissions?.length) {
                        @for (permission of role.permissions; track permission.id) {
                          <mat-chip class="management-chip management-chip-soft">{{ permission.name }}</mat-chip>
                        }
                      } @else {
                        <span class="management-subtext">No permissions</span>
                      }
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Action</th>
                  <td mat-cell *matCellDef="let role">
                    <div class="management-actions">
                      <button mat-stroked-button type="button" (click)="startEdit(role)">Sua</button>
                      <button mat-flat-button color="warn" type="button" (click)="deleteRole(role)" [disabled]="loading() || !canManageRoles()">Xoa</button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            } @else {
              <div class="management-empty">Khong co role nao phu hop bo loc hien tai.</div>
            }
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [``],
})
export class RolesPage {
  private readonly roleApi = inject(RoleApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly authStore = inject(AuthStore);

  protected readonly roles = signal<RoleResponse[]>([]);
  protected readonly permissionOptions = signal<PermissionResponse[]>([]);
  protected readonly loading = signal(false);
  protected readonly permissionsLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly editingId = signal<number | null>(null);
  protected readonly keyword = signal('');
  protected readonly displayedColumns = ['identity', 'description', 'permissions', 'actions'];
  protected readonly form = {
    name: '',
    description: '',
    permissionIds: [] as number[],
  };

  protected readonly filteredRoles = computed(() => {
    const normalizedKeyword = this.keyword().trim().toLowerCase();
    if (!normalizedKeyword) {
      return this.roles();
    }

    return this.roles().filter((role) => {
      const haystack = [
        role.name,
        role.description,
        ...(role.permissions ?? []).map((permission) => permission.name ?? ''),
      ]
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedKeyword);
    });
  });

  constructor() {
    this.loadRoles();
    this.loadPermissions();
  }

  protected loadRoles(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.roleApi.list().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (roles) => this.roles.set(roles),
      error: (error) => this.errorMessage.set(this.errorMapper.map(error).message),
    });
  }

  protected loadPermissions(): void {
    this.permissionsLoading.set(true);
    this.roleApi.listPermissions().pipe(finalize(() => this.permissionsLoading.set(false))).subscribe({
      next: (permissions) => this.permissionOptions.set(permissions),
      error: () => this.permissionOptions.set([]),
    });
  }

  protected save(): void {
    if (!this.form.name.trim()) {
      this.notifications.error('Role name la bat buoc.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const request = {
      name: this.form.name.trim(),
      description: this.form.description.trim() || null,
      permissions: this.form.permissionIds.map((id) => ({ id })),
    };

    const action$ = this.editingId()
      ? this.roleApi.update(this.editingId()!, request)
      : this.roleApi.create(request);

    action$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.notifications.success(this.editingId() ? 'Cap nhat role thanh cong.' : 'Tao role thanh cong.');
        this.resetForm();
        this.loadRoles();
      },
      error: (error) => {
        const mappedError = this.errorMapper.map(error);
        this.errorMessage.set(mappedError.message);
        this.notifications.error(mappedError.message);
      },
    });
  }

  protected startEdit(role: RoleResponse): void {
    this.editingId.set(role.id);
    this.form.name = role.name;
    this.form.description = role.description ?? '';
    this.form.permissionIds = (role.permissions ?? []).map((permission) => permission.id);
  }

  protected deleteRole(role: RoleResponse): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.roleApi.delete(role.id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.notifications.success(`Da xoa role ${role.name}.`);
        if (this.editingId() === role.id) {
          this.resetForm();
        }
        this.loadRoles();
      },
      error: (error) => {
        const mappedError = this.errorMapper.map(error);
        this.errorMessage.set(mappedError.message);
        this.notifications.error(mappedError.message);
      },
    });
  }

  protected resetForm(): void {
    this.editingId.set(null);
    this.form.name = '';
    this.form.description = '';
    this.form.permissionIds = [];
  }

  protected canManageRoles(): boolean {
    return hasPermission(this.authStore.permissions(), 'ROLE_MANAGE');
  }
}
