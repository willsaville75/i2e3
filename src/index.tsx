import ReactDOM from 'react-dom/client';
import { App } from './App';
import { IndyChatPanel } from './components/IndyChatPanel';

const Root = () => {
  return (
    <>
      <App />
      <IndyChatPanel />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />); 