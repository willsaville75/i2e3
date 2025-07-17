import { Select } from './component';
import schema from './schema.json';

export const component = Select;
export { schema };
export const metadata = {
  name: 'Select',
  description: 'Dropdown select field with options',
  category: 'form',
  tags: ['select', 'dropdown', 'form', 'field']
};

export type { SelectProps, SelectOption } from './component'; 