import { Video } from './component';
import schema from './schema.json';

export const component = Video;
export { schema };
export const metadata = {
  name: 'Video',
  description: 'Video player with modern features and beautiful placeholders',
  category: 'media',
  tags: ['video', 'media', 'player', 'streaming']
};

export type { VideoProps } from './component'; 