import styles from './HomePage.module.css';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/bg1.png';

export default function HomePage() {
  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section
        className={styles.hero}
        style={{ '--hero-bg': `url(${backgroundImage})` } as React.CSSProperties}
      >
        <div className={styles.heroNoise} />
        <div className={styles.spotlight} />

        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>✦ Dorćol, Beograd</div>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleMain}>Glumac</span>
            <span className={styles.heroTitleAccent}>Plus</span>
          </h1>
          <p className={styles.heroSub}>
            Palačinke koje pamtiš. Napravljene za one koji znaju razliku.
          </p>

          <div className={styles.heroCtas}>
            <Link to="/meni" className={styles.ctaPrimary}>
              Poruči odmah
              <span className={styles.ctaArrow}>→</span>
            </Link>
            <Link to="/loyalty" className={styles.ctaSecondary}>
              Loyalty program
            </Link>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>4</span>
              <span className={styles.statLabel}>loyalty nivoa</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>20%</span>
              <span className={styles.statLabel}>max popust</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>∞</span>
              <span className={styles.statLabel}>razloga da dođeš</span>
            </div>
          </div>
        </div>

        <div className={styles.heroImageWrap}>
          <div className={styles.heroImageGlow} />
          <img
            src="https://images.unsplash.com/photo-1546861256-33e6f3e53c0c?q=80&w=1070&auto=format&fit=crop"
            alt="Glumac Plus palačinke"
            className={styles.heroImage}
          />
        </div>

        <div className={styles.heroScroll}>
          <span>skroluj</span>
          <div className={styles.heroScrollLine} />
        </div>
      </section>

      {/* ── MENI PREVIEW ── */}
      <section className={styles.menuSection}>
        <div className={styles.sectionLabel}>— Naš meni —</div>
        <h2 className={styles.sectionTitle}>Zvezde programa</h2>

        <div className={styles.menuGrid}>
          {[
            {
              emoji: '🍫',
              name: 'Nutella & Banana',
              desc: 'Topla nutela, sveža banana, šlag po izboru. Naša najtraženija.',
              tag: 'Bestseler',
              tagColor: '#f4a261',
            },
            {
              emoji: '🍯',
              name: 'Plazma & Med',
              desc: 'Domaći med, mlevena plazma, kremasto i jednostavno.',
              tag: 'Klasik',
              tagColor: '#90be6d',
            },
            {
              emoji: '🧀',
              name: 'Šunka & Kačkavalj',
              desc: 'Slana varijanta za pravi obrok. Grill finish.',
              tag: 'Slano',
              tagColor: '#4cc9f0',
            },
            {
              emoji: '🍓',
              name: 'Sezonska palačinka',
              desc: 'Šta nam donese sezona — to stavljamo unutra. Uvek sveže.',
              tag: 'Sezonski',
              tagColor: '#e63946',
            },
          ].map((item) => (
            <div key={item.name} className={styles.menuCard}>
              <div className={styles.menuCardTag} style={{ color: item.tagColor }}>
                {item.tag}
              </div>
              <div className={styles.menuCardEmoji}>{item.emoji}</div>
              <h3 className={styles.menuCardName}>{item.name}</h3>
              <p className={styles.menuCardDesc}>{item.desc}</p>
              <Link to="/meni" className={styles.menuCardLink}>
                Dodaj u korpu <span>+</span>
              </Link>
            </div>
          ))}
        </div>

        <div className={styles.menuCta}>
          <Link to="/meni" className={styles.ctaPrimary}>
            Ceo meni →
          </Link>
        </div>
      </section>

      {/* ── LOYALTY ── */}
      <section className={styles.loyaltySection}>
        <div className={styles.loyaltyBg} />
        <div className={styles.loyaltyContent}>
          <div className={styles.sectionLabel}>— Loyalty program —</div>
          <h2 className={styles.sectionTitle}>Od Nove zvezde do Oskara</h2>
          <p className={styles.loyaltySub}>
            Svaka porudžbina donosi bodove. Više bodova — veći popust.
            Naš top nivo nosi naziv koji zaslužuje.
          </p>

          <div className={styles.loyaltyLevels}>
            {[
              { name: 'Nova zvezda', pts: '0 pts', discount: '0%', active: false },
              { name: 'Epizodista', pts: '100 pts', discount: '5%', active: false },
              { name: 'Glavna uloga', pts: '500 pts', discount: '10%', active: false },
              { name: '🏆 Oscar za palačinke', pts: '1000 pts', discount: '20%', active: true },
            ].map((lvl, i) => (
              <div key={i} className={`${styles.loyaltyLevel} ${lvl.active ? styles.loyaltyLevelActive : ''}`}>
                <div className={styles.loyaltyLevelName}>{lvl.name}</div>
                <div className={styles.loyaltyLevelPts}>{lvl.pts}</div>
                <div className={styles.loyaltyLevelDiscount}>{lvl.discount}</div>
              </div>
            ))}
          </div>

          <Link to="/loyalty" className={styles.ctaPrimary} style={{ marginTop: '40px', display: 'inline-flex' }}>
            Pogledaj svoj status
          </Link>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className={styles.gallerySection}>
        <div className={styles.sectionLabel}>— Galerija —</div>
        <h2 className={styles.sectionTitle}>Izgled je bitan</h2>

        <div className={styles.galleryGrid}>
          <div className={`${styles.galleryItem} ${styles.galleryItemTall}`}>
            <img
              src="https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop"
              alt="Palačinke"
            />
            <div className={styles.galleryOverlay}>Slatke</div>
          </div>
          <div className={styles.galleryItem}>
            <img
              src="https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&auto=format&fit=crop"
              alt="Hrana"
            />
            <div className={styles.galleryOverlay}>Sveže</div>
          </div>
          <div className={styles.galleryItem}>
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop"
              alt="Restoran"
            />
            <div className={styles.galleryOverlay}>Ambijent</div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>Glumac Plus</div>
        <div className={styles.footerSub}>Palačinke · Dorćol · Beograd · 2026</div>
        <div className={styles.footerLinks}>
          <Link to="/meni">Meni</Link>
          <span>·</span>
          <Link to="/loyalty">Loyalty</Link>
          <span>·</span>
          <Link to="/istorija">Porudžbine</Link>
        </div>
      </footer>

    </div>
  );
}