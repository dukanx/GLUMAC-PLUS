import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Trash2, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAktivnaPorudzbina } from '../context/AktivnaPorudzbinaContext';
import { TIP_LABELE, type TipPorudzbine } from '../types/porudzbina';
import styles from './MiniKorpa.module.css';

export default function MiniKorpa() {
    const navigate = useNavigate();
    const { korisnik, token, osvezi, popust } = useAuth();
    const { otvoriStatus } = useAktivnaPorudzbina();
    const { korpa, povecaj, smanji, ukloni, isprazni, ukupnaCena } = useCart();

    const [tipPorudzbine, setTipPorudzbine] = useState<TipPorudzbine>('U_LOKALU');
    const [napomena, setNapomena] = useState('');
    const [porucivanjeUToku, setPorucivanjeUToku] = useState(false);
    const [uspesno, setUspesno] = useState(false);
    const [greska, setGreska] = useState('');

    // Zaokruživanje finalne cene, isto kao na meniju
    const zaPlacanje = popust > 0 ? Math.round(ukupnaCena * (1 - popust / 100)) : ukupnaCena;
    const popustIznos = ukupnaCena - zaPlacanje;

    const handleNaruci = async () => {
        if (!korisnik || !token) {
            navigate('/login');
            return;
        }

        setPorucivanjeUToku(true);
        setGreska('');
        try {
            const res = await fetch('http://localhost:8080/api/porudzbine', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    tipPorudzbine,
                    napomena: napomena.trim() || null,
                    stavke: korpa.map(i => ({
                        proizvodId: i.proizvod.id,
                        kolicina: i.kolicina,
                    })),
                }),
            });

            if (res.ok) {
                const responseData = await res.json().catch(() => null);
                const novaPorudzbinaId: number | null = responseData?.porudzbinaId ?? null;
                isprazni();
                setNapomena('');
                setUspesno(true);
                await osvezi();
                setTimeout(() => {
                    setUspesno(false);
                    if (novaPorudzbinaId) otvoriStatus(novaPorudzbinaId);
                }, 2000);
            } else {
                const data = await res.json().catch(() => null);
                setGreska(data?.message ?? 'Greška prilikom naručivanja.');
            }
        } catch {
            setGreska('Server ne odgovara.');
        } finally {
            setPorucivanjeUToku(false);
        }
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h2 className={styles.naslov}>Korpa</h2>
            </div>

            <div className={styles.sadrzaj}>
                {uspesno ? (
                    <motion.div
                        className={styles.uspesno}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <CheckCircle2 size={44} className={styles.uspesnoIkona} />
                        <p className={styles.uspesnoNaslov}>Porudžbina poslata!</p>
                        <p className={styles.uspesnoSub}>Otvaramo praćenje...</p>
                    </motion.div>

                ) : korpa.length === 0 ? (
                    <div className={styles.prazna}>
                        <ShoppingCart size={36} className={styles.praznaIkona} />
                        <p className={styles.praznaTekst}>Korpa je prazna</p>
                        <p className={styles.praznaSub}>Dodaj palačinke iz menija</p>
                    </div>

                ) : (
                    <div className={styles.stavke}>
                        <AnimatePresence initial={false}>
                            {korpa.map(item => (
                                <motion.div
                                    key={item.proizvod.id}
                                    layout
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className={styles.stavka}
                                >
                                    <div className={styles.stavkaGore}>
                                        <span className={styles.stavkaNaziv}>{item.proizvod.naziv}</span>
                                        <button
                                            className={styles.ukloniBtn}
                                            onClick={() => ukloni(item.proizvod.id)}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                    <div className={styles.stavkaDole}>
                                        <div className={styles.kontrole}>
                                            <button
                                                className={styles.kontroleBtn}
                                                onClick={() => smanji(item.proizvod.id)}
                                            >
                                                <Minus size={11} />
                                            </button>
                                            <span className={styles.kolicina}>{item.kolicina}</span>
                                            <button
                                                className={styles.kontroleBtn}
                                                onClick={() => povecaj(item.proizvod.id)}
                                            >
                                                <Plus size={11} />
                                            </button>
                                        </div>
                                        <span className={styles.cena}>
                                            {Math.round(item.proizvod.cena * item.kolicina)} RSD
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {korpa.length > 0 && !uspesno && (
                <div className={styles.footer}>

                    {/* Tip porudžbine */}
                    <div className={styles.tipSekcija}>
                        <span className={styles.tipLabel}>Tip porudžbine</span>
                        <div className={styles.tipBiraci}>
                            {(Object.keys(TIP_LABELE) as TipPorudzbine[]).map(tip => (
                                <button
                                    key={tip}
                                    className={`${styles.tipBirac} ${tipPorudzbine === tip ? styles.tipAktivan : ''}`}
                                    onClick={() => setTipPorudzbine(tip)}
                                >
                                    {TIP_LABELE[tip]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Napomena */}
                    <div className={styles.napomenaSekcija}>
                        <span className={styles.tipLabel}>Napomena (opciono)</span>
                        <textarea
                            className={styles.napomenaInput}
                            value={napomena}
                            onChange={e => setNapomena(e.target.value)}
                            placeholder="npr. bez šećera..."
                            maxLength={1000}
                            rows={2}
                        />
                    </div>

                    {popust > 0 && (
                        <div className={styles.popustRed}>
                            <span className={styles.popustLabel}>Loyalty popust ({popust}%)</span>
                            <span className={styles.popustIznos}>−{popustIznos} RSD</span>
                        </div>
                    )}

                    <div className={styles.ukupno}>
                        <span className={styles.ukupnoLabel}>Ukupno</span>
                        <span className={styles.ukupnoVrednost}>
                            {popust > 0 && <span className={styles.ukupnoStaro}>{ukupnaCena}</span>}
                            {zaPlacanje} RSD
                        </span>
                    </div>

                    {greska && <p className={styles.greska}>{greska}</p>}

                    <button
                        className={styles.naruciBtn}
                        onClick={handleNaruci}
                        disabled={porucivanjeUToku}
                    >
                        {porucivanjeUToku ? 'Šaljem...' : 'Naruči'}
                    </button>

                    <button className={styles.isprazniBtn} onClick={isprazni}>
                        Isprazni korpu
                    </button>
                </div>
            )}
        </div>
    );
}
