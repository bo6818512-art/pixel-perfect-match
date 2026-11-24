export const servicePaths = ['/my/new-request', '/my/renew-license', '/my/amend-license', '/my/requests', '/my/licenses', '/inquiry', '/help'] as const;
export type ServicePath = typeof servicePaths[number];
export const postLoginDestination = '/' as const;
export function safeDestination(value: unknown): ServicePath {
  return servicePaths.find(path => path === value) ?? '/my/requests';
}
export function isServicePath(value: string) { return servicePaths.some(path => path === value); }