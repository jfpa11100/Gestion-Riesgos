export interface ToastInterface {
  show?: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'confirmation';
  timeout?: number;
}
