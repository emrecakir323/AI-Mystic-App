import { useState, useEffect } from 'react';
import { 
  Coffee, 
  Sparkles, 
  Moon, 
  BookOpen, 
  HelpCircle, 
  Users, 
  Compass, 
  Flame, 
  Crown,
  Lock,
  Trash2,
  Save,
  Volume2,
  VolumeX,
  X,
  Share2,
  Check
} from 'lucide-react';
import { SavedReading } from '../services/geminiService';

interface HomeProps {
  setPage: (page: string) => void;
  isPremium: boolean;
  remainingCredits: number;
}

export default function Home({ setPage, isPremium, remainingCredits }: HomeProps) {
  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Saved readings states
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const [selectedReading, setSelectedReading] = useState<SavedReading | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isSavedText, setIsSavedText] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  const [profileName, setProfileName] = useState<string>('');

  useEffect(() => {
    // Load daily message
    const savedMsg = localStorage.getItem('ai_mystic_daily_msg');
    const savedDate = localStorage.getItem('ai_mystic_daily_msg_date');
    const today = new Date().toDateString();
    
    if (savedMsg && savedDate === today) {
      setDailyMessage(savedMsg);
    }

    // Load saved readings
    loadSavedReadings();

    // Load profile name
    const profileJson = localStorage.getItem('ai_mystic_user_profile');
    if (profileJson) {
      const parsed = JSON.parse(profileJson);
      setProfileName(parsed.name || '');
    }
  }, []);

  const loadSavedReadings = () => {
    const readingsJson = localStorage.getItem('ai_mystic_saved_readings');
    if (readingsJson) {
      setSavedReadings(JSON.parse(readingsJson));
    }
  };

  const drawDailyMessage = () => {
    setIsDrawing(true);
    setTimeout(() => {
      const messages = [
        "Bugün iç sesine kulak ver. Zihninin karmaşasından uzaklaşıp kalbinden gelen ilk doğru hisse güvenmelisin.",
        "Beklenmedik bir kaynaktan alacağın bir haber, günün ikinci yarısında enerjini tamamen yenileyecek.",
        "Finansal konularda aceleci davranmak yerine, önündeki fırsatları biraz daha analiz etmek yararına olacaktır.",
        "Sevgi dolu bir iletişim, bugün çözülmez sandığın bir düğümü kolayca açmanı sağlayacak. Kırgınlıkları geride bırak.",
        "Bugün karşına çıkacak ufak engeller aslında seni daha büyük bir ödüllendirmeye hazırlıyor. Sabırlı ve dik dur.",
        "Geçmişten gelen bir düşünceyi veya insanı özgür bırakmanın vakti geldi. Yeniye yer aç ki güzellikler gelsin."
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setDailyMessage(randomMsg);
      localStorage.setItem('ai_mystic_daily_msg', randomMsg);
      localStorage.setItem('ai_mystic_daily_msg_date', new Date().toDateString());
      setIsDrawing(false);
    }, 1500);
  };

  // Saved Reading actions
  const openSavedReading = (reading: SavedReading) => {
    window.speechSynthesis.cancel();
    setIsPlayingSpeech(false);
    setSelectedReading(reading);
    setNoteText(reading.notes || '');
  };

  const closeSavedReading = () => {
    window.speechSynthesis.cancel();
    setIsPlayingSpeech(false);
    setSelectedReading(null);
  };

  const handleSaveNote = () => {
    if (!selectedReading) return;
    
    const updated = savedReadings.map(r => {
      if (r.id === selectedReading.id) {
        return { ...r, notes: noteText };
      }
      return r;
    });

    localStorage.setItem('ai_mystic_saved_readings', JSON.stringify(updated));
    setSavedReadings(updated);
    
    setIsSavedText(true);
    setTimeout(() => setIsSavedText(false), 2000);
  };

  const handleDeleteReading = (id: string) => {
    const confirmDelete = window.confirm('Bu falı defterinizden silmek istediğinize emin misiniz?');
    if (!confirmDelete) return;

    const filtered = savedReadings.filter(r => r.id !== id);
    localStorage.setItem('ai_mystic_saved_readings', JSON.stringify(filtered));
    setSavedReadings(filtered);
    closeSavedReading();
  };

  const toggleSpeech = () => {
    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    if (!selectedReading) return;

    let readText = selectedReading.text;
    if (selectedReading.love) {
      readText += ` Aşk yorumunuz: ${selectedReading.love}. İş yorumunuz: ${selectedReading.career}. Maddi durum: ${selectedReading.money}.`;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(readText);
    utterance.lang = 'tr-TR';
    
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang.includes('tr'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    utterance.onend = () => setIsPlayingSpeech(false);
    utterance.onerror = () => setIsPlayingSpeech(false);

    setIsPlayingSpeech(true);
    window.speechSynthesis.speak(utterance);
  };

  const shareFortune = () => {
    if (!selectedReading) return;
    const shareText = `🔮 AI Mystic - Kaydedilen ${selectedReading.typeName} Yorumum:\n\n${selectedReading.text}\n\nUygulamayı indirin ve kendi falınızı baktırın!`;
    navigator.clipboard.writeText(shareText);
    alert('Fal kopyalandı! Dilediğiniz yerde paylaşabilirsiniz.');
  };

  const getServiceEmoji = (type: string) => {
    switch (type) {
      case 'coffee': return '☕';
      case 'tarot': return '🎴';
      case 'palm': return '✋';
      case 'dream': return '🌙';
      case 'horoscope': return '♈';
      case 'friendship': return '👥';
      default: return '🔮';
    }
  };

  const services = [
    { id: 'coffee', name: 'Kahve Falı', icon: Coffee, desc: 'Fincanının fotoğrafını çek, AI şekilleri masalsı bir dille yorumlasın.', color: '#a855f7' },
    { id: 'tarot', name: 'Tarot', icon: Compass, desc: 'Seçeceğin 3 tarot kartı ile geçmiş, şimdi ve geleceğin enerjilerini birleştir.', color: '#eab308' },
    { id: 'palm', name: 'El Falı', icon: Sparkles, desc: 'Avuç içinin fotoğrafını yükle; yaşam, kalp ve baş çizgilerini analiz edelim.', color: '#f43f5e' },
    { id: 'dream', name: 'Rüya Yorumu', icon: BookOpen, desc: 'Gördüğün rüyayı yaz; AI rüyandaki gizemli sembolleri açığa çıkarsın.', color: '#06b6d4' },
    { id: 'horoscope', name: 'Burç Analizi', icon: Moon, desc: 'Doğum haritana uyumlu günlük, haftalık ve aylık AI destekli burç yorumları.', color: '#ec4899' },
    { id: 'oracle', name: 'AI Kahin', icon: HelpCircle, desc: 'Kafandaki soruları sor, bilge kahinden motive edici yanıtlar al.', color: '#3b82f6' },
    { id: 'friendship', name: 'Arkadaş Falı', icon: Users, desc: 'İki fincanı karşılaştır; arkadaşlığınızın veya aşkınızın enerjisini ölç.', color: '#10b981', premium: true }
  ];

  return (
    <div className="scroll-view">
      {/* Welcome Banner if name is set */}
      {profileName && (
        <div className="glass-card mb-4 text-center" style={{ animation: 'fade-in 0.5s ease-out', border: '1px solid var(--accent-gold-glow)', padding: '12px' }}>
          <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mystic)', color: 'var(--accent-gold)' }} className="mb-1">
            Hoş Geldin, {profileName} ✨
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mistik rehberin senin için hazırlandı.</p>
        </div>
      )}

      {/* Premium Banner */}
      {isPremium ? (
        <div className="glass-card-gold flex-between mb-4">
          <div className="flex-row" style={{ gap: '10px' }}>
            <Crown size={24} color="#ffb703" />
            <div>
              <h4 style={{ fontFamily: 'var(--font-mystic)', color: '#ffb703' }}>Mystic Premium Üye</h4>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 183, 3, 0.8)' }}>Sınırsız fal hakkı ve özel temalar aktif!</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card mb-4" style={{ borderLeft: '3px solid var(--accent-gold)' }}>
          <div className="flex-between">
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Günlük Kalan Ücretsiz Hak</p>
              <h3 style={{ fontFamily: 'var(--font-mystic)', color: 'var(--accent-gold)' }}>
                {remainingCredits} / 1 Fal
              </h3>
            </div>
            <button className="glass-button-gold" onClick={() => setPage('checkout')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Crown size={14} /> Premium'a Geç
            </button>
          </div>
        </div>
      )}

      {/* Daily Energy Message */}
      <div className="glass-card mb-4 text-center" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 5, right: 5 }} className="premium-badge">
          <Flame size={10} /> Günün Kartı
        </div>
        <h3 className="mb-2" style={{ fontSize: '1.2rem' }}>Günün Enerjisi</h3>
        {dailyMessage ? (
          <div style={{ animation: 'fade-in 0.5s ease-out' }}>
            <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              "{dailyMessage}"
            </p>
            <p className="disclaimer-text mt-2" style={{ border: 'none', padding: 0 }}>Günün enerjisi tamamen motive edici tavsiye niteliğindedir.</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="mb-4">
              Bugün evrenin sana fısıldadığı özel mesajı almak için tek kart çek.
            </p>
            <button 
              className="glass-button-gold" 
              onClick={drawDailyMessage} 
              disabled={isDrawing}
              style={{ margin: '0 auto', minWidth: '150px' }}
            >
              {isDrawing ? (
                <>
                  <div className="spinner" /> Çekiliyor...
                </>
              ) : (
                <>
                  <Compass size={16} /> Kart Çek
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Services Grid */}
      <h2 className="mb-4 text-center title-gold" style={{ fontSize: '1.4rem' }}>Hizmetlerimiz</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="mb-6">
        {services.map((svc) => {
          const IconComponent = svc.icon;
          const isLocked = svc.premium && !isPremium;
          return (
            <div 
              key={svc.id} 
              className="glass-card flex-between" 
              style={{ 
                cursor: 'pointer',
                borderLeft: `4px solid ${svc.color}`,
                padding: '16px'
              }}
              onClick={() => setPage(svc.id)}
            >
              <div style={{ flex: 1, paddingRight: '12px' }}>
                <div className="flex-row mb-2" style={{ gap: '8px' }}>
                  <div 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px', 
                      background: `rgba(${parseInt(svc.color.slice(1,3),16) || 138}, ${parseInt(svc.color.slice(3,5),16) || 43}, ${parseInt(svc.color.slice(5,7),16) || 226}, 0.15)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: svc.color
                    }}
                  >
                    <IconComponent size={18} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{svc.name}</h3>
                  {svc.premium && (
                    <span className="premium-badge">
                      <Crown size={8} /> Premium
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {svc.desc}
                </p>
              </div>
              {isLocked ? (
                <Lock size={16} color="var(--accent-gold)" />
              ) : (
                <span style={{ color: svc.color, fontSize: '1.2rem', fontWeight: 'bold' }}>→</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Saved Readings History Section */}
      <h2 className="mb-4 text-center title-gold" style={{ fontSize: '1.4rem' }}>Mistik Defterim 📖</h2>
      <div className="glass-card mb-4" style={{ padding: '16px' }}>
        {savedReadings.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>
            Henüz defterinize bir fal kaydetmediniz. Fallarınız bakıldığında otomatik olarak buraya eklenir.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {savedReadings.map((reading) => (
              <div 
                key={reading.id}
                onClick={() => openSavedReading(reading)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                className="hover:bg-[rgba(255,255,255,0.06)]"
              >
                <div style={{ fontSize: '1.5rem' }}>{getServiceEmoji(reading.type)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {reading.title}
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{reading.date}</span>
                </div>
                {reading.notes && (
                  <span style={{ fontSize: '0.65rem', background: 'rgba(255,183,3,0.1)', color: 'var(--accent-gold)', border: '1px solid var(--glass-border-gold)', borderRadius: '4px', padding: '1px 4px' }}>
                    Notlu
                  </span>
                )}
                <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Reading Detail Modal */}
      {selectedReading && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(3, 1, 7, 0.85)', backdropFilter: 'blur(8px)', zIndex: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
        >
          <div 
            className="glass-card" 
            style={{ 
              width: '100%', maxWidth: '440px', maxHeight: '80vh', overflowY: 'auto',
              border: '1px solid var(--accent-gold)', position: 'relative', margin: 0 
            }}
          >
            {/* Close Button */}
            <button 
              onClick={closeSavedReading}
              style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="mb-4 pr-6">
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>
                {getServiceEmoji(selectedReading.type)}
              </span>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}>{selectedReading.title}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedReading.date}</span>
            </div>

            {/* Modal Body (Text Content) */}
            <div style={{ 
              lineHeight: '1.6', fontSize: '0.9rem', color: 'var(--text-primary)', 
              maxHeight: '220px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)',
              padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)',
              whiteSpace: 'pre-line' 
            }} className="mb-4">
              {selectedReading.text}
              
              {selectedReading.love && (
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ fontSize: '0.8rem', borderLeft: '2px solid #f43f5e', paddingLeft: '8px' }}><strong>Aşk:</strong> {selectedReading.love}</p>
                  <p style={{ fontSize: '0.8rem', borderLeft: '2px solid #3b82f6', paddingLeft: '8px' }}><strong>Kariyer:</strong> {selectedReading.career}</p>
                  <p style={{ fontSize: '0.8rem', borderLeft: '2px solid #eab308', paddingLeft: '8px' }}><strong>Para:</strong> {selectedReading.money}</p>
                </div>
              )}
            </div>

            {/* TTS & Share Actions */}
            <div style={{ display: 'flex', gap: '10px' }} className="mb-4">
              <button className={`glass-button flex-1`} onClick={toggleSpeech} style={{ fontSize: '0.8rem' }}>
                {isPlayingSpeech ? <><VolumeX size={14} /> Durdur</> : <><Volume2 size={14} /> Sesli Dinle</>}
              </button>
              <button className="glass-button flex-1" onClick={shareFortune} style={{ fontSize: '0.8rem' }}>
                <Share2 size={14} /> Paylaş
              </button>
            </div>

            {/* Comment Notes Block */}
            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '16px' }} className="mb-4">
              <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginBottom: '8px' }}>Fal Günlüğüm (Kişisel Not Ekle) ✍️</h4>
              <textarea 
                className="glass-input mb-2"
                placeholder="Örn: Bu falın aşk yorumu tamamen doğru çıktı! / Bugün bu yolla karşılaştım..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={2}
                style={{ fontSize: '0.8rem', padding: '10px' }}
              />
              <button className="glass-button-gold w-full" onClick={handleSaveNote} style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
                {isSavedText ? <><Check size={14} /> Kaydedildi</> : <><Save size={14} /> Notu Kaydet</>}
              </button>
            </div>

            {/* Delete button */}
            <button 
              onClick={() => handleDeleteReading(selectedReading.id)}
              style={{ background: 'none', border: 'none', color: '#ff5252', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', margin: '10px auto 0 auto' }}
            >
              <Trash2 size={12} /> Bu Falı Sil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
