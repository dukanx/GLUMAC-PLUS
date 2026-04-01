import styles from './HomePage.module.css';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className={styles.page}>

      {/* HERO */}
      <section className={styles.hero}>
        <video
          className={styles.heroVideo}
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>

        <div className={styles.heroOverlay} />

        <div className={styles.heroSadrzaj}>
          <p className={styles.heroTagline}>Dorćol · Beograd</p>
          <h1 className={styles.heroNaslov}>Glumac Plus</h1>
          <p className={styles.heroOpis}>
            Palačinke koje ostaju u sećanju.
          </p>
          <div className={styles.heroDugmadi}>
            <Link to="/meni" className={styles.dugmePrimarno}>
              Poruči odmah
            </Link>
            <Link to="/loyalty" className={styles.dugmeSekundarno}>
              Loyalty program
            </Link>
          </div>
        </div>

        <div className={styles.heroSkrol}>
          <span>↓</span>
        </div>
      </section>


      {/* MENI PREVIEW */}
      <section className={styles.meniSekcija}>
        <div className={styles.sekcijaHeader}>
          <span className={styles.sekcijaOznaka}>— Iz našeg menija —</span>
          <h2 className={styles.sekcijaNaslov}>Popularno danas</h2>
        </div>

        <div className={styles.meniGrid}>
          {[
            {
              slika: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&auto=format&fit=crop',
              naziv: 'Nutella & Banana',
              opis: 'Topla nutela, sveža banana, šlag po izboru.',
              tag: 'Bestseler'
            },
            {
              slika: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop',
              naziv: 'Plazma & Med',
              opis: 'Domaći med, mlevena plazma, kremasto i jednostavno.',
              tag: 'Klasik'
            },
            {
              slika: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&auto=format&fit=crop',
              naziv: 'Šunka & Kačkavalj',
              opis: 'Slana varijanta za pravi obrok. Grill finish.',
              tag: 'Slano'
            },
            {
              slika: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&auto=format&fit=crop',
              naziv: 'Sezonska',
              opis: 'Šta nam donese sezona — uvek sveže, uvek drugačije.',
              tag: 'Sezonski'
            },
          ].map(item => (
            <div key={item.naziv} className={styles.meniKartica}>
              <div className={styles.meniKarticaSlika}>
                <img src={item.slika} alt={item.naziv} />
                <span className={styles.meniKarticaTag}>{item.tag}</span>
              </div>
              <div className={styles.meniKarticaTekst}>
                <h3 className={styles.meniKarticaNaziv}>{item.naziv}</h3>
                <p className={styles.meniKarticaOpis}>{item.opis}</p>
                <Link to="/meni" className={styles.meniKarticaLink}>
                  Pogledaj meni →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LOYALTY */}
      <section className={styles.loyaltySekcija}>
        <div className={styles.loyaltyLevo}>
          <span className={styles.sekcijaOznaka}>— Loyalty program —</span>
          <h2 className={styles.sekcijaNaslov}>Nagrađujemo верност</h2>
          <p className={styles.loyaltyOpis}>
            Svaka porudžbina donosi bodove. Više bodova — veći popust.
            Naš najviši nivo nosi naziv koji zaslužuje.
          </p>
          <Link to="/loyalty" className={styles.dugmePrimarno}>
            Pogledaj svoj status
          </Link>
        </div>

        <div className={styles.loyaltyDesno}>
          {[
            { naziv: 'Nova zvezda', prag: '0 bodova', popust: '0%', aktivan: false },
            { naziv: 'Epizodista', prag: '100 bodova', popust: '5%', aktivan: false },
            { naziv: 'Glavna uloga', prag: '500 bodova', popust: '10%', aktivan: false },
            { naziv: '🏆 Oscar za palačinke', prag: '1000 bodova', popust: '20%', aktivan: true },
          ].map((nivo, i) => (
            <div
              key={i}
              className={`${styles.loyaltyNivo} ${nivo.aktivan ? styles.loyaltyNivoAktivan : ''}`}
            >
              <div className={styles.loyaltyNivoLevo}>
                <span className={styles.loyaltyNivoNaziv}>{nivo.naziv}</span>
                <span className={styles.loyaltyNivoPrag}>{nivo.prag}</span>
              </div>
              <span className={styles.loyaltyNivoPopust}>{nivo.popust}</span>
            </div>
          ))}
        </div>
      </section>

      {/* GALERIJA */}
      <section className={styles.galerijaSekcija}>
        <div className={styles.sekcijaHeader}>
          <span className={styles.sekcijaOznaka}>— Naš lokal —</span>
          <h2 className={styles.sekcijaNaslov}>Dođi, vidi, ostani</h2>
        </div>

        <div className={styles.galerijaGrid}>
          <div className={`${styles.galerijaStavka} ${styles.galerijaStavkaVelika}`}>
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop"
              alt="Enterijer lokala"
            />
            <div className={styles.galerijaOverlay}>Ambijent</div>
          </div>

          <div className={styles.galerijaStavka}>
            <img
              src="https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop"
              alt="Palačinke"
            />
            <div className={styles.galerijaOverlay}>Slatke</div>
          </div>

          <div className={styles.galerijaStavka}>
            <img
              src="https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&auto=format&fit=crop"
              alt="Hrana"
            />
            <div className={styles.galerijaOverlay}>Sveže</div>
          </div>

          <div className={styles.galerijaStavka}>
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop"
              alt="Detalji"
            />
            <div className={styles.galerijaOverlay}>Detalji</div>
          </div>
        </div>
      </section>

      {/* DOSTAVA */}
      <section className={styles.dostavaSekcija}>
        <div className={styles.sekcijaHeader}>
          <span className={styles.sekcijaOznaka}>— Naručite online —</span>
          <h2 className={styles.sekcijaNaslov}>Dostava na vašu adresu</h2>
        </div>

        <div className={styles.dostavaGrid}>

          <a
            href="https://glovoapp.com/en/rs/belgrade/stores/glumac-plus-beg"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.dostavaKartica} ${styles.dostavaGlovo}`}
          >
            <div className={styles.dostavaLogo}>
              <span className={styles.dostavaLogoSlovo}>G</span>
            </div>
            <div className={styles.dostavaTekst}>
              <span className={styles.dostavaIme}>Glovo</span>
              <span className={styles.dostavaOpis}>Poruči putem Glovo aplikacije</span>
            </div>
            <span className={styles.dostavaStrelica}>→</span>
          </a>

          <a
            href="https://wolt.com/en/srb/belgrade/restaurant/palainkarnica-glumac-plus"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.dostavaKartica} ${styles.dostavaWolt}`}
          >
            <div className={styles.dostavaLogo}>
              <span className={styles.dostavaLogoSlovo}>W</span>
            </div>
            <div className={styles.dostavaTekst}>
              <span className={styles.dostavaIme}>Wolt</span>
              <span className={styles.dostavaOpis}>Poruči putem Wolt aplikacije</span>
            </div>
            <span className={styles.dostavaStrelica}>→</span>
          </a>

        </div>
      </section>

      {/* FOOTER */}
      < footer className={styles.footer} >
        <div className={styles.footerGore}>
          <div className={styles.footerBrend}>
            <h3 className={styles.footerLogo}>Glumac Plus</h3>
            <p className={styles.footerSlogan}>
              Palačinke koje pamtiš.
            </p>
          </div>

          <div className={styles.footerNavigacija}>
            <span className={styles.footerNaslov}>Navigacija</span>
            <Link to="/meni">Meni</Link>
            <Link to="/loyalty">Loyalty program</Link>
            <Link to="/porudzbine">Moje porudžbine</Link>
            <Link to="/login">Prijava</Link>
          </div>

          <div className={styles.footerKontakt}>
            <span className={styles.footerNaslov}>Pronađi nas</span>
            <p>📍 Dorćol, Beograd</p>
            <p>🕐 Pon–Ned: 09:00–22:00</p>
            <p>📞 +381 11 123 4567</p>
          </div>
        </div>

        <div className={styles.footerDole}>
          <span>© 2026 Glumac Plus · Sva prava zadržana</span>
        </div>
      </footer >

    </div >
  );
}