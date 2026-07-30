import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import styles from './NotFoundPage.module.css';

/**
 * Fallback ruta (`path="*"`) — pogrešan ili star URL. Bez nje React Router
 * ne uparuje ništa i strana ostaje prazna, pa korisnik ne zna ni gde je
 * ni kuda dalje. Papirić sa "otkucanom" porukom, u stilu ostatka sajta.
 */
export default function NotFoundPage() {
    const { pathname } = useLocation();

    return (
        <div className={styles.stranica}>
            <motion.div
                className={styles.papir}
                initial={{ opacity: 0, y: 30, rotate: -2.4 }}
                animate={{ opacity: 1, y: 0, rotate: -1.2 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
                <span className={styles.tape} />

                <span className={styles.eyeb}>greška</span>
                <div className={styles.broj} aria-hidden="true">404</div>

                <h1 className={styles.naslov}>Ove strane nema na meniju</h1>
                <p className={styles.tekst}>
                    Link je možda star, ili smo stranu skinuli sa ponude.
                    Vrati se na meni, tamo sve stoji na svom mestu.
                </p>

                {/* Da korisnik vidi šta je tačno pokušao — pomaže i kad nam prijavi grešku. */}
                <code className={styles.putanja}>{pathname}</code>

                <div className={styles.dugmad}>
                    <Link to="/meni" className={styles.primarno}>Nazad na meni</Link>
                    <Link to="/" className={styles.sekundarno}>Na početnu</Link>
                </div>
            </motion.div>
        </div>
    );
}
