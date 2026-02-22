import { useQuery } from '@tanstack/react-query';

type HelloResponse = { message: string };

async function fetchHello(): Promise<HelloResponse> {
  // Simulate a small delay / API call. Replace with real API call later.
  await new Promise<void>((resolve) => setTimeout(resolve, 700));
  return { message: 'Hello from React Query!' };
}

export default function useHelloQuery() {
  // React Query v5 prefers the object-based API for useQuery
  return useQuery({
    queryKey: ['hello'],
    queryFn: fetchHello,
    staleTime: 1000 * 30,
  });
}
