import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { korisnik } = useAuth();

    if (!korisnik) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}