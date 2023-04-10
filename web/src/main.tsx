import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux'
import { App } from '@/routes/App';
import { store } from '@/state'
import axios from 'axios';
import '@/css/styles.scss'
import { webServer, port } from '@/utils/config';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = `${webServer}:${port}`;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
