import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import styles from './MeniPage.module.css';
import ProizvodKartica from '../components/ProizvodKartica';
import MeniSkeleton from '../components/MeniSkeleton';
import Toast from '../components/Toast';

interface Proizvod {
  id: number;
  naziv: string;
  opis?: string;
  cena: number;
  tip: string;
  alergeniNazivi?: string[];
}

interface RadnoVremeInterval {
  dan: 'PONEDELJAK' | 'UTORAK' | 'SREDA' | 'CETVRTAK' | 'PETAK' | 'SUBOTA' | 'NEDELJA';
  odVremena: string;
  doVremena: string;
}

const SLIKE_PO_TIPU: Record<string, string> = {
  'slatka': 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&auto=format&fit=crop&q=80',
  'slana': 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&auto=format&fit=crop&q=80',
  'default': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=80',
};

function getSlikuZaTip(tip: string) {
  return SLIKE_PO_TIPU[tip.toLowerCase()] ?? SLIKE_PO_TIPU['default'];
}

// Popust po loyalty nivou
const LOYALTY_POPUST: Record<string, number> = {
  'Nova zvezda': 0,
  'Epizodista': 5,
  'Glavna uloga': 10,
  'Oscar za palačinke': 20,
};

function getPopust(loyaltyNivo?: string): number {
  if (!loyaltyNivo) return 0;
  return LOYALTY_POPUST[loyaltyNivo] ?? 0;
}

export default function MeniPage() {
  const { korpa, dodaj, povecaj, smanji, otvoriDrawer, ukupnoStavki } = useCart();
  const { korisnik } = useAuth();

  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [greska, setGreska] = useState('');
  const [ucitava, setUcitava] = useState(true);
  const [pretraga, setPretraga] = useState('');
  const [aktivniTab, setAktivniTab] = useState('Sve');
  const [toastPoruka, setToastPoruka] = useState<string | null>(null);
  const [radnoVremeInfo, setRadnoVremeInfo] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:8080/api/proizvodi')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setProizvodi(data); setUcitava(false); })
      .catch(() => { setGreska('Ne mogu da učitam meni.'); setUcitava(false); });
  }, []);

  useEffect(() => {
    const daniMap: Record<number, RadnoVremeInterval['dan']> = {
      0: 'NEDELJA',
      1: 'PONEDELJAK',
      2: 'UTORAK',
      3: 'SREDA',
      4: 'CETVRTAK',
      5: 'PETAK',
      6: 'SUBOTA',
    };

    fetch('http://localhost:8080/api/radno-vreme?aktivno=true')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: RadnoVremeInterval[]) => {
        const danas = daniMap[new Date().getDay()];
        const intervaliDanas = data.filter(i => i.dan === danas);

        if (intervaliDanas.length === 0) {
          setRadnoVremeInfo('Danas lokal ne radi.');
          return;
        }

        const tekstIntervala = intervaliDanas
          .map(i => `${i.odVremena?.slice(0, 5)} - ${i.doVremena?.slice(0, 5)}`)
          .join(', ');

        setRadnoVremeInfo(`Radno vreme danas: ${tekstIntervala}`);
      })
      .catch(() => {
        setRadnoVremeInfo('');
      });
  }, []);

  const kategorije = useMemo(() => {
    const tipovi = [...new Set(proizvodi.map(p => p.tip))];
    return ['Sve', ...tipovi];
  }, [proizvodi]);

  const filtrirani = useMemo(() =>
    proizvodi.filter(p => {
      const okTab = aktivniTab === 'Sve' || p.tip === aktivniTab;
      const okPretraga = p.naziv.toLowerCase().includes(pretraga.toLowerCase());
      return okTab && okPretraga;
    }),
    [proizvodi, aktivniTab, pretraga]
  );

  const popust = getPopust(korisnik?.loyaltyNivo);

  // Dodaj u korpu + toast notifikacija
  const handleDodaj = useCallback((p: Proizvod) => {
    dodaj(p);
    setToastPoruka(`${p.naziv} dodata u korpu`);
    setTimeout(() => setToastPoruka(null), 2500);
  }, [dodaj]);

  return (
    <div className={styles.stranica}>

      {/* ── PAGE HEADER ── */}
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderSadrzaj}>
          <span className={styles.pageHeaderOznaka}>— Naš meni —</span>
          <h1 className={styles.pageHeaderNaslov}>Palačinke za svaki ukus</h1>
          <p className={styles.pageHeaderOpis}>
            Slatke, slane, sezonske — svaka palačinka rađena s pažnjom.
          </p>
          {radnoVremeInfo && (
            <p className={styles.radnoVremeInfo}>{radnoVremeInfo}</p>
          )}
          {korisnik && popust > 0 && (
            <div className={styles.loyaltyBaner}>
              🏆 {korisnik.loyaltyNivo} — tvoj popust: <strong>{popust}%</strong>
            </div>
          )}
        </div>
      </header>

      {/* ── KONTROLE ── */}
      <div className={styles.kontrole}>
        <div className={styles.tabovi}>
          {kategorije.map(kat => (
            <button
              key={kat}
              className={`${styles.tab} ${aktivniTab === kat ? styles.tabAktivan : ''}`}
              onClick={() => setAktivniTab(kat)}
            >
              {kat}
            </button>
          ))}
        </div>

        <div className={styles.searchWrap}>
          <span className={styles.searchIkona}>⌕</span>
          <input
            type="text"
            placeholder="Pretraži..."
            value={pretraga}
            onChange={e => setPretraga(e.target.value)}
            className={styles.searchInput}
          />
          {pretraga && (
            <button className={styles.searchBrisi} onClick={() => setPretraga('')}>×</button>
          )}
        </div>
      </div>

      {/* ── SADRŽAJ ── */}
      <main className={styles.sadrzaj}>
        {greska && <p className={styles.greska}>{greska}</p>}

        {/* Skeleton dok se učitava */}
        {ucitava && <MeniSkeleton />}

        {/* Prazno stanje (posle učitavanja) */}
        {!ucitava && filtrirani.length === 0 && !greska && (
          <div className={styles.praznoStanje}>
            <p className={styles.praznoTekst}>Nema rezultata</p>
            {pretraga && (
              <p className={styles.praznoHint}>
                Nismo pronašli ništa za „<em>{pretraga}</em>"
              </p>
            )}
          </div>
        )}

        {!ucitava && (
          <motion.div
            className={styles.grid}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } }
            }}
          >
            {filtrirani.map(p => (
              <ProizvodKartica
                key={p.id}
                proizvod={p}
                kolicina={korpa.find(i => i.proizvod.id === p.id)?.kolicina ?? 0}
                slika={getSlikuZaTip(p.tip)}
                popust={popust}
                onDodaj={handleDodaj}
                onPovecaj={povecaj}
                onSmanji={smanji}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* ── KORPA BAR (sticky dno) ── */}
      {ukupnoStavki > 0 && (
        <div className={styles.korpaBar}>
          <span className={styles.korpaBarTekst}>
            {ukupnoStavki} {ukupnoStavki === 1 ? 'stavka' : 'stavki'} u korpi
          </span>
          <button className={styles.korpaBarBtn} onClick={otvoriDrawer}>
            Pogledaj korpu →
          </button>
        </div>
      )}

      {/* ── TOAST ── */}
      <Toast poruka={toastPoruka} />

    </div>
  );
}
