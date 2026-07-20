import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import styles from './Auth.module.css';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/auth';
import { ApiError } from '../api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
      const data = await authApi.login(email, lozinka);
      login(data.korisnik, data.token);
      navigate('/meni');
    } catch (e) {
      setGreska(e instanceof ApiError
        ? (e.body?.message ?? 'Pogrešan email ili lozinka.')
        : 'Server ne odgovara. Proveri konekciju.');
    } finally {
      setUcitava(false);
    }
  };

  return (
    <div className={styles.stranica}>
      {/* Doodle dekoracije */}
      <svg className={styles.doodle} style={{ top: '16%', left: '20%', width: 54, color: 'hsl(14 65% 44% / .4)', transform: 'rotate(-10deg)' }} viewBox="0 0 60 60" fill="none"><path d="M30 6 C 32 12, 34 17, 36.5 22.5 C 42 23, 48 23.2, 54 23.5 C 49.5 27.2, 45 30.8, 40.5 34.5 C 42.2 40.2, 43.8 45.8, 45.5 51.5 C 40.3 48.2, 35.2 44.8, 30 41.5 C 24.8 44.8, 19.7 48.2, 14.5 51.5 C 16.2 45.8, 17.8 40.2, 19.5 34.5 C 15 30.8, 10.5 27.2, 6 23.5 C 12 23.2, 18 23, 23.5 22.5 C 25.7 17, 27.8 12, 30 6 Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" /></svg>
      <svg className={styles.doodle} style={{ bottom: '18%', right: '21%', width: 64, color: 'hsl(22 30% 14% / .25)', transform: 'rotate(8deg)' }} viewBox="0 0 80 50" fill="none"><ellipse cx="40" cy="25" rx="34" ry="16" stroke="currentColor" strokeWidth="2.6" /><path d="M14 22 C 26 14, 54 14, 66 22" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
      <svg className={styles.doodle} style={{ top: '20%', right: '18%', width: 46, color: 'hsl(22 30% 14% / .22)', transform: 'rotate(14deg)' }} viewBox="0 0 60 60" fill="none"><path d="M30 8 C 22 2, 8 8, 9 19 C 10 30, 22 38, 30 45 C 38 38, 50 30, 51 19 C 52 8, 38 2, 30 8 Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" /></svg>
      <svg className={styles.doodle} style={{ bottom: '16%', left: '17%', width: 44, color: 'hsl(22 30% 14% / .22)', transform: 'rotate(-8deg)' }} viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="20" stroke="currentColor" strokeWidth="2.6" /><path d="M30 18 L 30 30 L 39 35" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>

      <motion.div
        className={styles.kartica}
        style={{ rotate: 0.5 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className={styles.tape} />
        <span className={styles.eyeb}>prijava</span>
        <h1 className={styles.naslov}>Uđi na nalog.</h1>

        {justRegistered && (
          <div className={styles.uspeh} style={{ marginTop: 22 }}>
            ✓ nalog je kreiran — prijavi se
          </div>
        )}
        {greska && <div className={styles.srvErr} style={{ marginTop: 22 }}>{greska}</div>}

        <form onSubmit={handleSubmit} className={styles.forma} noValidate>
          <div className={styles.polje}>
            <label htmlFor="email" className={styles.lab}>email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="marko@email.com"
              className={styles.inp}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.polje}>
            <label htmlFor="lozinka" className={styles.lab}>lozinka</label>
            <input
              id="lozinka"
              type="password"
              value={lozinka}
              onChange={e => setLozinka(e.target.value)}
              placeholder="••••••••"
              className={styles.inp}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className={styles.dugme} disabled={ucitava}>
            {ucitava ? 'Prijavljujem…' : 'Prijavi se →'}
          </button>
        </form>

        <p className={styles.prebaci}>
          nemaš nalog? <Link to="/register">registruj se</Link>
        </p>
      </motion.div>
    </div>
  );
}
