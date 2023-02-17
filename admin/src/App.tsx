import React from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentUserQueryData } from './graphql/api';

const queryClient = new QueryClient();

function CurrentUser() {
  const { data } = useCurrentUserQueryData();
  return <p>Hello {data?.currentUser?.name}</p>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrentUser />
    </QueryClientProvider>
  );
}

export default App;
