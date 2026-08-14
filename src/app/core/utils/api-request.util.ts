import { AppConfig } from '../config/app-config.model';

/**
 * True when the request targets this application's own backend rather than a third party such
 * as the Keycloak token endpoint. Relative URLs count as ours: everything the app itself issues
 * either goes through `BaseApiService` (absolute) or is a same-origin asset.
 *
 * Interceptors use this to keep credentials and the app access token from ever reaching another
 * origin — sending `Authorization: Bearer <app token>` to Keycloak's token endpoint, for example,
 * makes it fail with `invalid_client`.
 */
export function isAppApiRequest(url: string, config: AppConfig): boolean {
  if (!/^https?:\/\//i.test(url)) {
    return true;
  }
  return [config.apiBaseUrl, config.searchApiBaseUrl].some((baseUrl) => url.startsWith(baseUrl));
}
