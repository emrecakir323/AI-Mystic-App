import { useState } from 'react';
import { 
  Key, 
  Crown, 
  Settings, 
  Check, 
  AlertCircle, 
  Volume2, 
  Eye, 
  EyeOff, 
  Palette,
  Info,
  ExternalLink,
  ShieldCheck,
  Cpu,
  User
} from 'lucide-react';
import { getApiKey, saveApiKey, removeApiKey } from '../services/geminiService';

interface SettingsAndPremiumProps {
  isPremium: boolean;
  setIsPremium: (status: boolean) => void;
  resetCredits: () => void;
  currentTheme: string;
  setTheme: (theme: string) => void;
  setPage: (page: string) => void;
}

export default function SettingsAndPremium({ 
  isPremium, 
  setIsPremium, 
  resetCredits,
  currentTheme,
  setTheme,
  setPage
}: SettingsAndPremiumProps) {
  const [apiKeyInput, setApiKeyInput] = useState(() => getApiKey());
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Profile local states
  const [profileName, setProfileName] = useState(() => {
    const saved = localStorage.getItem('ai_mystic_user_profile');
    if (saved) {
      return JSON.parse(saved).name || '';
    }
    return '';
  });

  const [profileBirthDate, setProfileBirthDate] = useState(() => {
    const saved = localStorage.getItem('ai_mystic_user_profile');
    if (saved) {
      return JSON.parse(saved).birthDate || '';
    }
    return '';
  });

  const [profileBirthTime, setProfileBirthTime] = useState(() => {
    const saved = localStorage.getItem('ai_mystic_user_profile');
    if (saved) {
      return JSON.parse(saved).birthTime || '';
    }
    return '';
  });

  const [profileBirthPlace, setProfileBirthPlace] = useState(() => {
    const saved = localStorage.getItem('ai_mystic_user_profile');
    if (saved) {
      return JSON.parse(saved).birthPlace || '';
    }
    return '';
  });

  const [profileRelationship, setProfileRelationship] = useState(() => {
    const saved = localStorage.getItem('ai_mystic_user_profile');
    if (saved) {
      return JSON.parse(saved).relationshipStatus || 'single';
    }
    return 'single';
  });

  const [profileWork, setProfileWork] = useState(() => {
    const saved = localStorage.getItem('ai_mystic_user_profile');
    if (saved) {
      return JSON.parse(saved).workStatus || 'employed';
    }
    return 'employed';
  });

  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const handleSaveProfile = () => {
    const newProfile = {
      name: profileName.trim(),
      birthDate: profileBirthDate,
      birthTime: profileBirthTime,
      birthPlace: profileBirthPlace.trim(),
      relationshipStatus: profileRelationship,
      workStatus: profileWork
    };

    localStorage.setItem('ai_mystic_user_profile', JSON.stringify(newProfile));
    setIsProfileSaved(true);
    
    // Also notify main context if needed, but since it's saved in local storage,
    // the next time any fal service is triggered, it will fetch it automatically.
    setTimeout(() => setIsProfileSaved(false), 2000);
  };

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      saveApiKey(apiKeyInput.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } else {
      removeApiKey();
      setApiKeyInput('');
      alert('API Anahtarı kaldırıldı. Uygulama simülasyon moduna geri döndü.');
    }
  };

  const handleSimulatePremium = () => {
    if (isPremium) {
      setIsPremium(false);
      localStorage.removeItem('ai_mystic_premium');
      alert('Premium üyeliğiniz sonlandırıldı. Tekrar bekleriz!');
    } else {
      setPage('checkout');
    }
  };

  const testVoice = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance("Selam fani dostum, sesli fal anlatım motoru hazır ve seni dinliyor.");
    utterance.lang = 'tr-TR';
    
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang.includes('tr'));
    if (trVoice) {
      utterance.voice = trVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const activeKey = getApiKey();
  const isActive = activeKey.length > 0;

  return (
    <div className="scroll-view" style={{ animation: 'fade-in 0.4s ease-out' }}>
      {/* Page Title */}
      <div className="flex-row mb-4" style={{ gap: '10px' }}>
        <Settings size={22} color="var(--accent-gold)" />
        <h2 style={{ fontSize: '1.2rem' }}>Ayarlar & Premium 🔮</h2>
      </div>

      {/* Connection / Engine Status Indicator */}
      <div 
        className="glass-card mb-4" 
        style={{ 
          borderLeft: isActive ? '4px solid #10b981' : '4px solid #f59e0b',
          background: isActive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)'
        }}
      >
        <div className="flex-row" style={{ gap: '10px' }}>
          <Cpu size={20} color={isActive ? '#10b981' : '#f59e0b'} />
          <div>
            <h4 style={{ fontSize: '0.9rem', color: isActive ? '#10b981' : '#f59e0b' }}>
              {isActive ? 'Gerçek Yapay Zeka Modu Aktif 🟢' : 'Akıllı Simülasyon Modu Aktif 🟡'}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
              {isActive 
                ? 'Kendi API anahtarınız yüklü. Görsel taramalar ve sohbetler gerçek Gemini AI tarafından analiz edilir.'
                : 'API anahtarı bulunamadı. Yapay zeka ile aynı mantıkta çalışan hazır simülasyon falları üretilir.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Mystical Profile Editor */}
      <div className="glass-card mb-4">
        <h3 className="mb-2" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={16} color="var(--accent-gold)" /> Mistik Profilim 👤
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="mb-4">
          Kişisel bilgilerinizi girerek fallarınızın ve burç yorumlarınızın tamamen sizin haritanıza özel olarak şekillenmesini sağlayın.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Adınız veya Rumuz</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Örn: Aslı"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Doğum Tarihi</label>
              <input 
                type="date" 
                className="glass-input" 
                value={profileBirthDate}
                onChange={(e) => setProfileBirthDate(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Doğum Saati</label>
              <input 
                type="time" 
                className="glass-input" 
                value={profileBirthTime}
                onChange={(e) => setProfileBirthTime(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Doğum Yeri (Şehir/Ülke)</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Örn: İzmir / Türkiye"
              value={profileBirthPlace}
              onChange={(e) => setProfileBirthPlace(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>İlişki Durumu</label>
              <select 
                className="glass-input" 
                value={profileRelationship}
                onChange={(e) => setProfileRelationship(e.target.value)}
                style={{ fontSize: '0.85rem', background: '#0a0514' }}
              >
                <option value="single">Bekar</option>
                <option value="relationship">İlişkisi Var</option>
                <option value="married">Evli</option>
                <option value="crush">Platonik</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Mesleki Durum</label>
              <select 
                className="glass-input" 
                value={profileWork}
                onChange={(e) => setProfileWork(e.target.value)}
                style={{ fontSize: '0.85rem', background: '#0a0514' }}
              >
                <option value="student">Öğrenci</option>
                <option value="employed">Çalışan</option>
                <option value="unemployed">İş Arıyor / Çalışmıyor</option>
              </select>
            </div>
          </div>

          <button 
            className="glass-button-gold w-full mt-2" 
            onClick={handleSaveProfile}
            style={{ padding: '10px' }}
          >
            {isProfileSaved ? <><Check size={14} /> Profil Kaydedildi ✓</> : 'Profili Güncelle'}
          </button>
        </div>
      </div>

      {/* API Key Panel */}
      <div className="glass-card mb-4">
        <h3 className="mb-2" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Key size={16} color="var(--accent-gold)" /> Gemini API Anahtarı
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="mb-4">
          Google yapay zekasının (fincan şekillerini, el çizgilerini okuma ve canlı sohbet) tüm sınırlarını açmak için API anahtarınızı girin.
        </p>

        <div className="flex-row" style={{ gap: '8px', position: 'relative' }}>
          <input 
            type={showKey ? 'text' : 'password'} 
            className="glass-input" 
            placeholder="Kişisel API Anahtarınız (AIzaSy...)"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            style={{ paddingRight: '45px', fontSize: '0.85rem' }}
          />
          <button 
            type="button"
            onClick={() => setShowKey(!showKey)}
            style={{
              position: 'absolute', right: 12, background: 'none', border: 'none', 
              color: 'var(--text-muted)', cursor: 'pointer'
            }}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex-between mt-3">
          <button 
            onClick={() => setShowTutorial(!showTutorial)}
            style={{ 
              background: 'none', border: 'none', fontSize: '0.8rem', 
              color: 'var(--accent-gold)', textDecoration: 'underline', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '3px'
            }}
          >
            <Info size={12} /> {showTutorial ? 'Rehberi Kapat' : 'Ücretsiz Nasıl Alınır?'}
          </button>
          
          <button 
            className="glass-button" 
            onClick={handleSaveKey}
            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          >
            {isSaved ? <Check size={14} color="var(--accent-gold)" /> : 'Kaydet'}
          </button>
        </div>

        {/* Security notice */}
        <div className="flex-row mt-3" style={{ gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Güvenlik Garantisi: API Anahtarınız hiçbir sunucuya gönderilmez, sadece bu cihazda saklanır.</span>
        </div>

        {/* Onboarding Tutorial Step-by-Step */}
        {showTutorial && (
          <div 
            style={{ 
              marginTop: '16px', padding: '14px', borderRadius: '10px', 
              background: 'rgba(0,0,0,0.3)', border: '1px dashed var(--glass-border-gold)',
              animation: 'fade-in 0.3s ease-out'
            }}
          >
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginBottom: '10px' }}>
              🔑 3 Adımda Ücretsiz API Anahtarı Alın
            </h4>
            
            <ol style={{ paddingLeft: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: '1.4' }}>
              <li>
                Aşağıdaki butona tıklayarak <strong>Google AI Studio</strong> platformunu açın. (Tamamen ücretsizdir).
              </li>
              <li>
                Google (Gmail) hesabınızla giriş yaptıktan sonra soldaki mavi <strong>"Get API Key"</strong> (API Anahtarı Al) butonuna basın ve yeni bir anahtar oluşturun.
              </li>
              <li>
                Oluşturulan <code>AIzaSy...</code> ile başlayan uzun kod dizisini kopyalayın, yukarıdaki kutucuğa yapıştırıp <strong>Kaydet</strong>'e basın.
              </li>
            </ol>

            <a 
              href="https://aistudio.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="glass-button-gold w-full mt-3"
              style={{ padding: '10px', fontSize: '0.75rem', textDecoration: 'none' }}
            >
              Google AI Studio sitesini aç <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>

      {/* Premium Subscription Card */}
      <div className="glass-card-gold mb-4">
        <div className="flex-between mb-4">
          <h3 style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Crown size={18} /> Mystic Premium
          </h3>
          {isPremium && <span className="premium-badge">Aktif</span>}
        </div>

        <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }} className="mb-4">
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✨ <strong>Sınırsız Fal:</strong> Günlük sınırlandırma olmadan dilediğiniz kadar fal baktırın.</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>👥 <strong>Arkadaş Falı:</strong> Uyum analizi ve çiftli fincan yorumlama modunu açın.</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🗣️ <strong>Sesli Anlatım:</strong> AI faldan gelen yorumları kulağa hitap eden Türkçe sesle dinleyin.</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🚫 <strong>Reklamsız Deneyim:</strong> Sıra beklemeden, kesintisiz mistik seanslar yapın.</li>
        </ul>

        <button 
          className="glass-button-gold w-full" 
          onClick={handleSimulatePremium}
          style={{ textTransform: 'uppercase' }}
        >
          {isPremium ? 'Premium İptal Et (Simüle)' : 'Üyeliği Başlat (Ücretsiz Simüle)'}
        </button>
      </div>

      {/* Theme Selector */}
      <div className="glass-card mb-4">
        <h3 className="mb-3" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Palette size={16} color="var(--accent-gold)" /> Görsel Temalar
        </h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'cosmic', name: 'Kozmik', desc: 'Mor & Altın', color1: '#8a2be2', color2: '#ffb703' },
            { id: 'obsidian', name: 'Obsidyen', desc: 'Siyah & Gümüş', color1: '#111', color2: '#999' },
            { id: 'solar', name: 'Güneş', desc: 'Lacivert & Sarı', color1: '#0a192f', color2: '#eab308' }
          ].map((themeOpt) => {
            const isSelected = currentTheme === themeOpt.id;
            return (
              <button
                key={themeOpt.id}
                onClick={() => setTheme(themeOpt.id)}
                style={{
                  flex: 1, padding: '12px 8px', border: '1px solid',
                  borderColor: isSelected ? 'var(--accent-gold)' : 'var(--glass-border)',
                  background: 'rgba(10,5,20,0.5)', borderRadius: '8px', cursor: 'pointer',
                  textAlign: 'center', transition: 'var(--transition-smooth)'
                }}
              >
                <div style={{ 
                  width: '20px', height: '20px', borderRadius: '50%', margin: '0 auto 6px auto',
                  background: `linear-gradient(135deg, ${themeOpt.color1}, ${themeOpt.color2})`,
                  boxShadow: isSelected ? '0 0 8px var(--accent-gold-glow)' : 'none'
                }} />
                <h4 style={{ fontSize: '0.8rem', color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>{themeOpt.name}</h4>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{themeOpt.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Speech Test Button */}
      <div className="glass-card mb-4">
        <h3 className="mb-2" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Volume2 size={16} color="var(--accent-gold)" /> Sesli Anlatım Motoru
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="mb-3">
          Tarayıcınızın Türkçe ses sentezleyicisini test etmek için aşağıdaki butona basın.
        </p>
        <button className="glass-button w-full" onClick={testVoice}>
          <Volume2 size={16} /> Ses Testi Yap
        </button>
      </div>

      {/* Credit Reset simulator */}
      <div className="glass-card mb-4 text-center">
        <h3 className="mb-2" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
          <AlertCircle size={16} /> Günlük Hakları Sıfırla
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="mb-3">
          Geliştirici testi için günlük ücretsiz fal hakkınızı sıfırlayabilirsiniz.
        </p>
        <button className="glass-button" onClick={resetCredits} style={{ margin: '0 auto', fontSize: '0.8rem' }}>
          Hakları Yenile (Geliştirici)
        </button>
      </div>

      {/* Legal disclaimer */}
      <p className="disclaimer-text">
        AI Mystic 🔮 tamamen eğlence ve motivasyon amacıyla tasarlanmış bir yapay zeka uygulamasıdır. Sağlık, hukuk veya finansal konularda bağlayıcı öneriler sunmaz. Herhangi bir tıbbi sorun veya yasal işlem için profesyonellere danışın.
      </p>
    </div>
  );
}
