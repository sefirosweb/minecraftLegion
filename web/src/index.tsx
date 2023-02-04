import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/routes/App';
import reportWebVitals from '@/reportWebVitals';

import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/state'


const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);


root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
