import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Share2, 
  RefreshCw,
  Camera,
  Crown
} from 'lucide-react';
import { getFriendshipReading, ReadingResult, saveReadingToHistory } from '../services/geminiService';

interface FriendshipReadingProps {
  onBack: () => void;
  isPremium: boolean;
  setPage: (page: string) => void;
}

const PRESET_FRIENDS = [
  { id: 'f1', name: 'Sol Fincan', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=200&auto=format&fit=crop' },
  { id: 'f2', name: 'Sağ Fincan', url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=200&auto=format&fit=crop' }
];

export default function FriendshipReading({ onBack, isPremium, setPage }: FriendshipReadingProps) {
  const [img1, setImg1] = useState<string | null>(null);
  const [img2, setImg2] = useState<string | null>(null);
  const [file1, setFile1] = useState<File | undefined>(undefined);
  const [file2, setFile2] = useState<File | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [animatedPercent, setAnimatedPercent] = useState(0);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);

  // Animate compatibility percentage counter when results load
  useEffect(() => {
    if (result && result.compatibilityPercent) {
      let current = 0;
      const target = result.compatibilityPercent;
      const interval = setInterval(() => {
        current += 1;
        setAnimatedPercent(current);
        if (current >= target) {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [result]);

  const handleImageUpload = (slot: 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (slot === 1) {
          setFile1(file);
          setImg1(reader.result as string);
        } else {
          setFile2(file);
          setImg2(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPresets = () => {
    setImg1(PRESET_FRIENDS[0].url);
    setImg2(PRESET_FRIENDS[1].url);
    setFile1(undefined);
    setFile2(undefined);
  };

  const startReading = async () => {
    if (!img1 || !img2) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    const steps = [
      'Birinci fincan enerjisi çıkarılıyor...',
      'İkinci fincan enerjisi saptanıyor...',
      'Giriş frekansları senkronize ediliyor...',
      'Ortak enerji küresi ve uyum katsayısı hesaplanıyor...',
      'AI Kahin arkadaşlık hikayenizi birleştiriyor...'
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        setLoadingStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const reading = await getFriendshipReading(file1, file2);
      setResult(reading);
      saveReadingToHistory('friendship', 'Arkadaş Falı', `Ortak Uyum Falı - %${reading.compatibilityPercent}`, reading);
    } catch (err: any) {
      setError(err.message || 'Uyum analizi yapılırken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!result) return;
    const readText = `Uyum yüzdeniz yüzde ${result.compatibilityPercent}. ${result.text}`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(readText);
    utterance.lang = 'tr-TR';

    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang.includes('tr'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const shareFriendship = () => {
    if (!result) return;
    const shareText = `🔮 AI Mystic - Arkadaş Falı Uyumumuz: %${result.compatibilityPercent}!\n\n"${result.text}"\n\nSen de fincanını yükle ve arkadaşınla uyumunu gör!`;
    navigator.clipboard.writeText(shareText);
    alert('Arkadaş falı uyum yorumu kopyalandı!');
  };

  const resetPage = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setImg1(null);
    setImg2(null);
    setFile1(undefined);
    setFile2(undefined);
    setResult(null);
    setError(null);
    setAnimatedPercent(0);
  };

  // Guard: If not premium, display premium upgrade page
  if (!isPremium) {
    return (
      <div className="scroll-view text-center" style={{ animation: 'fade-in 0.4s ease-out' }}>
        <div className="flex-between mb-4">
          <button onClick={onBack} className="glass-button" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} /> Geri
          </button>
          <h2 style={{ fontSize: '1.2rem' }}>Arkadaş Falı 👥</h2>
          <div style={{ width: '40px' }}></div>
        </div>

        <div className="glass-card-gold mt-4 py-8">
          <Crown size={64} color="var(--accent-gold)" className="mb-4" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 10px var(--accent-gold-glow))' }} />
          <h3 className="mb-2" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem' }}>Premium Özellik</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }} className="mb-6">
            Arkadaş Falı (İki fincanın enerjisini karşılaştırma ve ortak uyum yorumu) özelliği yalnızca **Mystic Premium** üyelerine özeldir.
          </p>
          <button className="glass-button-gold w-full" onClick={() => setPage('settings')}>
            Sınırsız Fal ve Premium'a Geç
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll-view">
      {/* Header */}
      <div className="flex-between mb-4">
        <button onClick={() => { window.speechSynthesis.cancel(); onBack(); }} className="glass-button" style={{ padding: '8px 12px' }}>
          <ArrowLeft size={16} /> Geri
        </button>
        <h2 style={{ fontSize: '1.2rem' }}>Arkadaş Falı 👥</h2>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Inputs View */}
      {!isLoading && !result && (
        <div style={{ animation: 'fade-in 0.4s ease-out' }}>
          <div className="glass-card mb-4 text-center">
            <h3 className="mb-2">Enerjileri Birleştirin</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="mb-4">
              Kendi fincanının (veya fotoğrafının) ve arkadaşının fincanının fotoğrafını ayrı ayrı yükleyin.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }} className="mb-4">
              {/* Slot 1 */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Senin Fincanın</p>
                {img1 ? (
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={img1} 
                      alt="Cup 1" 
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--accent-purple)' }} 
                    />
                    <button 
                      onClick={() => setImg1(null)}
                      style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.7rem' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', aspectRatio: '1', border: '1px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer' }}>
                    <Camera size={20} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Fotoğraf 1</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload(1)} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {/* Slot 2 */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Arkadaşının Fincanı</p>
                {img2 ? (
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={img2} 
                      alt="Cup 2" 
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--accent-purple)' }} 
                    />
                    <button 
                      onClick={() => setImg2(null)}
                      style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '0.7rem' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', aspectRatio: '1', border: '1px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer' }}>
                    <Camera size={20} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>Fotoğraf 2</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload(2)} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            {!img1 && !img2 && (
              <button className="glass-button" onClick={selectPresets} style={{ margin: '0 auto', padding: '6px 12px', fontSize: '0.75rem' }}>
                Hazır Fincanları Seç
              </button>
            )}
          </div>

          <button 
            className="glass-button-gold w-full" 
            onClick={startReading} 
            disabled={!img1 || !img2}
          >
            <Sparkles size={18} /> Uyum Analizini Başlat
          </button>
        </div>
      )}

      {/* Loading Scanning View */}
      {isLoading && (
        <div className="text-center mt-4" style={{ animation: 'fade-in 0.3s ease-out' }}>
          {/* Double scanning circles */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            <div className="scanner-view" style={{ width: '100px', height: '100px' }}>
              <div className="scanner-laser" />
              {img1 && <img src={img1} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />}
            </div>
            <div className="scanner-view" style={{ width: '100px', height: '100px' }}>
              <div className="scanner-laser" />
              {img2 && <img src={img2} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />}
            </div>
          </div>
          <h3 className="mb-2" style={{ color: 'var(--accent-gold)' }}>Ortak Enerji Birleştiriliyor</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {loadingStep}
          </p>
        </div>
      )}

      {/* Result View */}
      {result && !isLoading && (
        <div style={{ animation: 'fade-in 0.5s ease-out' }}>
          {/* Animated circular gauge for percentage */}
          <div className="glass-card text-center mb-4 flex-between" style={{ flexDirection: 'column' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Arkadaşlık Uyum Oranı</p>
            
            <div 
              style={{ 
                position: 'relative', 
                width: '120px', 
                height: '120px',
                borderRadius: '50%',
                background: `conic-gradient(var(--accent-gold) ${animatedPercent * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px var(--accent-gold-glow)'
              }}
              className="mb-2"
            >
              {/* Inner overlay circle */}
              <div 
                style={{ 
                  position: 'absolute', 
                  width: '104px', 
                  height: '104px', 
                  borderRadius: '50%', 
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  %{animatedPercent}
                </span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Enerji Uyumu
                </span>
              </div>
            </div>
          </div>

          {/* Combined Reading Text */}
          <div className="glass-card mb-4">
            <div className="flex-between mb-4">
              <span className="premium-badge"><Crown size={10} /> Premium Uyum Falı</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={`glass-button ${isPlaying ? 'active' : ''}`} 
                  onClick={toggleSpeech}
                  style={{ padding: '8px 12px' }}
                  title="Sesli Oku"
                >
                  {isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button 
                  className="glass-button" 
                  onClick={shareFriendship}
                  style={{ padding: '8px 12px' }}
                  title="Paylaş"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            <div style={{ lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
              {result.text}
            </div>

            <p className="disclaimer-text mt-4">
              Bu içerik yalnızca eğlence amaçlıdır. Ciddi tıbbi, hukuki veya finansal kararlar için kesinlikle yönlendirme teşkil etmez.
            </p>
          </div>

          <button className="glass-button w-full" onClick={resetPage}>
            <RefreshCw size={16} /> Yeni Uyum Falı Baktır
          </button>
        </div>
      )}

      {error && (
        <div className="glass-card text-center" style={{ borderColor: 'red' }}>
          <p style={{ color: '#ff5252', fontSize: '0.9rem' }} className="mb-4">{error}</p>
          <button className="glass-button w-full" onClick={resetPage}>Tekrar Dene</button>
        </div>
      )}
    </div>
  );
}
