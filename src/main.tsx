import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { App } from '@/app/App';
import { setupStore } from '@/store';
import '@/styles/reset.css';
import '@/styles/tokens.css';
import '@/styles/globals.css';

const store = setupStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
