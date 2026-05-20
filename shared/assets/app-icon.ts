export const APP_ICON_PATH = '/app-icon.png';

export type AppIconSize = 'sm' | 'md' | 'lg' | 'loading';

const SIZE_CLASS: Record<AppIconSize, string> = {
  sm: 'app-icon app-icon--sm',
  md: 'app-icon app-icon--md',
  lg: 'app-icon app-icon--lg',
  loading: 'app-icon app-icon--loading',
};

const SIZE_PX: Record<AppIconSize, number> = {
  sm: 32,
  md: 48,
  lg: 120,
  loading: 72,
};

/** HTML de `<img>` del ícono de UX Training App */
export function appIconImg(size: AppIconSize = 'md'): string {
  const px = SIZE_PX[size];
  return `<img src="${APP_ICON_PATH}" alt="" class="${SIZE_CLASS[size]}" width="${px}" height="${px}" aria-hidden="true" decoding="async" />`;
}
