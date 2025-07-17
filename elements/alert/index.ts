import { Alert } from './component';
import schema from './schema.json';

export const component = Alert;
export { schema };
export const metadata = {
  name: 'Alert',
  description: 'Notification alert with different variants and states',
  category: 'feedback',
  tags: ['alert', 'notification', 'message', 'feedback']
};

export type { AlertProps } from './component'; 