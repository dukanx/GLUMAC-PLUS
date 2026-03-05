import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoyaltyPage.css';
import React from 'react'; // Dodajte import React ovde

const NIVOI = [
  { naziv: "Nova zvezda", prag: 0, popust: 0 },
  { naziv: "Epizodista", prag: 100, popust: 5 },
  { naziv: "Glavna uloga", prag: 500, popust: 10 },
  { naziv: "Oscar za palačinke", prag: 1000, popust: 20 }
];

export default function LoyaltyPage() {
  const navigate = useNavigate();
  const [korisnik, setKorisnik] = useState<any>(null);

  useEffect(() => {
    const userJson = sessionStorage.getItem("korisnik");
    if (!userJson) {
      navigate("/login");
      return;
    }
    setKorisnik(JSON.parse(userJson));
  }, [navigate]);

  if (!korisnik) return <p style={{textAlign: 'center', marginTop: '50px', color: 'white'}}>Učitavam podatke...</p>;
  
  const trenutniNivo = [...NIVOI].reverse().find(n => korisnik.brojBodova >= n.prag) || NIVOI[0];
  const sledeciNivo = NIVOI.find(n => n.prag > korisnik.brojBodova);

  let procenatDoCilja = 100; 
  let bodoviDoCilja = 0;

  if (sledeciNivo) {
    const trenutniPrag = trenutniNivo.prag;
    const ciljniPrag = sledeciNivo.prag;
    const osvojenoUOpsegu = korisnik.brojBodova - trenutniPrag;
    const ukupnoUOpsegu = ciljniPrag - trenutniPrag;
    
    procenatDoCilja = (osvojenoUOpsegu / ukupnoUOpsegu) * 100;
    bodoviDoCilja = ciljniPrag - korisnik.brojBodova;
  }

  return (
    <div className="loyalty-container">
      
      <div className="loyalty-header">
        <h1>Zdravo, {korisnik.ime}! 👋</h1>
        <p>Trenutno imate:</p>
        <div className="points-display">{korisnik.brojBodova} bodova</div>
        <h3>Trenutni status: <span style={{color: '#ff9800'}}>{trenutniNivo.naziv}</span></h3>
        <p>Vaš popust na sve porudžbine: <strong>{trenutniNivo.popust}%</strong></p>

        {sledeciNivo ? (
          <div style={{ marginTop: '20px' }}>
            <p style={{fontSize: '0.9em', color: '#ccc'}}>
              Još <strong>{bodoviDoCilja}</strong> bodova do nivoa "{sledeciNivo.naziv}" (-{sledeciNivo.popust}%)
            </p>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${procenatDoCilja}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <p style={{color: '#4CAF50', marginTop: '10px', fontWeight: 'bold'}}>🏆 Dostigli ste maksimalni nivo!</p>
        )}
      </div>

      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#e0e0e0' }}>Nivoi napredovanja</h3>
      
      <div className="levels-roadmap">
        {NIVOI.map((nivo, index) => {
          const isActive = nivo.naziv === trenutniNivo.naziv;
          const isReached = korisnik.brojBodova >= nivo.prag;
          
          return (
            <React.Fragment key={nivo.naziv}>
              <div 
                className={`level-card ${isActive ? 'active' : ''} ${isReached ? 'reached' : ''}`}
              >
                <h4>{nivo.naziv}</h4>
                <p>{nivo.prag} bodova</p>
                <div className="popust-display">
                  {nivo.popust}%
                </div>
                <p style={{fontSize: '0.8em', color: isReached ? '#fff' : '#aaa'}}>POPUSTA</p>
              </div>
              
              {index < NIVOI.length - 1 && (
                <div className="roadmap-arrow">
                    <span> ➜</span>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

    </div>
  )
}
