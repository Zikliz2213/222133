import { useEffect, useRef, useState } from 'react';
import { ApiService } from './services/api';
import { WebSocketService } from './services/websocket';
import { AuthScreen } from './components/AuthScreen';
import { MainScreen } from './components/MainScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    if (token) {
      ApiService.setToken(token);
      // Verify token and get current user
      ApiService.get('/auth/me')
        .then((user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          // Initialize WebSocket
          wsRef.current = new WebSocketService(token);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (token: string) => {
    localStorage.setItem('token', token);
    ApiService.setToken(token);
    
    try {
      const user = await ApiService.get('/auth/me');
      setCurrentUser(user);
      setIsAuthenticated(true);
      wsRef.current = new WebSocketService(token);
    } catch (error) {
      console.error('Failed to get user info:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    ApiService.setToken(null);
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-tg-dark-bg dark:bg-tg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-tg-primary mx-auto"></div>
          <p className="mt-4 text-white">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      {!isAuthenticated ? (
        <AuthScreen onLogin={handleLogin} />
      ) : (
        <MainScreen 
          currentUser={currentUser} 
          onLogout={handleLogout}
          wsService={wsRef.current}
        />
      )}
    </div>
  );
}

export default App;
