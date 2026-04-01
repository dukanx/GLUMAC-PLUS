import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';

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

    const [forma, setForma] = useState<RegisterForm>({
        ime: '',
        email: '',
        lozinka: '',
        potvrda: '',
    });

    const [greske, setGreske] = useState<FieldErrors>({});
    const [serverGreska, setServerGreska] = useState('');
    const [ucitava, setUcitava] = useState(false);

    // Menja jedno polje u formi
    const handlePromena = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForma(prev => ({ ...prev, [name]: value }));
        // Briše grešku za to polje čim korisnik počne da kuca
        setGreske(prev => ({ ...prev, [name]: undefined }));
    };

    // Klijentska validacija pre slanja
    const validiraj = (): boolean => {
        const nove: FieldErrors = {};

        if (!forma.ime.trim()) {
            nove.ime = 'Ime je obavezno';
        }

        if (!forma.email.trim()) {
            nove.email = 'Email je obavezan';
        } else if (!/\S+@\S+\.\S+/.test(forma.email)) {
            nove.email = 'Email nije ispravan';
        }

        if (!forma.lozinka) {
            nove.lozinka = 'Lozinka je obavezna';
        } else if (forma.lozinka.length < 8) {
            nove.lozinka = 'Lozinka mora imati najmanje 8 karaktera';
        }

        if (!forma.potvrda) {
            nove.potvrda = 'Potvrdite lozinku';
        } else if (forma.lozinka !== forma.potvrda) {
            nove.potvrda = 'Lozinke se ne poklapaju';
        }

        setGreske(nove);
        return Object.keys(nove).length === 0; // true = nema grešaka
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validiraj()) return;

        setUcitava(true);
        setServerGreska('');

        try {
            const response = await fetch('http://localhost:8080/api/korisnici', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ime: forma.ime,
                    email: forma.email,
                    lozinka: forma.lozinka,
                }),
            });

            if (response.ok) {
                // Uspešna registracija → na login sa porukom
                navigate('/login?registered=true');
            } else {
                const data = await response.json().catch(() => null);

                // Backend validacione greške (mapa po poljima)
                if (data?.errors) {
                    setGreske(data.errors);
                } else {
                    setServerGreska(data?.message ?? 'Došlo je do greške. Pokušajte ponovo.');
                }
            }
        } catch {
            setServerGreska('Server ne odgovara. Proverite konekciju.');
        } finally {
            setUcitava(false);
        }
    };

    return (
        <div className={styles.stranica}>
            <div className={styles.kartica}>

                <div className={styles.header}>
                    <Link to="/" className={styles.nazad}>← Početna</Link>
                    <h1 className={styles.naslov}>Kreiraj nalog</h1>
                    <p className={styles.podnaslov}>
                        Pridruži se i počni da skupljaš bodove
                    </p>
                </div>

                {serverGreska && (
                    <div className={styles.serverGreska}>
                        {serverGreska}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.forma} noValidate>

                    <div className={styles.polje}>
                        <label htmlFor="ime" className={styles.labela}>Ime</label>
                        <input
                            id="ime"
                            name="ime"
                            type="text"
                            value={forma.ime}
                            onChange={handlePromena}
                            placeholder="Marko Marković"
                            className={`${styles.input} ${greske.ime ? styles.inputGreska : ''}`}
                            autoComplete="name"
                        />
                        {greske.ime && <span className={styles.greska}>{greske.ime}</span>}
                    </div>

                    <div className={styles.polje}>
                        <label htmlFor="email" className={styles.labela}>Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={forma.email}
                            onChange={handlePromena}
                            placeholder="marko@email.com"
                            className={`${styles.input} ${greske.email ? styles.inputGreska : ''}`}
                            autoComplete="email"
                        />
                        {greske.email && <span className={styles.greska}>{greske.email}</span>}
                    </div>

                    <div className={styles.polje}>
                        <label htmlFor="lozinka" className={styles.labela}>Lozinka</label>
                        <input
                            id="lozinka"
                            name="lozinka"
                            type="password"
                            value={forma.lozinka}
                            onChange={handlePromena}
                            placeholder="Minimum 8 karaktera"
                            className={`${styles.input} ${greske.lozinka ? styles.inputGreska : ''}`}
                            autoComplete="new-password"
                        />
                        {greske.lozinka && <span className={styles.greska}>{greske.lozinka}</span>}
                    </div>

                    <div className={styles.polje}>
                        <label htmlFor="potvrda" className={styles.labela}>Potvrdi lozinku</label>
                        <input
                            id="potvrda"
                            name="potvrda"
                            type="password"
                            value={forma.potvrda}
                            onChange={handlePromena}
                            placeholder="Ponovi lozinku"
                            className={`${styles.input} ${greske.potvrda ? styles.inputGreska : ''}`}
                            autoComplete="new-password"
                        />
                        {greske.potvrda && <span className={styles.greska}>{greske.potvrda}</span>}
                    </div>

                    <button
                        type="submit"
                        className={styles.dugme}
                        disabled={ucitava}
                    >
                        {ucitava ? 'Kreiram nalog...' : 'Kreiraj nalog'}
                    </button>

                </form>

                <p className={styles.loginLink}>
                    Već imaš nalog?{' '}
                    <Link to="/login">Prijavi se</Link>
                </p>

            </div>
        </div>
    );
}