import { Card } from './component';
import schema from './schema.json';

export const component = Card;
export { schema };
export const metadata = {
  name: 'Card',
  description: 'Container element with various styling options',
  category: 'layout',
  tags: ['card', 'container', 'wrapper']
};

export type { CardProps } from './component'; 