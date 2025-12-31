import { domains } from '@/data/domains';
import DomainList from '@/components/DomainList';

export default function Home() {
  return (
    <main className="container">
      <div className="header">
        <h1 className="title">
          SSL Central
        </h1>
        <p className="subtitle">
          Manage and issue public SSL certificates for your centralized domains directly.
        </p>
      </div>

      <DomainList domains={domains} />

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
        <p>&copy; {new Date().getFullYear()} Secured by Let&apos;s Encrypt & ACME.</p>
      </footer>
    </main>
  );
}
