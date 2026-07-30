import { useState } from 'react';
import { Oko, OkoPrecrtano } from './Doodle';
import styles from '../pages/Auth.module.css';

interface Props {
    id: string;
    name?: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    autoComplete: string;
    greska?: string;
    required?: boolean;
}

/**
 * Polje za lozinku sa okom za prikaz/skrivanje. Isto se koristi na prijavi i na
 * registraciji (tamo dvaput), pa stanje „vidi se / ne vidi se" živi po polju —
 * potvrda lozinke se otkriva nezavisno od same lozinke.
 */
export default function PoljeLozinke({
    id, name, label, value, onChange, placeholder, autoComplete, greska, required,
}: Props) {
    const [vidljiva, setVidljiva] = useState(false);

    return (
        <div className={styles.polje}>
            <label htmlFor={id} className={styles.lab}>{label}</label>
            <div className={styles.lozOmot}>
                <input
                    id={id}
                    name={name}
                    type={vidljiva ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`${styles.inp} ${styles.inpLoz} ${greska ? styles.inpErr : ''}`}
                    autoComplete={autoComplete}
                    required={required}
                />
                {/* type="button" da klik ne pošalje formu. */}
                <button
                    type="button"
                    className={styles.oko}
                    onClick={() => setVidljiva(v => !v)}
                    aria-label={vidljiva ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                    aria-pressed={vidljiva}
                    title={vidljiva ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                >
                    {vidljiva ? <Oko size={22} /> : <OkoPrecrtano size={22} />}
                </button>
            </div>
            {greska && <span className={styles.err}>{greska}</span>}
        </div>
    );
}
