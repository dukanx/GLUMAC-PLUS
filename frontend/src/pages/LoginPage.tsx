import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import styles from './LoginPage.module.css';
import { useAuth } from '../context/AuthContext';


export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Čita ?registered=true iz URL-a (dolazi sa RegisterPage)
  const justRegistered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [greska, setGreska] = useState('');
  const [ucitava, setUcitava] = useState(false);
  const { login } = useAuth();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska('');
    setUcitava(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lozinka }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.korisnik, data.token);
        navigate('/meni');
      } else {
        const data = await response.json().catch(() => null);
        setGreska(data?.message ?? 'Pogrešan email ili lozinka.');
      }
    } catch {
      setGreska('Server ne odgovara. Proverite konekciju.');
    } finally {
      setUcitava(false);
    }
  };

  return (
    <div className={styles.stranica}>
      <div className={styles.kartica}>

        <div className={styles.header}>
          <Link to="/" className={styles.nazad}>← Početna</Link>
          <h1 className={styles.naslov}>Dobrodošli</h1>
          <p className={styles.podnaslov}>Prijavite se na vaš nalog</p>
        </div>

        {/* Poruka posle uspešne registracije */}
        {justRegistered && (
          <div className={styles.uspesnaPoruka}>
            ✓ Nalog je kreiran! Prijavite se.
          </div>
        )}

        {greska && (
          <div className={styles.serverGreska}>{greska}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.forma} noValidate>

          <div className={styles.polje}>
            <label htmlFor="email" className={styles.labela}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="marko@email.com"
              className={styles.input}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.polje}>
            <label htmlFor="lozinka" className={styles.labela}>Lozinka</label>
            <input
              id="lozinka"
              type="password"
              value={lozinka}
              onChange={e => setLozinka(e.target.value)}
              placeholder="Vaša lozinka"
              className={styles.input}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.dugme}
            disabled={ucitava}
          >
            {ucitava ? 'Prijavljujem...' : 'Prijavi se'}
          </button>

        </form>

        <p className={styles.registerLink}>
          Nemaš nalog?{' '}
          <Link to="/register">Registruj se</Link>
        </p>

      </div>
    </div>
  );
}