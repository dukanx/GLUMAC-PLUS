import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [greska, setGreska] = useState("");


  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGreska("");

    try {

      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          email: email,
          lozinka: password
        }),
      });


      if (response.ok) {
        const data = await response.json();

        sessionStorage.setItem("korisnik", JSON.stringify(data.korisnik));
        sessionStorage.setItem("token", data.token);
        window.dispatchEvent(new Event('korisnikUpdate'));
        navigate("/meni");
      } else {
        setGreska("Pogrešan email ili lozinka!");
      }

    } catch (err) {
      console.error(err);
      setGreska("Ne mogu da se povezem sa serverom.");
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="animated-prijava" style={{ textAlign: 'center', marginBottom: '20px', color: '#333', }}>Prijava</h2>

        {/* Prikaz greske ako postoji */}
        {greska && <p style={{ color: 'red', textAlign: 'center' }}>{greska}</p>}

        <div className="form-group">
          <label>Email adresa:</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Lozinka:</label>
          <input
            type="password"
            placeholder="Vasa lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-btn">Prijavi se</button>
      </form>
    </div>
  )
}
