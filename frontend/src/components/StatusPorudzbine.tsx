import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Clock, ChefHat, XCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './StatusPorudzbine.module.css';
import type { StatusPorudzbine } from '../types/porudzbina';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

interface Props {
    porudzbinaId: number;
    onZatvori: () => void;
    onZavrseno: () => void;
}

const KORACI = [
    { status: 'U_PRIPREMI', labela: 'Primljeno', ikona: Clock },
    { status: 'SPREMNA', labela: 'U pripremi', ikona: ChefHat },
    { status: 'REALIZOVANA', labela: 'Gotovo!', ikona: CheckCircle2 },
];

function getKorakIndex(status: StatusPorudzbine): number {
    if (status === 'U_PRIPREMI') return 0;
    if (status === 'SPREMNA') return 1;
    if (status === 'REALIZOVANA') return 2;
    return -1;
}

export default function StatusPorudzbine({ porudzbinaId, onZatvori, onZavrseno }: Props) {
    const { token } = useAuth();
    const [status, setStatus] = useState<StatusPorudzbine>('U_PRIPREMI');
    const [procenjenoVreme, setProcenjenoVreme] = useState<number | null>(null);
    const [greska, setGreska] = useState(false);

    const zavrseno = status === 'REALIZOVANA' || status === 'OTKAZANA';

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(
                    `${API}/api/porudzbine/${porudzbinaId}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data.status);
                    setProcenjenoVreme(data.procenjenoVreme ?? null);
                }
            } catch {
                setGreska(true);
            }
        };

        fetchStatus(); // odmah jednom

        if (zavrseno) return; // ne pokrecemo interval ako je završeno

        const interval = setInterval(fetchStatus, 8000); // svakih 8s
        return () => clearInterval(interval); 
    }, [porudzbinaId, token, zavrseno]);

    const aktivniKorak = getKorakIndex(status);

    return (
        <AnimatePresence>
            <motion.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onZatvori}
            >
                <motion.div
                    className={styles.modal}
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={styles.header}>
                        <div>
                            <h2 className={styles.naslov}>Porudžbina #{porudzbinaId}</h2>
                            <p className={styles.podnaslov}>
                                {zavrseno ? 'Završeno' : 'Pratimo status...'}
                            </p>
                        </div>
                        {zavrseno && (
                            <button className={styles.zatvoriBtn} onClick={onZatvori}>
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* OTKAZANA state */}
                    {status === 'OTKAZANA' ? (
                        <div className={styles.otkazano}>
                            <XCircle size={56} className={styles.otkazanoIkona} />
                            <p className={styles.otkazanoTekst}>Porudžbina je otkazana</p>
                            <button className={styles.dugme} onClick={() => {
                                onZavrseno();
                                onZatvori();
                            }}>
                                Zatvori
                            </button>
                        </div>

                    ) : (
                        <>
                            {/* Progress koraci */}
                            <div className={styles.koraci}>
                                {KORACI.map((korak, i) => {
                                    const prosao = i <= aktivniKorak;
                                    const aktivan = i === aktivniKorak;
                                    const Ikona = korak.ikona;

                                    return (
                                        <div key={korak.status} className={styles.korakWrap}>
                                            {/* Linija između koraka */}
                                            {i > 0 && (
                                                <div className={styles.linija}>
                                                    <motion.div
                                                        className={styles.linijaPopunjena}
                                                        initial={{ scaleX: 0 }}
                                                        animate={{ scaleX: i <= aktivniKorak ? 1 : 0 }}
                                                        transition={{ duration: 0.5, delay: 0.2 }}
                                                        style={{ transformOrigin: 'left' }}
                                                    />
                                                </div>
                                            )}

                                            {/* Krug */}
                                            <motion.div
                                                className={`${styles.korak} ${prosao ? styles.korakProsao : ''} ${aktivan ? styles.korakAktivan : ''}`}
                                                animate={aktivan ? { scale: [1, 1.12, 1] } : {}}
                                                transition={{ duration: 1.2, repeat: Infinity }}
                                            >
                                                <Ikona size={22} />
                                            </motion.div>

                                            <span className={`${styles.korakLabela} ${prosao ? styles.korakLabelaProsao : ''}`}>
                                                {korak.labela}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Poruka */}
                            <div className={styles.poruka}>
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={status}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        className={styles.porukaText}
                                    >
                                        {status === 'U_PRIPREMI' && 'Vaša porudžbina je primljena! Čekamo potvrdu kuhinje...'}
                                        {status === 'SPREMNA' && (
                                            procenjenoVreme
                                                ? `Vaša porudžbina je prihvaćena i procenjeno vreme čekanja je ${procenjenoVreme} minuta.`
                                                : 'Palačinke se prave! Uskoro su gotove.'
                                        )}
                                        {status === 'REALIZOVANA' && 'Gotovo! Dođite po svoju porudžbinu na kasu.'}
                                    </motion.p>
                                </AnimatePresence>
                            </div>

                            {zavrseno && (
                                <button className={styles.dugme} onClick={() => {
                                    onZavrseno();
                                    onZatvori();
                                }}>
                                    Zatvori
                                </button>
                            )}
                        </>
                    )}

                    {greska && (
                        <p className={styles.greska}>
                            Problem sa konekcijom. Status možda nije ažuran.
                        </p>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
