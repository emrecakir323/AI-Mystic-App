import { useState } from 'react';
import { 
  Camera, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Share2, 
  ArrowLeft, 
  RefreshCw,
  Activity,
  Heart,
  Brain
} from 'lucide-react';
import { getPalmReading, ReadingResult, saveReadingToHistory } from '../services/geminiService';

interface PalmReadingProps {
  onBack: () => void;
  isPremium: boolean;
  useCredit: () => boolean;
}

const PRESET_PALMS = [
  { id: 'palm1', name: 'Sol El Avucu', url: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=400&auto=format&fit=crop', desc: 'Belirgin ve derin yaşam çizgilerine sahip geleneksel sol el avucu.' },
  { id: 'palm2', name: 'Sağ El Avucu', url: 'https://images.unsplash.com/photo-1535262412227-85541e910204?q=80&w=400&auto=format&fit=crop', desc: 'İletişim ve zihin hatları geniş ve net sağ el avucu.' }
];

export default function PalmReading({ onBack, isPremium: _isPremium, useCredit }: PalmReadingProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeLine, setActiveLine] = useState<'all' | 'life' | 'heart' | 'head'>('all');

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPreset = (url: string) => {
    setSelectedImage(url);
    setImageFile(undefined);
  };

  const startReading = async () => {
    if (!useCredit()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const steps = [
      'Avuç içi görsel kalitesi inceleniyor...',
      'Yaşam Çizgisi (Life Line) saptanıyor...',
      'Kalp Çizgisi (Heart Line) taranıyor...',
      'Baş Çizgisi (Head Line) koordinatları alınıyor...',
      'AI Kahin elinizin kader hatlarını çıkarıyor...'
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        setLoadingStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const reading = await getPalmReading(imageFile);
      setResult(reading);
      saveReadingToHistory('palm', 'El Falı', 'Çizgi Analizli El Falı', reading);
    } catch (err: any) {
      setError(err.message || 'El falı analizi sırasında hata oluştu.');
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

    let readText = result.text;
    if (result.lines) {
      readText += ` Yaşam çizginiz: ${result.lines.life}. Kalp çizginiz: ${result.lines.heart}. Baş çizginiz: ${result.lines.head}.`;
    }

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

  const shareFortune = () => {
    if (!result) return;
    const shareText = `🔮 AI Mystic - El Falı Yorumum:\n\n${result.text}\n\nUygulamayı indir ve el çizgilerini tarat!`;
    navigator.clipboard.writeText(shareText);
    alert('El falı yorumu panoya kopyalandı!');
  };

  const resetPage = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSelectedImage(null);
    setImageFile(undefined);
    setResult(null);
    setError(null);
    setActiveLine('all');
  };

  return (
    <div className="scroll-view">
      {/* Header */}
      <div className="flex-between mb-4">
        <button onClick={() => { window.speechSynthesis.cancel(); onBack(); }} className="glass-button" style={{ padding: '8px 12px' }}>
          <ArrowLeft size={16} /> Geri
        </button>
        <h2 style={{ fontSize: '1.2rem' }}>El Falı ✋</h2>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Main Upload Screen */}
      {!isLoading && !result && (
        <div style={{ animation: 'fade-in 0.4s ease-out' }}>
          <div className="glass-card mb-4 text-center">
            <h3 className="mb-2">Avuç İçi Fotoğrafı</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="mb-4">
              Avuç içinizin çizgileri net görünecek şekilde aydınlık bir ortamda çekilmiş fotoğrafını yükleyin.
            </p>

            {selectedImage ? (
              <div className="mb-4" style={{ position: 'relative', width: '100%', maxWidth: '250px', margin: '0 auto' }}>
                <img 
                  src={selectedImage} 
                  alt="Uploaded Palm" 
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '16px', border: '2px solid var(--accent-purple)' }} 
                />
                <button 
                  className="glass-button" 
                  onClick={() => setSelectedImage(null)}
                  style={{ position: 'absolute', top: 5, right: 5, padding: '4px 8px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)' }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <label 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  aspectRatio: '1.5',
                  border: '2px dashed var(--glass-border)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  padding: '20px',
                  transition: 'var(--transition-smooth)'
                }}
                className="mb-4 hover:border-[var(--accent-purple)]"
              >
                <Camera size={36} color="var(--text-secondary)" className="mb-2" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Fotoğraf Seç veya Çek</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="mt-2">Avuç içiniz yukarı bakmalı</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            )}

            {/* Presets if user has no image */}
            {!selectedImage && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Test etmek için hazır avuç içi seçin:</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  {PRESET_PALMS.map((palm) => (
                    <div 
                      key={palm.id}
                      onClick={() => selectPreset(palm.url)}
                      style={{ cursor: 'pointer', width: '80px', textAlign: 'center' }}
                    >
                      <img 
                        src={palm.url} 
                        alt={palm.name} 
                        style={{ width: '100%', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)' }} 
                      />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{palm.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            className="glass-button-gold w-full" 
            onClick={startReading} 
            disabled={!selectedImage}
          >
            <Sparkles size={18} /> Çizgileri Analiz Et (1 Hak)
          </button>
        </div>
      )}

      {/* Loading Scanning View */}
      {isLoading && (
        <div className="text-center mt-4" style={{ animation: 'fade-in 0.3s ease-out' }}>
          <div className="scanner-view mb-4" style={{ maxWidth: '280px', margin: '0 auto' }}>
            <div className="scanner-laser-purple" />
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Scanning Palm" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
              />
            )}
          </div>
          <h3 className="mb-2" style={{ color: 'var(--accent-gold)' }}>Çizgiler Haritalandırılıyor</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {loadingStep}
          </p>
        </div>
      )}

      {/* Result View */}
      {result && !isLoading && (
        <div style={{ animation: 'fade-in 0.5s ease-out' }}>
          {/* Visual Overlay of lines */}
          <div className="scanner-view mb-4" style={{ maxWidth: '280px', margin: '0 auto', border: '2px solid var(--accent-gold)' }}>
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Palm Map" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
              />
            )}
            
            {/* SVG overlay containing the lines */}
            <svg className="palm-overlay-svg" viewBox="0 0 100 100">
              {/* Life Line (Red) */}
              {(activeLine === 'all' || activeLine === 'life') && (
                <path 
                  className="palm-line palm-line-life" 
                  d="M 50 15 C 45 40, 35 60, 48 85" 
                />
              )}
              {/* Heart Line (Purple/Pink) */}
              {(activeLine === 'all' || activeLine === 'heart') && (
                <path 
                  className="palm-line palm-line-heart" 
                  d="M 15 35 C 40 33, 70 30, 85 20" 
                />
              )}
              {/* Head Line (Cyan) */}
              {(activeLine === 'all' || activeLine === 'head') && (
                <path 
                  className="palm-line palm-line-head" 
                  d="M 15 45 C 45 46, 75 52, 85 58" 
                />
              )}
            </svg>

            {/* Quick selectors for lines on the visual */}
            <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: '6px', zIndex: 10 }}>
              <button 
                onClick={() => setActiveLine('all')} 
                style={{ 
                  background: activeLine === 'all' ? 'var(--accent-gold)' : 'rgba(0,0,0,0.6)',
                  color: activeLine === 'all' ? '#000' : '#fff',
                  border: 'none', borderRadius: '4px', fontSize: '0.65rem', padding: '3px 6px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Hepsi
              </button>
              <button 
                onClick={() => setActiveLine('life')} 
                style={{ 
                  background: activeLine === 'life' ? '#ff5252' : 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none', borderRadius: '4px', fontSize: '0.65rem', padding: '3px 6px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Yaşam
              </button>
              <button 
                onClick={() => setActiveLine('heart')} 
                style={{ 
                  background: activeLine === 'heart' ? '#e040fb' : 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none', borderRadius: '4px', fontSize: '0.65rem', padding: '3px 6px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Kalp
              </button>
              <button 
                onClick={() => setActiveLine('head')} 
                style={{ 
                  background: activeLine === 'head' ? '#18ffff' : 'rgba(0,0,0,0.6)',
                  color: '#000',
                  border: 'none', borderRadius: '4px', fontSize: '0.65rem', padding: '3px 6px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Baş
              </button>
            </div>
          </div>

          {/* Reading Display */}
          <div className="glass-card mb-4">
            <div className="flex-between mb-4">
              <span className="premium-badge"><Sparkles size={10} /> El Falı Analizi</span>
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
                  onClick={shareFortune}
                  style={{ padding: '8px 12px' }}
                  title="Paylaş"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            <p style={{ lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '20px' }}>
              {result.text}
            </p>

            {/* Line interpretations detailed */}
            {result.lines && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div 
                  onClick={() => setActiveLine('life')}
                  style={{ 
                    borderLeft: '4px solid #ff5252', paddingLeft: '12px', cursor: 'pointer',
                    background: activeLine === 'life' ? 'rgba(255, 82, 82, 0.05)' : 'transparent',
                    padding: '8px 8px 8px 12px', borderRadius: '4px', transition: 'var(--transition-smooth)'
                  }}
                >
                  <h4 style={{ color: '#ff5252', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={14} /> Yaşam Çizgisi (Life Line)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                    {result.lines.life}
                  </p>
                </div>

                <div 
                  onClick={() => setActiveLine('heart')}
                  style={{ 
                    borderLeft: '4px solid #e040fb', paddingLeft: '12px', cursor: 'pointer',
                    background: activeLine === 'heart' ? 'rgba(224, 64, 251, 0.05)' : 'transparent',
                    padding: '8px 8px 8px 12px', borderRadius: '4px', transition: 'var(--transition-smooth)'
                  }}
                >
                  <h4 style={{ color: '#e040fb', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Heart size={14} /> Kalp Çizgisi (Heart Line)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                    {result.lines.heart}
                  </p>
                </div>

                <div 
                  onClick={() => setActiveLine('head')}
                  style={{ 
                    borderLeft: '4px solid #18ffff', paddingLeft: '12px', cursor: 'pointer',
                    background: activeLine === 'head' ? 'rgba(24, 255, 255, 0.05)' : 'transparent',
                    padding: '8px 8px 8px 12px', borderRadius: '4px', transition: 'var(--transition-smooth)'
                  }}
                >
                  <h4 style={{ color: '#18ffff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Brain size={14} /> Baş Çizgisi (Head Line)
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                    {result.lines.head}
                  </p>
                </div>
              </div>
            )}

            <p className="disclaimer-text mt-4">
              Bu içerik yalnızca eğlence amaçlıdır. Ciddi tıbbi, hukuki veya finansal kararlar için kesinlikle yönlendirme teşkil etmez.
            </p>
          </div>

          <button className="glass-button w-full" onClick={resetPage}>
            <RefreshCw size={16} /> Yeni El Falı Baktır
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
