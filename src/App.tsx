import { useState, useEffect } from 'react';
import { 
  Compass, 
  Coffee, 
  Sparkles, 
  HelpCircle, 
  Settings,
  Tv
} from 'lucide-react';

// Pages
import Home from './pages/Home';
import CoffeeReading from './pages/CoffeeReading';
import TarotReading from './pages/TarotReading';
import PalmReading from './pages/PalmReading';
import Horoscope from './pages/Horoscope';
import DreamInterpreter from './pages/DreamInterpreter';
import OracleChat from './pages/OracleChat';
import FriendshipReading from './pages/FriendshipReading';
import SettingsAndPremium from './pages/SettingsAndPremium';
import PremiumCheckout from './pages/PremiumCheckout';

export default function App() {
  const [page, setPage] = useState<string>('home');
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem('ai_mystic_premium') === 'true';
  });
  
  const [remainingCredits, setRemainingCredits] = useState<number>(() => {
    const savedCredits = localStorage.getItem('ai_mystic_credits');
    return savedCredits ? parseInt(savedCredits, 10) : 1;
  });

  const [theme, setThemeState] = useState<string>(() => {
    return localStorage.getItem('ai_mystic_theme') || 'cosmic';
  });

  // Watch Ad Overlay State
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);

  // Set Theme Properties
  useEffect(() => {
    localStorage.setItem('ai_mystic_theme', theme);
  }, [theme]);

  // Sync Premium State
  useEffect(() => {
    localStorage.setItem('ai_mystic_premium', String(isPremium));
  }, [isPremium]);

  // Sync Credits State
  useEffect(() => {
    localStorage.setItem('ai_mystic_credits', String(remainingCredits));
  }, [remainingCredits]);

  // Helper: Use a credit if not premium. Returns true if allowed, false if not.
  const useCredit = (): boolean => {
    if (isPremium) return true;
    if (remainingCredits > 0) {
      setRemainingCredits(prev => prev - 1);
      return true;
    }
    // Show Ad prompt
    const confirmAd = window.confirm(
      'Günlük fal hakkınız doldu.\nPremium\'a geçebilir veya 5 saniyelik bir reklam izleyerek ek fal hakkı kazanabilirsiniz.\n\nReklam izlemek ister misiniz?'
    );
    
    if (confirmAd) {
      triggerRewardedAd();
    } else {
      setPage('settings');
    }
    return false;
  };

  const triggerRewardedAd = () => {
    setShowAdOverlay(true);
    setAdCountdown(5);
  };

  // Rewarded Ad countdown timer
  useEffect(() => {
    if (showAdOverlay && adCountdown > 0) {
      const timer = setTimeout(() => {
        setAdCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showAdOverlay && adCountdown === 0) {
      setShowAdOverlay(false);
      setRemainingCredits(prev => prev + 1);
      alert('Tebrikler! Reklam izlediğiniz için +1 fal hakkı kazandınız.');
    }
  }, [showAdOverlay, adCountdown]);

  const resetCredits = () => {
    setRemainingCredits(1);
    alert('Günlük fal hakkınız sıfırlandı: 1 hak tanımlandı.');
  };

  // Render active page view
  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home setPage={setPage} isPremium={isPremium} remainingCredits={remainingCredits} />;
      case 'coffee':
        return <CoffeeReading onBack={() => setPage('home')} isPremium={isPremium} useCredit={useCredit} />;
      case 'tarot':
        return <TarotReading onBack={() => setPage('home')} isPremium={isPremium} useCredit={useCredit} />;
      case 'palm':
        return <PalmReading onBack={() => setPage('home')} isPremium={isPremium} useCredit={useCredit} />;
      case 'horoscope':
        return <Horoscope onBack={() => setPage('home')} isPremium={isPremium} useCredit={useCredit} />;
      case 'dream':
        return <DreamInterpreter onBack={() => setPage('home')} isPremium={isPremium} useCredit={useCredit} />;
      case 'oracle':
        return <OracleChat onBack={() => setPage('home')} isPremium={isPremium} useCredit={useCredit} />;
      case 'friendship':
        return <FriendshipReading onBack={() => setPage('home')} isPremium={isPremium} setPage={setPage} />;
      case 'settings':
        return (
          <SettingsAndPremium 
            isPremium={isPremium} 
            setIsPremium={setIsPremium} 
            resetCredits={resetCredits}
            currentTheme={theme}
            setTheme={setThemeState}
            setPage={setPage}
          />
        );
      case 'checkout':
        return (
          <PremiumCheckout 
            onBack={() => setPage('home')} 
            onPurchaseSuccess={() => { 
              setIsPremium(true); 
              setPage('home'); 
            }} 
          />
        );
      default:
        return <Home setPage={setPage} isPremium={isPremium} remainingCredits={remainingCredits} />;
    }
  };

  // Nav Item helper to figure out active highlight
  const getNavActive = (item: string) => {
    if (item === 'home' && ['home', 'palm', 'horoscope', 'dream', 'friendship'].includes(page)) return 'active';
    if (item === 'tarot' && page === 'tarot') return 'active';
    if (item === 'coffee' && page === 'coffee') return 'active';
    if (item === 'oracle' && page === 'oracle') return 'active';
    if (item === 'settings' && page === 'settings') return 'active';
    return '';
  };

  return (
    <div className="app-container" data-theme={theme}>
      {/* Decorative stars */}
      <div className="stars-container">
        <div className="sparkle" style={{ top: '15%', left: '10%', width: '3px', height: '3px', animationDelay: '0.5s' }} />
        <div className="sparkle" style={{ top: '40%', left: '85%', width: '4px', height: '4px', animationDelay: '1.2s' }} />
        <div className="sparkle" style={{ top: '75%', left: '20%', width: '3px', height: '3px', animationDelay: '0.2s' }} />
        <div className="sparkle" style={{ top: '85%', left: '80%', width: '5px', height: '5px', animationDelay: '2.5s' }} />
        <div className="sparkle" style={{ top: '5%', left: '60%', width: '2px', height: '2px', animationDelay: '1.8s' }} />
      </div>

      {/* Main Content Area */}
      {renderPage()}

      {/* Fixed bottom navigation bar */}
      <nav className="bottom-nav">
        <button className={`nav-item ${getNavActive('home')}`} onClick={() => setPage('home')}>
          <Compass />
          <span>Keşfet</span>
        </button>
        <button className={`nav-item ${getNavActive('tarot')}`} onClick={() => setPage('tarot')}>
          <Sparkles />
          <span>Tarot</span>
        </button>
        <button className={`nav-item ${getNavActive('coffee')}`} onClick={() => setPage('coffee')}>
          <Coffee />
          <span>Kahve</span>
        </button>
        <button className={`nav-item ${getNavActive('oracle')}`} onClick={() => setPage('oracle')}>
          <HelpCircle />
          <span>Kahin</span>
        </button>
        <button className={`nav-item ${getNavActive('settings')}`} onClick={() => setPage('settings')}>
          <Settings />
          <span>Ayarlar</span>
        </button>
      </nav>

      {/* Rewarded Ad simulation overlay */}
      {showAdOverlay && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: '#000', zIndex: 1000, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '20px'
          }}
        >
          <Tv size={64} color="var(--accent-gold)" className="mb-4 spin" />
          <h3 className="mb-2" style={{ fontFamily: 'var(--font-mystic)' }}>Sponsorlu Reklam</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }} className="mb-4 text-center">
            Destek aldığınız için teşekkürler. Fal hakkınız yükleniyor.
          </p>
          <div 
            style={{ 
              width: '60px', height: '60px', borderRadius: '50%', border: '4px solid var(--accent-purple)',
              display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 'bold'
            }}
          >
            {adCountdown}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '20px' }}>
            Reklamı kapatmak için sürenin bitmesini bekleyin
          </span>
        </div>
      )}
    </div>
  );
}
