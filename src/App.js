import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/Chat';
import LoginPage from './pages/Login';

function ErrorBoundary({ children }) {
    try {
        return children;
    } catch (error) {
        console.error(error);
        return <h1>Algo deu errado. Confira o console.</h1>;
    }
}

// Componente para proteger rotas
function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token'); // Verifica se há um token armazenado
    return token ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route
                        path="/chat"
                        element={
                            <ProtectedRoute>
                                <ChatPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </Router>
        </ErrorBoundary>
    );
}

export default App;
