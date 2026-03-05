import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IstorijaPage.css';

// 1. Prilagodjeni interfejsi tvojim DTO klasama
interface StavkaPrikaz {
    nazivProizvoda: string;
    kolicina: number;
    cena: number;      // Bilo je cenaPoKomadu
    iznosStavke: number;
}

interface PorudzbinaPrikaz {
    porudzbinaId: number; // Bilo je id
    datum: string;        // Bilo je vremeKreiranja
    status: string;       // Dodao sam i status posto ga imas
    ukupanIznos: number;  // Bilo je ukupnaCena
    stavke: StavkaPrikaz[]; 
}

export default function IstorijaPage() {
    const [porudzbine, setPorudzbine] = useState<PorudzbinaPrikaz[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchIstorija = async () => {
            const token = sessionStorage.getItem("token");
            
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const res = await fetch('http://localhost:8080/api/porudzbine/moje', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("Stigli podaci:", data); // Za proveru u konzoli
                    setPorudzbine(data);
                } else {
                    console.error("Greska pri ucitavanju istorije");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchIstorija();
    }, [navigate]);

    // Pomocna funkcija za lepsi ispis datuma
    const formatirajDatum = (datumString: string) => {
        if (!datumString) return "Nepoznat datum";
        const date = new Date(datumString);
        return date.toLocaleDateString("sr-RS") + " u " + date.toLocaleTimeString("sr-RS");
    };

    if (loading) return <p className="loading-text">Učitavam tvoje palačinke...</p>;

    return (
        <div className="istorija-container">
            <h1 className="istorija-naslov">ISTORIJA PORUDZBINA</h1>

            {porudzbine.length === 0 ? (
                <div className="prazna-istorija">
                    <p>Još uvek niste ništa naručili.</p>
                    <button onClick={() => navigate("/meni")} className="dugme-idi-na-meni">
                        Gladan sam! 🥞
                    </button>
                </div>
            ) : (
                <div className="porudzbine-grid">
                    {porudzbine.map(p => (
                        /* POPRAVLJENO: Koristimo p.porudzbinaId kao kljuc */
                        <div key={p.porudzbinaId} className="porudzbina-kartica">
                            
                            <div className="kartica-header">
                                <div>
                                    {/* POPRAVLJENO: Koristimo p.datum */}
                                    <span className="datum">{formatirajDatum(p.datum)}</span>
                                    <div style={{fontSize: '0.8em', color: '#888'}}>ID: #{p.porudzbinaId}</div>
                                </div>
                                
                                {/* POPRAVLJENO: Koristimo p.ukupanIznos */}
                                <div style={{textAlign: 'right'}}>
                                    <span className="cena-badge">{p.ukupanIznos} RSD</span>
                                    <div style={{fontSize: '1em', marginTop:'10px', color: '#888', }}>{p.status}</div>
                                </div>
                            </div>
                            
                            <div className="separator"></div>

                            <ul className="stavke-lista">
                                {p.stavke.map((stavka, index) => (
                                    <li key={index} style={{display:'flex', justifyContent:'space-between'}}>
                                        <span>
                                            {/* Prikaz kolicine i naziva */}
                                            {stavka.kolicina}x {stavka.nazivProizvoda}
                                        </span>
                                        <span style={{color: '#666'}}>
                                            {/* POPRAVLJENO: Prikaz cene po komadu */}
                                            {stavka.cena} RSD/kom
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}