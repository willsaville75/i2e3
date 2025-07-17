import { Input } from './component';
import schema from './schema.json';

export const component = Input;
export { schema };
export const metadata = {
  name: 'Input',
  description: 'Form input field with various types and validation',
  category: 'form',
  tags: ['input', 'form', 'field']
};

export type { InputProps } from './component'; 