import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import styles from './Auth.module.css';
import * as authApi from '../api/auth';
import { ApiError } from '../api/client';

interface RegisterForm {
    ime: string;
    email: string;
    lozinka: string;
    potvrda: string;
}

interface FieldErrors {
    ime?: string;
    email?: string;
    lozinka?: string;
    potvrda?: string;
}

export default function RegisterPage() {
    const navigate = useNavigate();

    const [forma, setForma] = useState<RegisterForm>({ ime: '', email: '', lozinka: '', potvrda: '' });
    const [greske, setGreske] = useState<FieldErrors>({});
    const [serverGreska, setServerGreska] = useState('');
    const [ucitava, setUcitava] = useState(false);

    const handlePromena = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForma(prev => ({ ...prev, [name]: value }));
        setGreske(prev => ({ ...prev, [name]: undefined }));
    };

    const validiraj = (): boolean => {
        const nove: FieldErrors = {};
        if (!forma.ime.trim()) nove.ime = 'ime je obavezno';
        if (!forma.email.trim()) nove.email = 'email je obavezan';
        else if (!/\S+@\S+\.\S+/.test(forma.email)) nove.email = 'email nije ispravan';
        if (!forma.lozinka) nove.lozinka = 'lozinka je obavezna';
        else if (forma.lozinka.length < 8) nove.lozinka = 'minimum 8 karaktera';
        if (!forma.potvrda) nove.potvrda = 'potvrdi lozinku';
        else if (forma.lozinka !== forma.potvrda) nove.potvrda = 'lozinke se ne poklapaju';
        setGreske(nove);
        return Object.keys(nove).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validiraj()) return;
        setUcitava(true);
        setServerGreska('');
        try {
            await authApi.register(forma.ime, forma.email, forma.lozinka);
            navigate('/login?registered=true');
        } catch (e) {
            if (e instanceof ApiError && e.body?.errors) setGreske(e.body.errors);
            else if (e instanceof ApiError) setServerGreska(e.body?.message ?? 'Došlo je do greške. Pokušaj ponovo.');
            else setServerGreska('Server ne odgovara. Proveri konekciju.');
        } finally {
            setUcitava(false);
        }
    };

    return (
        <div className={styles.stranica}>
            {/* Doodle dekoracije */}
            <svg className={styles.doodle} style={{ top: '14%', right: '22%', width: 50, color: 'hsl(14 65% 44% / .35)', transform: 'rotate(12deg)' }} viewBox="0 0 60 60" fill="none"><path d="M30 8 C 22 2, 8 8, 9 19 C 10 30, 22 38, 30 45 C 38 38, 50 30, 51 19 C 52 8, 38 2, 30 8 Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" /></svg>
            <svg className={styles.doodle} style={{ top: '18%', left: '19%', width: 64, color: 'hsl(22 30% 14% / .25)', transform: 'rotate(-9deg)' }} viewBox="0 0 80 50" fill="none"><ellipse cx="40" cy="25" rx="34" ry="16" stroke="currentColor" strokeWidth="2.6" /><path d="M14 22 C 26 14, 54 14, 66 22" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
            <svg className={styles.doodle} style={{ bottom: '16%', left: '15%', width: 38, color: 'hsl(14 65% 44% / .3)', transform: 'rotate(-15deg)' }} viewBox="0 0 60 60" fill="none"><path d="M30 6 C 32 12, 34 17, 36.5 22.5 C 42 23, 48 23.2, 54 23.5 C 49.5 27.2, 45 30.8, 40.5 34.5 C 42.2 40.2, 43.8 45.8, 45.5 51.5 C 40.3 48.2, 35.2 44.8, 30 41.5 C 24.8 44.8, 19.7 48.2, 14.5 51.5 C 16.2 45.8, 17.8 40.2, 19.5 34.5 C 15 30.8, 10.5 27.2, 6 23.5 C 12 23.2, 18 23, 23.5 22.5 C 25.7 17, 27.8 12, 30 6 Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" /></svg>
            <svg className={styles.doodle} style={{ bottom: '22%', right: '16%', width: 56, color: 'hsl(22 30% 14% / .22)', transform: 'rotate(10deg)' }} viewBox="0 0 70 55" fill="none"><path d="M12 44 C 8 30, 14 12, 30 10 C 48 8, 60 20, 58 34 C 56 46, 40 50, 30 46" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /><path d="M24 24 C 26 22, 28 22, 30 24 M 40 24 C 42 22, 44 22, 46 24" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /><path d="M28 34 C 32 38, 40 38, 44 34" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>

            <motion.div
                className={styles.kartica}
                style={{ rotate: -0.5 }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <span className={styles.tape} />
                <span className={styles.eyeb}>registracija</span>
                <h1 className={styles.naslov}>Napravi nalog.</h1>

                {serverGreska && <div className={styles.srvErr} style={{ marginTop: 22 }}>{serverGreska}</div>}

                <form onSubmit={handleSubmit} className={styles.forma} noValidate>
                    <div className={styles.polje}>
                        <label htmlFor="ime" className={styles.lab}>ime</label>
                        <input
                            id="ime" name="ime" type="text"
                            value={forma.ime}
                            onChange={handlePromena}
                            placeholder="Marko Marković"
                            className={`${styles.inp} ${greske.ime ? styles.inpErr : ''}`}
                            autoComplete="name"
                        />
                        {greske.ime && <span className={styles.err}>{greske.ime}</span>}
                    </div>

                    <div className={styles.polje}>
                        <label htmlFor="email" className={styles.lab}>email</label>
                        <input
                            id="email" name="email" type="email"
                            value={forma.email}
                            onChange={handlePromena}
                            placeholder="marko@email.com"
                            className={`${styles.inp} ${greske.email ? styles.inpErr : ''}`}
                            autoComplete="email"
                        />
                        {greske.email && <span className={styles.err}>{greske.email}</span>}
                    </div>

                    <div className={styles.polje}>
                        <label htmlFor="lozinka" className={styles.lab}>lozinka</label>
                        <input
                            id="lozinka" name="lozinka" type="password"
                            value={forma.lozinka}
                            onChange={handlePromena}
                            placeholder="minimum 8 karaktera"
                            className={`${styles.inp} ${greske.lozinka ? styles.inpErr : ''}`}
                            autoComplete="new-password"
                        />
                        {greske.lozinka && <span className={styles.err}>{greske.lozinka}</span>}
                    </div>

                    <div className={styles.polje}>
                        <label htmlFor="potvrda" className={styles.lab}>potvrdi lozinku</label>
                        <input
                            id="potvrda" name="potvrda" type="password"
                            value={forma.potvrda}
                            onChange={handlePromena}
                            placeholder="ponovi lozinku"
                            className={`${styles.inp} ${greske.potvrda ? styles.inpErr : ''}`}
                            autoComplete="new-password"
                        />
                        {greske.potvrda && <span className={styles.err}>{greske.potvrda}</span>}
                    </div>

                    <button type="submit" className={styles.dugme} disabled={ucitava}>
                        {ucitava ? 'Kreiram nalog…' : 'Kreiraj nalog →'}
                    </button>
                </form>

                <p className={styles.prebaci}>
                    već imaš nalog? <Link to="/login">prijavi se</Link>
                </p>
            </motion.div>
        </div>
    );
}
