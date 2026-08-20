/**
 * One administrator-editable runtime flag, as returned by `GET /system/settings`.
 *
 * `defaultValue` is what the backend falls back to when the flag has never been changed;
 * the UI uses it to mark a flag that has been moved away from its safe default.
 */
export interface SystemSettingResponse {
  readonly key: string;
  readonly value: boolean;
  readonly defaultValue: boolean;
  readonly label: string;
  readonly description: string;
  readonly lastModifiedAt: string | null;
  readonly lastModifiedBy: string | null;
}
