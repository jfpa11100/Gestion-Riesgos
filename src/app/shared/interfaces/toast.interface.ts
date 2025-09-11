export interface ToastInterface {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'confirmation';
  timeout?: number;
}
