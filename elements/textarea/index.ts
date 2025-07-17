import { Textarea } from './component';
import schema from './schema.json';

export const component = Textarea;
export { schema };
export const metadata = {
  name: 'Textarea',
  description: 'Multi-line text input field with validation',
  category: 'form',
  tags: ['textarea', 'form', 'field', 'multiline']
};

export type { TextareaProps } from './component'; 