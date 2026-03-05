import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './MeniPage.css';

interface Proizvod {
  id: number;
  naziv: string;
  opis: string;
  cena: number;
  tip: string;
}

interface StavkaKorpe {
  proizvod: Proizvod;
  kolicina: number;
}

const STORAGE_KEY = 'mojaKorpa';

function MeniPage() {
  const navigate = useNavigate();
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [error, setError] = useState<string>("");
  const [porucivanjeUToku, setPorucivanjeUToku] = useState(false);
  const [porudzbinaUspesna, setPorudzbinaUspesna] = useState(false);

  const [korpa, setKorpa] = useState<StavkaKorpe[]>(() => {
    try {
      const savedCart = sessionStorage.getItem(STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(korpa));
    } catch (error) {
      console.error("Error writing to session storage:", error);
    }
  }, [korpa]);

  useEffect(() => {
    fetch('http://localhost:8080/api/proizvodi')
      .then(res => {
        if (!res.ok) throw new Error('Problem sa mrezom!');
        return res.json();
      })
      .then(data => setProizvodi(data))
      .catch(() => setError("Ne mogu da učitam meni."));
  }, []);

  // --- Akcije korpe ---

  const dodajUKorpu = (noviProizvod: Proizvod) => {
    setKorpa(staraKorpa => {
      const postoji = staraKorpa.find(item => item.proizvod.id === noviProizvod.id);
      if (postoji) {
        return staraKorpa.map(item =>
          item.proizvod.id === noviProizvod.id
            ? { ...item, kolicina: item.kolicina + 1 }
            : item
        );
      }
      return [...staraKorpa, { proizvod: noviProizvod, kolicina: 1 }];
    });
  };

  const povecajKolicinu = (id: number) => {
    setKorpa(prev =>
      prev.map(item =>
        item.proizvod.id === id ? { ...item, kolicina: item.kolicina + 1 } : item
      )
    );
  };

  const smanjiKolicinu = (id: number) => {
    setKorpa(prev =>
      prev
        .map(item =>
          item.proizvod.id === id ? { ...item, kolicina: item.kolicina - 1 } : item
        )
        .filter(item => item.kolicina > 0)
    );
  };

  const ukloniStavku = (id: number) => {
    setKorpa(prev => prev.filter(item => item.proizvod.id !== id));
  };

  const isprazniKorpu = () => {
    setKorpa([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  // --- Naručivanje ---

  const handleNaruci = async () => {
    const userJson = sessionStorage.getItem("korisnik");
    const token = sessionStorage.getItem("token");

    if (!userJson || !token) {
      alert("Morate biti prijavljeni da biste naručili!");
      navigate("/login");
      return;
    }

    const user = JSON.parse(userJson);

    const porudzbinaDto = {
      korisnikId: user.id,
      stavke: korpa.map(item => ({
        proizvodId: item.proizvod.id,
        kolicina: item.kolicina,
      })),
    };

    setPorucivanjeUToku(true);

    try {
      const response = await fetch('http://localhost:8080/api/porudzbine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(porudzbinaDto),
      });

      if (response.ok) {
        setPorudzbinaUspesna(true);
        isprazniKorpu();
        setTimeout(() => setPorudzbinaUspesna(false), 4000);
      } else {
        const errData = await response.json().catch(() => null);
        alert(errData?.message ?? "Došlo je do greške prilikom naručivanja.");
      }
    } catch {
      alert("Server ne odgovara. Proverite konekciju.");
    } finally {
      setPorucivanjeUToku(false);
    }
  };

  const ukupnaCena = korpa.reduce(
    (total, item) => total + item.proizvod.cena * item.kolicina,
    0
  );

  const ukupnoStavki = korpa.reduce((total, item) => total + item.kolicina, 0);

  return (
    <div className="meni-container">

      {/* LEVA STRANA: MENI */}
      <main className="meni-glavni-sadrzaj">
        <h1>🍕 Naš Meni</h1>
        {error && <p className="greska-poruka">{error}</p>}

        <div className="lista-proizvoda">
          {proizvodi.map(p => {
            const uKorpi = korpa.find(item => item.proizvod.id === p.id);
            return (
              <div key={p.id} className="proizvod-kartica">
                <div className="proizvod-tip-oznaka">{p.tip}</div>
                <h4>{p.naziv}</h4>
                <p className="proizvod-opis">{p.opis}</p>
                <div className="proizvod-footer">
                  <span className="proizvod-cena">{p.cena} RSD</span>
                  {uKorpi ? (
                    <div className="kolicina-kontrole">
                      <button
                        className="kolicina-btn"
                        onClick={() => smanjiKolicinu(p.id)}
                        aria-label="Smanji"
                      >−</button>
                      <span className="kolicina-broj">{uKorpi.kolicina}</span>
                      <button
                        className="kolicina-btn"
                        onClick={() => povecajKolicinu(p.id)}
                        aria-label="Povecaj"
                      >+</button>
                    </div>
                  ) : (
                    <button onClick={() => dodajUKorpu(p)} className="moje-dugme">
                      Dodaj +
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* DESNA STRANA: KORPA */}
      <aside className="korpa-sidebar">
        <div className="korpa-header">
          <h2>🛒 Tvoja Korpa</h2>
          {ukupnoStavki > 0 && (
            <span className="korpa-broj-stavki">{ukupnoStavki}</span>
          )}
        </div>

        {porudzbinaUspesna && (
          <div className="uspesna-poruka">
            ✅ Porudžbina je poslata! Prijatno! 🥞
          </div>
        )}

        {korpa.length === 0 ? (
          <div className="prazna-korpa">
            <span className="prazna-korpa-ikona">🛒</span>
            <p>Korpa je prazna.</p>
            <p className="prazna-korpa-hint">Dodajte nešto sa menija!</p>
          </div>
        ) : (
          <div className="korpa-sadrzaj">
            {korpa.map(item => (
              <div key={item.proizvod.id} className="stavka-korpe">
                <div className="stavka-info">
                  <div className="stavka-naziv">{item.proizvod.naziv}</div>
                  <div className="stavka-kolicina-red">
                    <button
                      className="kolicina-btn mali"
                      onClick={() => smanjiKolicinu(item.proizvod.id)}
                      aria-label="Smanji"
                    >−</button>
                    <span className="stavka-kolicina">{item.kolicina}</span>
                    <button
                      className="kolicina-btn mali"
                      onClick={() => povecajKolicinu(item.proizvod.id)}
                      aria-label="Povecaj"
                    >+</button>
                    <span className="stavka-jedinicna-cena">
                      × {item.proizvod.cena} RSD
                    </span>
                  </div>
                </div>
                <div className="stavka-desna-strana">
                  <div className="stavka-ukupno">
                    {item.kolicina * item.proizvod.cena} RSD
                  </div>
                  <button
                    className="ukloni-btn"
                    onClick={() => ukloniStavku(item.proizvod.id)}
                    aria-label="Ukloni stavku"
                    title="Ukloni"
                  >✕</button>
                </div>
              </div>
            ))}

            <div className="korpa-ukupno">
              Ukupno: <strong>{ukupnaCena} RSD</strong>
            </div>

            <button
              className="dugme-naruci"
              onClick={handleNaruci}
              disabled={porucivanjeUToku}
            >
              {porucivanjeUToku ? "Šaljem porudžbinu..." : "Naruči"}
            </button>

            <button className="dugme-isprazni" onClick={isprazniKorpu}>
              Isprazni korpu
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export default MeniPage;