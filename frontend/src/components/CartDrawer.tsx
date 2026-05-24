import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAktivnaPorudzbina } from '../context/AktivnaPorudzbinaContext';
import { TIP_LABELE, type TipPorudzbine } from '../types/porudzbina';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
    const navigate = useNavigate();
    const { korisnik, token, osvezi, popust } = useAuth();
    const { otvoriStatus } = useAktivnaPorudzbina();
    const {
        korpa, povecaj, smanji, ukloni, isprazni,
        ukupnaCena, ukupnoStavki,
        drawerOtvoren, zatvoriDrawer,
    } = useCart();

    const [tipPorudzbine, setTipPorudzbine] = useState<TipPorudzbine>('U_LOKALU');
    const [napomena, setNapomena] = useState('');
    const [porucivanjeUToku, setPorucivanjeUToku] = useState(false);
    const [uspesno, setUspesno] = useState(false);

    //Zaokruzivanje finalne cene, isto kao na meniju
    const zaPlacanje = popust > 0 ? Math.round(ukupnaCena * (1 - popust / 100)) : ukupnaCena;
    const popustIznos = ukupnaCena - zaPlacanje;

    const handleNaruci = async () => {
        if (!korisnik || !token) {
            zatvoriDrawer();
            navigate('/login');
            return;
        }

        setPorucivanjeUToku(true);
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
                    zatvoriDrawer();
                    if (novaPorudzbinaId) otvoriStatus(novaPorudzbinaId);
                }, 2000);
            } else {
                const data = await res.json().catch(() => null);
                alert(data?.message ?? 'Greška prilikom naručivanja.');
            }
        } catch {
            alert('Server ne odgovara.');
        } finally {
            setPorucivanjeUToku(false);
        }
    };

    return (
        <AnimatePresence>
            {drawerOtvoren && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={zatvoriDrawer}
                    />

                    {/* Drawer */}
                    <motion.aside
                        className={styles.drawer}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%', transition: { type: 'tween', duration: 0.2, ease: [0.4, 0, 1, 1] } }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className={styles.header}>
                            <div className={styles.headerLevo}>
                                <h2 className={styles.naslov}>Korpa</h2>
                                <AnimatePresence>
                                    {ukupnoStavki > 0 && (
                                        <motion.span
                                            className={styles.badge}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        >
                                            {ukupnoStavki}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button className={styles.zatvoriBtn} onClick={zatvoriDrawer}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Sadržaj */}
                        <div className={styles.sadrzaj}>
                            {uspesno ? (
                                <motion.div
                                    className={styles.uspesno}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <CheckCircle2 size={56} className={styles.uspesnoIkona} />
                                    <p className={styles.uspesnoNaslov}>Porudžbina je poslata!</p>
                                    <p className={styles.uspesnoSub}>Otvaramo praćenje...</p>
                                </motion.div>

                            ) : korpa.length === 0 ? (
                                <div className={styles.prazna}>
                                    <ShoppingCart size={72} className={styles.praznaIkona} />
                                    <p className={styles.praznaTekst}>Korpa je prazna</p>
                                    <button
                                        className={styles.idNaMeni}
                                        onClick={() => { zatvoriDrawer(); navigate('/meni'); }}
                                    >
                                        Pogledaj meni →
                                    </button>
                                </div>

                            ) : (
                                <div className={styles.stavke}>
                                    <AnimatePresence initial={false}>
                                        {korpa.map(item => (
                                            <motion.div
                                                key={item.proizvod.id}
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className={styles.stavka}
                                            >
                                                <div className={styles.stavkaGore}>
                                                    <span className={styles.stavkaNaziv}>
                                                        {item.proizvod.naziv}
                                                    </span>
                                                    <button
                                                        className={styles.ukloniBtn}
                                                        onClick={() => ukloni(item.proizvod.id)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>

                                                <div className={styles.stavkaDole}>
                                                    <div className={styles.stavkaKontrole}>
                                                        <motion.button
                                                            whileTap={{ scale: 0.85 }}
                                                            className={styles.kontroleBtn}
                                                            onClick={() => smanji(item.proizvod.id)}
                                                        >
                                                            <Minus size={12} />
                                                        </motion.button>
                                                        <span className={styles.stavkaKolicina}>
                                                            {item.kolicina}
                                                        </span>
                                                        <motion.button
                                                            whileTap={{ scale: 0.85 }}
                                                            className={styles.kontroleBtn}
                                                            onClick={() => povecaj(item.proizvod.id)}
                                                        >
                                                            <Plus size={12} />
                                                        </motion.button>
                                                    </div>

                                                    {item.kolicina > 1 && (
                                                        <span className={styles.stavkaJedinicna}>
                                                            {item.kolicina} × {Math.round(item.proizvod.cena)} RSD
                                                        </span>
                                                    )}
                                                </div>

                                                <div className={styles.stavkaUkupnoRed}>
                                                    <span className={styles.stavkaUkupno}>
                                                        {Math.round(item.proizvod.cena * item.kolicina)} RSD
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <AnimatePresence>
                            {!uspesno && korpa.length > 0 && (
                                <motion.div
                                    className={styles.footer}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                >
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
                                            placeholder="npr. bez šećera, dodatni preliv..."
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

                                    <motion.button
                                        className={styles.naruciBtn}
                                        onClick={handleNaruci}
                                        disabled={porucivanjeUToku}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {porucivanjeUToku ? 'Šaljem...' : 'Naruči'}
                                    </motion.button>

                                    <button className={styles.isprazniBtn} onClick={isprazni}>
                                        Isprazni korpu
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </motion.aside>
                </>
            )}


        </AnimatePresence>
    );
}