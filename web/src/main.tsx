import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { App } from '@/routes/App';
import axios from 'axios';
import '@/css/styles.scss'
import { QueryClientProvider } from '@tanstack/react-query';
import { useGetQueryClient } from '@/lib';

axios.defaults.withCredentials = true;
const queryClient = useGetQueryClient();
queryClient.setDefaultOptions({
    queries: {
        refetchOnWindowFocus: false,
    }
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
