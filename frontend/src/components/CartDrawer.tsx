import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAktivnaPorudzbina } from '../context/AktivnaPorudzbinaContext';
import { TIP_LABELE, type TipPorudzbine } from '../types/porudzbina';
import styles from './CartDrawer.module.css';
import * as porudzbineApi from '../api/porudzbine';
import { ApiError } from '../api/client';

export default function CartDrawer() {
    const navigate = useNavigate();
    const { korisnik, token, osvezi, popust } = useAuth();
    const { postaviAktivnu } = useAktivnaPorudzbina();
    const {
        korpa, povecaj, smanji, ukloni, isprazni,
        ukupnaCena, ukupnoStavki,
        drawerOtvoren, zatvoriDrawer,
    } = useCart();

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
            zatvoriDrawer();
            navigate('/login');
            return;
        }

        setGreska('');
        setPorucivanjeUToku(true);
        try {
            const nova = await porudzbineApi.kreiraj({
                tipPorudzbine,
                napomena: napomena.trim() || null,
                stavke: korpa.map(i => ({
                    proizvodId: i.proizvod.id,
                    kolicina: i.kolicina,
                })),
            });
            const novaPorudzbinaId: number | null = nova?.porudzbinaId ?? null;
            isprazni();
            setNapomena('');
            setUspesno(true);
            await osvezi();
            setTimeout(() => {
                setUspesno(false);
                zatvoriDrawer();
                if (novaPorudzbinaId) postaviAktivnu(novaPorudzbinaId);
            }, 2000);
        } catch (e) {
            setGreska(e instanceof ApiError
                ? (e.body?.message ?? 'Greška prilikom naručivanja.')
                : 'Server ne odgovara.');
        } finally {
            setPorucivanjeUToku(false);
        }
    };

    return (
        <AnimatePresence>
            {drawerOtvoren && (
                <>
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={zatvoriDrawer}
                    />

                    <motion.aside
                        className={styles.drawer}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%', transition: { type: 'tween', duration: 0.2, ease: [0.4, 0, 1, 1] } }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    >
                        <div className={styles.header}>
                            <div className={styles.headerLevo}>
                                <h2 className={styles.naslov}>Korpa</h2>
                                {ukupnoStavki > 0 && (
                                    <span className={styles.brojStavki}>
                                        {ukupnoStavki} {ukupnoStavki === 1 ? 'stavka' : 'stavke'}
                                    </span>
                                )}
                            </div>
                            <button className={styles.zatvoriBtn} onClick={zatvoriDrawer} aria-label="Zatvori">
                                ✕
                            </button>
                        </div>

                        <div className={styles.sadrzaj}>
                            {uspesno ? (
                                <motion.div
                                    className={styles.uspesno}
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <p className={styles.uspesnoNaslov}>Porudžbina poslata!</p>
                                    <p className={styles.uspesnoSub}>otvaramo praćenje…</p>
                                </motion.div>

                            ) : korpa.length === 0 ? (
                                <div className={styles.prazna}>
                                    <p className={styles.praznaTekst}>KORPA JE PRAZNA</p>
                                    <button
                                        className={styles.idNaMeni}
                                        onClick={() => { zatvoriDrawer(); navigate('/meni'); }}
                                    >
                                        pogledaj meni →
                                    </button>
                                </div>

                            ) : (
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
                                            <div className={styles.stavkaRed}>
                                                <span className={styles.stavkaNaziv}>
                                                    {item.proizvod.naziv}
                                                </span>
                                                <button
                                                    className={styles.ukloniBtn}
                                                    onClick={() => ukloni(item.proizvod.id)}
                                                    aria-label={`Ukloni ${item.proizvod.naziv}`}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <div className={styles.stavkaRed}>
                                                <div className={styles.qty}>
                                                    <motion.button
                                                        whileTap={{ scale: 0.85 }}
                                                        className={styles.qtyBtn}
                                                        onClick={() => smanji(item.proizvod.id)}
                                                    >
                                                        −
                                                    </motion.button>
                                                    <span className={styles.qtyBroj}>{item.kolicina}</span>
                                                    <motion.button
                                                        whileTap={{ scale: 0.85 }}
                                                        className={styles.qtyBtn}
                                                        onClick={() => povecaj(item.proizvod.id)}
                                                    >
                                                        +
                                                    </motion.button>
                                                </div>
                                                <span className={styles.stavkaCena}>
                                                    {Math.round(item.proizvod.cena * item.kolicina)}
                                                    <span className={styles.rsd}>RSD</span>
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        <AnimatePresence>
                            {!uspesno && korpa.length > 0 && (
                                <motion.div
                                    className={styles.footer}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                >
                                    <div className={styles.sekcija}>
                                        <span className={styles.sekcLab}>tip porudžbine</span>
                                        <div className={styles.tipBiraci}>
                                            {(Object.keys(TIP_LABELE) as TipPorudzbine[]).map(tip => (
                                                <button
                                                    key={tip}
                                                    className={tipPorudzbine === tip ? styles.tipPilAktivan : styles.tipPil}
                                                    onClick={() => setTipPorudzbine(tip)}
                                                >
                                                    {TIP_LABELE[tip]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.sekcija}>
                                        <span className={styles.sekcLab}>napomena (opciono)</span>
                                        <textarea
                                            className={styles.napomena}
                                            value={napomena}
                                            onChange={e => setNapomena(e.target.value)}
                                            placeholder="npr. bez šećera, dodatni preliv..."
                                            maxLength={1000}
                                            rows={2}
                                        />
                                    </div>

                                    {popust > 0 && (
                                        <div className={styles.popustRed}>
                                            <span>loyalty popust ({popust}%)</span>
                                            <span>−{popustIznos} RSD</span>
                                        </div>
                                    )}

                                    <div className={styles.ukupnoRed}>
                                        <span className={styles.ukupnoLab}>UKUPNO</span>
                                        <span>
                                            {popust > 0 && (
                                                <span className={styles.ukupnoStaro}>{ukupnaCena}</span>
                                            )}
                                            <span className={styles.ukupnoVrednost}>
                                                {zaPlacanje}<span className={styles.rsd}>RSD</span>
                                            </span>
                                        </span>
                                    </div>

                                    {greska && <p className={styles.greska}>{greska}</p>}

                                    <motion.button
                                        className={styles.naruciBtn}
                                        onClick={handleNaruci}
                                        disabled={porucivanjeUToku}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {porucivanjeUToku ? 'Šaljem…' : 'Naruči →'}
                                    </motion.button>

                                    <button className={styles.isprazniBtn} onClick={isprazni}>
                                        isprazni korpu
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
