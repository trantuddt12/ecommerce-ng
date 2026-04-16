export type QueryParamValue = string | number | boolean | null | undefined;

export function buildQueryParams(params: Record<string, QueryParamValue>): Record<string, string> {
  return Object.entries(params).reduce<Record<string, string>>((accumulator, [key, value]) => {
    if (value === null || value === undefined || value === '') {
      return accumulator;
    }

    accumulator[key] = String(value);
    return accumulator;
  }, {});
}
