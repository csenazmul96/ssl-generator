export interface Domain {
  id: string;
  name: string;
  status: 'active' | 'expired' | 'pending';
}

export const domains: Domain[] = [
  { id: '1', name: 'example.com', status: 'active' },
  { id: '2', name: 'test-site.org', status: 'pending' },
  { id: '3', name: 'localhost.dev', status: 'expired' },
  { id: '4', name: 'my-app.net', status: 'active' },
  { id: '5', name: 'csenazmul.com', status: 'active' },
  { id: '6', name: 'isacc.kr', status: 'active' },
];
