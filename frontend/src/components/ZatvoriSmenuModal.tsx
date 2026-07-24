import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import * as smenaApi from '../api/smena';
import styles from '../pages/PanelPorudzbina.module.css';

/* ─── Modal: zatvori smenu ─────────────────────────────────── */
export default function ZatvoriSmenuModal({ onClose, onZatvoreno }: { onClose: () => void; onZatvoreno: () => void }) {
    const [stat, setStat] = useState<smenaApi.SmenaStat | null>(null);
    const [zatvara, setZatvara] = useState(false);
    const [gotovo, setGotovo] = useState(false);

    useEffect(() => { smenaApi.pregledSmene().then(setStat).catch(() => { }); }, []);

    const potvrdi = async () => {
        setZatvara(true);
        try {
            const r = await smenaApi.zatvoriSmenu();
            setStat(r);
            setGotovo(true);
            onZatvoreno();
        } catch { /* tiho */ } finally {
            setZatvara(false);
        }
    };

    return (
        <motion.div className={styles.popupOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div
                className={styles.smenaModal}
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            >
                <span className={styles.smenaEyeb}>kraj radnog dana</span>
                <h2 className={styles.smenaNaslov}>{gotovo ? 'Smena zatvorena.' : 'Zatvori smenu?'}</h2>

                <div className={styles.smenaStats}>
                    <div className={styles.smenaStat}>
                        <span className={styles.smenaBroj}>{stat ? stat.brojPorudzbina : '—'}</span>
                        <span className={styles.smenaLbl}>porudžbine</span>
                    </div>
                    <div className={styles.smenaStat}>
                        <span className={styles.smenaBroj}>{stat ? stat.promet.toLocaleString('sr-RS') : '—'}</span>
                        <span className={styles.smenaLbl}>RSD prometa</span>
                    </div>
                    <div className={styles.smenaStat}>
                        <span className={styles.smenaBroj}>~{stat ? stat.prosecnaPriprema : '—'} min</span>
                        <span className={styles.smenaLbl}>prosečna priprema</span>
                    </div>
                </div>

                <p className={styles.smenaNota}>
                    ✓ proizvodi skinuti „do kraja smene" se vraćaju u ponudu{gotovo ? '' : ' pri zatvaranju'}
                    {stat && stat.proizvodaZaVracanje > 0 && (
                        <> — <b>{stat.proizvodaZaVracanje}</b> {gotovo ? 'vraćeno' : 'čeka'}</>
                    )}
                </p>

                <div className={styles.smenaAkcije}>
                    {gotovo ? (
                        <button className={styles.smenaPotvrdi} onClick={onClose}>U redu</button>
                    ) : (
                        <>
                            <button className={styles.smenaNazad} onClick={onClose} disabled={zatvara}>Ne još</button>
                            <button className={styles.smenaPotvrdi} onClick={potvrdi} disabled={zatvara}>
                                {zatvara ? 'Zatvaram…' : 'Zatvori smenu'}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
