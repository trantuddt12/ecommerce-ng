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
import { CreateUserRequest, RoleResponse, UpdateUserRequest, UserResponse } from '../../../core/models/auth.models';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RoleApiService } from '../../../core/services/role-api.service';
import { UserApiService } from '../../../core/services/user-api.service';
import { AuthStore } from '../../../core/state/auth.store';
import { hasPermission } from '../../../core/utils/permission.util';

@Component({
  selector: 'app-users-page',
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
          <h2>Users workspace</h2>
          <p>Quan ly day du user theo backend contract hien tai: create, list, edit, delete va gan nhieu role.</p>
        </mat-card-content>
      </mat-card>

      <section class="management-stats">
        <mat-card class="management-stat-card"><mat-card-content><p class="management-stat-label">Tong users</p><p class="management-stat-value">{{ users().length }}</p></mat-card-content></mat-card>
        <mat-card class="management-stat-card"><mat-card-content><p class="management-stat-label">Dang hien thi</p><p class="management-stat-value">{{ filteredUsers().length }}</p></mat-card-content></mat-card>
        <mat-card class="management-stat-card"><mat-card-content><p class="management-stat-label">Co the sua</p><p class="management-stat-value">{{ canManageUsers() ? 'Yes' : 'No' }}</p></mat-card-content></mat-card>
      </section>

      <section class="management-grid">
        <mat-card class="management-panel management-editor-panel">
          <mat-card-content>
            @if (loading()) {
              <mat-progress-bar class="management-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="management-panel-header">
              <div>
                <h3>{{ editingId() ? 'Cap nhat user' : 'Tao user moi' }}</h3>
                <p>Su dung <code>POST /user</code>, <code>POST /user/update</code> va <code>DELETE /user/&#123;id&#125;</code>.</p>
              </div>

              @if (editingId()) {
                <button mat-stroked-button type="button" (click)="resetForm()">Huy sua</button>
              }
            </div>

            @if (!canManageUsers()) {
              <div class="management-empty">Ban dang o che do xem. Can <code>USER_UPDATE</code> de tao, sua hoac xoa user.</div>
            }

            @if (errorMessage()) {
              <div class="management-error">{{ errorMessage() }}</div>
            }

            <div class="management-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <input matInput [ngModel]="form.username" (ngModelChange)="form.username = $event" [disabled]="!canManageUsers()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" [ngModel]="form.email" (ngModelChange)="form.email = $event" [disabled]="!canManageUsers()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput [ngModel]="form.phonenumber" (ngModelChange)="form.phonenumber = $event" [disabled]="!canManageUsers()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select [ngModel]="form.status" (ngModelChange)="form.status = $event" [disabled]="!canManageUsers()">
                  @for (status of statusOptions; track status) {
                    <mat-option [value]="status">{{ status }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Password {{ editingId() ? '(optional)' : '' }}</mat-label>
              <input matInput type="password" [ngModel]="form.password" (ngModelChange)="form.password = $event" [disabled]="!canManageUsers()" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Roles</mat-label>
              <mat-select multiple [ngModel]="form.roleIds" (ngModelChange)="form.roleIds = $event" [disabled]="!canManageUsers() || roleOptionsLoading()">
                @for (role of roleOptions(); track role.id) {
                  <mat-option [value]="role.id">{{ role.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="management-actions">
              <button mat-flat-button color="primary" type="button" (click)="save()" [disabled]="loading() || !canManageUsers()">
                {{ editingId() ? 'Luu cap nhat' : 'Tao user' }}
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
                <h3>Danh sach users</h3>
                <p>Tim theo username, email, status, role id hoac role name.</p>
              </div>

              <button mat-stroked-button type="button" (click)="loadUsers()" [disabled]="loading()">Tai lai</button>
            </div>

            <div class="management-surface-muted">
              <mat-form-field appearance="outline" class="management-search">
                <mat-label>Tim user</mat-label>
                <input matInput [ngModel]="keyword()" (ngModelChange)="keyword.set($event)" placeholder="username, email, status, role" />
              </mat-form-field>
            </div>

            @if (filteredUsers().length) {
              <table mat-table [dataSource]="filteredUsers()" class="management-table">
                <ng-container matColumnDef="identity">
                  <th mat-header-cell *matHeaderCellDef>User</th>
                  <td mat-cell *matCellDef="let user">
                    <div>
                      <strong>{{ user.username }}</strong>
                      <div class="management-subtext">#{{ user.id }} · {{ user.email }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="phone">
                  <th mat-header-cell *matHeaderCellDef>Phone</th>
                  <td mat-cell *matCellDef="let user">{{ user.phoneNumber || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let user">
                    <mat-chip class="management-chip" [class.management-chip-active]="isActive(user.status)">{{ user.status || 'UNKNOWN' }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="roles">
                  <th mat-header-cell *matHeaderCellDef>Roles</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="management-chip-list">
                      @if (user.roles?.length) {
                        @for (role of user.roles; track role.id) {
                          <mat-chip class="management-chip management-chip-soft">{{ role.name }}</mat-chip>
                        }
                      } @else if (user.roleIds?.length) {
                        @for (roleId of user.roleIds; track roleId) {
                          <mat-chip class="management-chip management-chip-soft">#{{ roleId }}</mat-chip>
                        }
                      } @else {
                        <span class="management-subtext">No roles</span>
                      }
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Action</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="management-actions">
                      <button mat-stroked-button type="button" (click)="startEdit(user)">Sua</button>
                      <button mat-flat-button color="warn" type="button" (click)="deleteUser(user)" [disabled]="loading() || !canManageUsers()">Xoa</button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            } @else {
              <div class="management-empty">Khong co user nao phu hop bo loc hien tai.</div>
            }
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [``],
})
export class UsersPage {
  private readonly userApi = inject(UserApiService);
  private readonly roleApi = inject(RoleApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly authStore = inject(AuthStore);

  protected readonly users = signal<UserResponse[]>([]);
  protected readonly roleOptions = signal<RoleResponse[]>([]);
  protected readonly loading = signal(false);
  protected readonly roleOptionsLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly editingId = signal<number | null>(null);
  protected readonly keyword = signal('');
  protected readonly displayedColumns = ['identity', 'phone', 'status', 'roles', 'actions'];
  protected readonly statusOptions = ['A', 'I'];
  protected readonly form = {
    username: '',
    email: '',
    phonenumber: '',
    password: '',
    status: 'A',
    roleIds: [] as number[],
  };

  protected readonly filteredUsers = computed(() => {
    const normalizedKeyword = this.keyword().trim().toLowerCase();
    if (!normalizedKeyword) {
      return this.users();
    }

    return this.users().filter((user) => {
      const haystack = [
        user.username,
        user.email,
        user.phoneNumber,
        user.status,
        ...(user.roleIds ?? []).map((roleId) => String(roleId)),
        ...(user.roles ?? []).map((role) => role.name ?? ''),
      ]
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedKeyword);
    });
  });

  constructor() {
    this.loadUsers();
    this.loadRoleOptions();
  }

  protected loadUsers(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.userApi.list().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (users) => this.users.set(users),
      error: (error) => this.errorMessage.set(this.errorMapper.map(error).message),
    });
  }

  protected loadRoleOptions(): void {
    this.roleOptionsLoading.set(true);
    this.roleApi.list().pipe(finalize(() => this.roleOptionsLoading.set(false))).subscribe({
      next: (roles) => this.roleOptions.set(roles),
      error: () => this.roleOptions.set([]),
    });
  }

  protected save(): void {
    if (!this.form.username.trim() || !this.form.email.trim()) {
      this.notifications.error('Username va email la bat buoc.');
      return;
    }

    if (!this.editingId() && this.form.password.trim().length < 6) {
      this.notifications.error('Password phai co it nhat 6 ky tu khi tao user.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const action$ = this.editingId()
      ? this.userApi.update(this.buildUpdateRequest())
      : this.userApi.create(this.buildCreateRequest());

    action$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.notifications.success(this.editingId() ? 'Cap nhat user thanh cong.' : 'Tao user thanh cong.');
        this.resetForm();
        this.loadUsers();
      },
      error: (error) => {
        const mappedError = this.errorMapper.map(error);
        this.errorMessage.set(mappedError.message);
        this.notifications.error(mappedError.message);
      },
    });
  }

  protected startEdit(user: UserResponse): void {
    this.editingId.set(user.id);
    this.form.username = user.username;
    this.form.email = user.email;
    this.form.phonenumber = user.phoneNumber ?? '';
    this.form.password = '';
    this.form.status = user.status ?? 'A';
    this.form.roleIds = [...(user.roleIds ?? [])];
  }

  protected deleteUser(user: UserResponse): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.userApi.delete(user.id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.notifications.success(`Da xoa user ${user.username}.`);
        if (this.editingId() === user.id) {
          this.resetForm();
        }
        this.loadUsers();
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
    this.form.username = '';
    this.form.email = '';
    this.form.phonenumber = '';
    this.form.password = '';
    this.form.status = 'A';
    this.form.roleIds = [];
  }

  protected canManageUsers(): boolean {
    return hasPermission(this.authStore.permissions(), 'USER_UPDATE');
  }

  protected isActive(status?: string | null): boolean {
    return (status ?? '').toUpperCase() === 'A' || (status ?? '').toUpperCase() === 'ACTIVE';
  }

  private buildCreateRequest(): CreateUserRequest {
    return {
      username: this.form.username.trim(),
      email: this.form.email.trim(),
      password: this.form.password.trim(),
      phonenumber: this.form.phonenumber.trim() || null,
      status: this.form.status,
      roleIds: [...this.form.roleIds],
    };
  }

  private buildUpdateRequest(): UpdateUserRequest {
    return {
      id: this.editingId()!,
      username: this.form.username.trim(),
      email: this.form.email.trim(),
      password: this.form.password.trim() || null,
      phonenumber: this.form.phonenumber.trim() || null,
      status: this.form.status,
      roleIds: [...this.form.roleIds],
    };
  }
}
