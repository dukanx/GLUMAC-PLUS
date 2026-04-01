import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ChefHat, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPage.module.css';

type Status = 'U_PRIPREMI' | 'SPREMNA' | 'REALIZOVANA' | 'OTKAZANA';

interface StavkaPorudzbine {
    nazivProizvoda: string;
    kolicina: number;
    cena: number;
}

interface Porudzbina {
    porudzbinaId: number;
    datum: string;
    status: Status;
    ukupanIznos: number;
    korisnikIme?: string;
    stavke: StavkaPorudzbine[];
}

const STATUS_CONFIG: Record<Status, { labela: string; boja: string; ikona: React.ElementType }> = {
    U_PRIPREMI: { labela: 'Na čekanju', boja: '#bb9162', ikona: Clock },
    SPREMNA: { labela: 'U pripremi', boja: '#865337', ikona: ChefHat },
    REALIZOVANA: { labela: 'Realizovana', boja: '#354119', ikona: CheckCircle2 },
    OTKAZANA: { labela: 'Otkazana', boja: '#f58089', ikona: XCircle },
};

export default function AdminPage() {
    const { korisnik, token } = useAuth();
    const navigate = useNavigate();

    const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);
    const [ucitava, setUcitava] = useState(true);
    const [filterStatus, setFilterStatus] = useState<Status | 'SVE'>('SVE');
    const [azurira, setAzurira] = useState<number | null>(null);

    // Provera uloge
    useEffect(() => {
        if (!korisnik) {
            navigate('/login');
            return;
        }
        const uloga = (korisnik as any).uloga;
        if (uloga !== 'ADMIN' && uloga !== 'ZAPOSLENI') {
            navigate('/');
        }
    }, [korisnik, navigate]);

    const fetchPorudzbine = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(
                'http://localhost:8080/api/porudzbine/page?page=0&size=100',
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (res.ok) {
                const data = await res.json();
                setPorudzbine(data.content ?? data);
            }
        } catch {
            console.error('Greška pri učitavanju');
        } finally {
            setUcitava(false);
        }
    }, [token]);

    // Inicijalno učitavanje + auto-refresh svakih 15s
    useEffect(() => {
        fetchPorudzbine();
        const interval = setInterval(fetchPorudzbine, 15000);
        return () => clearInterval(interval);
    }, [fetchPorudzbine]);

    const promeniStatus = async (id: number, noviStatus: Status) => {
        if (!token) return;
        setAzurira(id);
        try {
            const res = await fetch(
                `http://localhost:8080/api/porudzbine/${id}/status?status=${noviStatus}`,
                {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (res.ok) {
                setPorudzbine(prev =>
                    prev.map(p => p.porudzbinaId === id ? { ...p, status: noviStatus } : p)
                );
            }
        } catch {
            console.error('Greška pri promeni statusa');
        } finally {
            setAzurira(null);
        }
    };

    const formatDatum = (datum: string) =>
        new Date(datum).toLocaleString('sr-RS', {
            day: '2-digit', month: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

    const filtrirane = filterStatus === 'SVE'
        ? porudzbine
        : porudzbine.filter(p => p.status === filterStatus);

    return (
        <div className={styles.stranica}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.naslov}>Panel za porudžbine</h1>
                    <p className={styles.podnaslov}>
                        {filtrirane.length} porudžbina · Auto-refresh svakih 15s
                    </p>
                </div>
                <button className={styles.refreshBtn} onClick={fetchPorudzbine}>
                    <RefreshCw size={16} />
                    Osveži
                </button>
            </div>

            {/* Filter tabovi */}
            <div className={styles.tabovi}>
                {(['SVE', 'U_PRIPREMI', 'SPREMNA', 'REALIZOVANA', 'OTKAZANA'] as const).map(s => (
                    <button
                        key={s}
                        className={`${styles.tab} ${filterStatus === s ? styles.tabAktivan : ''}`}
                        onClick={() => setFilterStatus(s)}
                    >
                        {s === 'SVE' ? 'Sve' : STATUS_CONFIG[s].labela}
                        {s !== 'SVE' && (
                            <span className={styles.tabBroj}>
                                {porudzbine.filter(p => p.status === s).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Lista */}
            {ucitava ? (
                <div className={styles.ucitava}>Učitavam porudžbine...</div>
            ) : filtrirane.length === 0 ? (
                <div className={styles.prazno}>Nema porudžbina</div>
            ) : (
                <div className={styles.lista}>
                    <AnimatePresence initial={false}>
                        {filtrirane.map(p => {
                            const config = STATUS_CONFIG[p.status];
                            const Ikona = config.ikona;

                            return (
                                <motion.div
                                    key={p.porudzbinaId}
                                    className={styles.kartica}
                                    layout
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    {/* Kartica header */}
                                    <div className={styles.karticaHeader}>
                                        <div className={styles.karticaLevo}>
                                            <span className={styles.karticaId}>#{p.porudzbinaId}</span>
                                            <span className={styles.karticaDatum}>
                                                {formatDatum(p.datum)}
                                            </span>
                                        </div>
                                        <span
                                            className={styles.statusBadge}
                                            style={{ background: config.boja }}
                                        >
                                            <Ikona size={13} />
                                            {config.labela}
                                        </span>
                                    </div>

                                    {/* Stavke */}
                                    <div className={styles.stavke}>
                                        {p.stavke?.map((s, i) => (
                                            <div key={`${p.porudzbinaId}-stavka-${i}`} className={styles.stavka}>
                                                <span>{s.nazivProizvoda}</span>
                                                <span className={styles.stavkaKolicina}>× {s.kolicina}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className={styles.karticaFooter}>
                                        <span className={styles.ukupno}>
                                            {p.ukupanIznos} RSD
                                        </span>

                                        {/* Akcije */}
                                        <div className={styles.akcije}>
                                            {p.status === 'U_PRIPREMI' && (
                                                <>
                                                    <motion.button
                                                        className={`${styles.akcijaBtn} ${styles.akcijaPrihvati}`}
                                                        onClick={() => promeniStatus(p.porudzbinaId, 'SPREMNA')}
                                                        disabled={azurira === p.porudzbinaId}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <ChefHat size={14} />
                                                        Prihvati
                                                    </motion.button>
                                                    <motion.button
                                                        className={`${styles.akcijaBtn} ${styles.akcijaOtkazi}`}
                                                        onClick={() => promeniStatus(p.porudzbinaId, 'OTKAZANA')}
                                                        disabled={azurira === p.porudzbinaId}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <XCircle size={14} />
                                                        Otkaži
                                                    </motion.button>
                                                </>
                                            )}
                                            {p.status === 'SPREMNA' && (
                                                <motion.button
                                                    className={`${styles.akcijaBtn} ${styles.akcijaGotovo}`}
                                                    onClick={() => promeniStatus(p.porudzbinaId, 'REALIZOVANA')}
                                                    disabled={azurira === p.porudzbinaId}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Gotovo
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}