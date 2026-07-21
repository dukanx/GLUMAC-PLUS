import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAktivnaPorudzbina } from '../context/AktivnaPorudzbinaContext';
import { tipLabela } from '../types/porudzbina';
import { Klose } from './Doodle';
import styles from './StatusPorudzbine.module.css';

// Koraci mini-priznanice: backend status → indeks aktivnog koraka.
const KORACI = ['PRIMLJENO', 'U PRIPREMI', 'SPREMNA'];

function korakIndex(status?: string): number {
    if (status === 'NOVA') return 0;
    if (status === 'U_PRIPREMI') return 1;
    if (status === 'SPREMNA') return 2;
    if (status === 'REALIZOVANA') return 2;
    return 0;
}

function stikerTekst(status?: string): string {
    if (status === 'NOVA') return 'čekamo potvrdu kuhinje…';
    if (status === 'U_PRIPREMI') return 'upravo se sprema';
    if (status === 'SPREMNA') return 'spremna je — dođi po nju!';
    if (status === 'REALIZOVANA') return 'preuzeta — prijatno!';
    if (status === 'OTKAZANA') return 'otkazana';
    return 'učitavanje…';
}

function gotovoOko(preostaloMin: number): string {
    const t = new Date(Date.now() + preostaloMin * 60000);
    return `${t.getHours()}:${String(t.getMinutes()).padStart(2, '0')}`;
}

/**
 * Praćenje aktivne porudžbine — otvara se klikom na floating dugme:
 * popover iznad njega na desktopu, bottom sheet na mobilnom.
 * Ne vodi nigde — ostaješ na strani; minuti se osvežavaju sami.
 */
export default function StatusPorudzbine() {
    const {
        aktivnaId, porudzbina, preostaloMin,
        pracenjeOtvoreno, zatvoriPracenje,
    } = useAktivnaPorudzbina();

    const prikazano = aktivnaId !== null && pracenjeOtvoreno;
    const status = porudzbina?.status;
    const otkazana = status === 'OTKAZANA';
    const preuzeta = status === 'REALIZOVANA';
    const spremna = status === 'SPREMNA' || preuzeta;
    const aktivniKorak = korakIndex(status);

    return (
        <AnimatePresence>
            {prikazano && (
                <>
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={zatvoriPracenje}
                    />
                    <motion.div
                        className={styles.kartica}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.6 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 90) zatvoriPracenje();
                        }}
                    >
                        <div className={styles.rucka} />
                        <span className={styles.stiker}>{stikerTekst(status)}</span>

                        <div className={styles.zaglavlje}>
                            <span className={styles.naslov}>Porudžbina #{aktivnaId}</span>
                            <div className={styles.vreme}>
                                {preuzeta ? (
                                    <span className={styles.vremeMinZel}>✓</span>
                                ) : spremna ? (
                                    <span className={styles.vremeMinZel}>sad!</span>
                                ) : preostaloMin !== null && preostaloMin > 0 ? (
                                    <>
                                        <span className={styles.vremeMin}>~{preostaloMin} min</span>
                                        <span className={styles.vremeOko}>
                                            gotovo oko {gotovoOko(preostaloMin)}
                                        </span>
                                    </>
                                ) : preostaloMin !== null ? (
                                    <span className={styles.vremeMin}>još malo…</span>
                                ) : null}
                            </div>
                        </div>

                        {otkazana ? (
                            <p className={styles.porukaRust}>
                                Porudžbina je otkazana. Zatvori ovu karticu — vidimo se sledeći put!
                            </p>
                        ) : (
                            <div className={styles.koraci}>
                                <div className={styles.korakLinija} />
                                {KORACI.map((labela, i) => {
                                    const proslo = i < aktivniKorak
                                        || (i === aktivniKorak && spremna);
                                    const aktivan = i === aktivniKorak && !spremna;
                                    return (
                                        <div key={labela} className={styles.korak}>
                                            <span className={
                                                proslo ? styles.tackaProslo
                                                    : aktivan ? styles.tackaAktivna
                                                        : styles.tackaBuduca
                                            }>
                                                {proslo
                                                    ? '✓'
                                                    : aktivan && i === 1
                                                        ? <Klose size={14} strokeWidth={2.4} />
                                                        : null}
                                            </span>
                                            <span className={
                                                aktivan ? styles.korakLabelaAktivna
                                                    : proslo ? styles.korakLabela
                                                        : styles.korakLabelaBuduca
                                            }>
                                                {labela}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {porudzbina && porudzbina.stavke.length > 0 && !otkazana && (
                            <div className={styles.stavke}>
                                {porudzbina.stavke.map((s, i) => (
                                    <div key={i} className={styles.stavka}>
                                        <span className={styles.stavkaKol}>{s.kolicina}×</span>
                                        <span>{s.nazivProizvoda}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={styles.dno}>
                            <span className={styles.iznos}>
                                {porudzbina ? (
                                    <>
                                        <b>{porudzbina.ukupanIznos.toLocaleString('sr-RS')} RSD</b>
                                        {porudzbina.tipPorudzbine ? ` · ${tipLabela(porudzbina.tipPorudzbine)}` : ''}
                                    </>
                                ) : 'učitavanje…'}
                            </span>
                            <Link to="/istorija" className={styles.sveLink} onClick={zatvoriPracenje}>
                                sve porudžbine →
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
