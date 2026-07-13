import { useState } from 'react';
import { 
  Camera, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Share2, 
  ArrowLeft, 
  BookOpen, 
  List,
  RefreshCw,
  Heart,
  Briefcase,
  DollarSign,
  HeartPulse,
  Users
} from 'lucide-react';
import { getCoffeeFortune, ReadingResult, saveReadingToHistory } from '../services/geminiService';

interface CoffeeReadingProps {
  onBack: () => void;
  isPremium: boolean;
  useCredit: () => boolean;
}

// Preset base64 style simulated coffee cups so users can test immediately without taking a real photo
const PRESET_CUPS = [
  { id: 'cup1', name: 'Geleneksel Fincan', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop', desc: 'Yoğun telveli, dipte birikmiş kısmet çizgileri olan klasik bir fincan.' },
  { id: 'cup2', name: 'Ferah Fincan', url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=400&auto=format&fit=crop', desc: 'Açık renkli, yolları ve seyahatleri belirgin temiz bir fincan.' }
];

export default function CoffeeReading({ onBack, isPremium: _isPremium, useCredit }: CoffeeReadingProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [storyMode, setStoryMode] = useState(true);
  
  // Loading & State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'sections'>('story');

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
    setImageFile(undefined); // Using URL preset
  };

  const runScanningSimulation = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const steps = [
      'Telve yoğunluğu analiz ediliyor...',
      'Dip desenleri haritalandırılıyor...',
      'Semboller ve yollar çıkartılıyor (Kuş, Yol, Balık)...',
      'Yıldız haritası uyumu hesaplanıyor...',
      'AI Kahin hikayesini derliyor...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const startReading = async () => {
    if (!useCredit()) {
      return;
    }

    try {
      await runScanningSimulation();
      
      // Perform the actual API or mock call
      const fortune = await getCoffeeFortune(storyMode, imageFile);
      setResult(fortune);
      saveReadingToHistory('coffee', 'Kahve Falı', storyMode ? 'Hikaye Modu Kahve Falı' : 'Klasik Kahve Falı', fortune);
    } catch (err: any) {
      setError(err.message || 'Fal analizi yapılırken hata oluştu.');
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

    // Build read text
    let readText = result.text;
    if (activeTab === 'sections') {
      readText = `Genel durum: ${result.text}. 
      Aşk hayatınız: ${result.love || ''}. 
      İş ve kariyer: ${result.career || ''}. 
      Maddi durum: ${result.money || ''}.
      Sağlık: ${result.health || ''}.`;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(readText);
    utterance.lang = 'tr-TR';
    
    // Attempt Turkish voice
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang.includes('tr'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const shareFortune = () => {
    if (!result) return;
    const shareText = `🔮 AI Mystic - Kahve Falım:\n\n${result.text}\n\nUygulamayı hemen indir ve falını baktır!`;
    navigator.clipboard.writeText(shareText);
    alert('Fal yorumu kopyalandı! Arkadaşlarınızla paylaşabilirsiniz.');
  };

  const resetPage = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSelectedImage(null);
    setImageFile(undefined);
    setResult(null);
    setError(null);
  };

  return (
    <div className="scroll-view">
      {/* Header */}
      <div className="flex-between mb-4">
        <button onClick={() => { window.speechSynthesis.cancel(); onBack(); }} className="glass-button" style={{ padding: '8px 12px' }}>
          <ArrowLeft size={16} /> Geri
        </button>
        <h2 style={{ fontSize: '1.2rem' }}>Kahve Falı ☕</h2>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Main Form State */}
      {!isLoading && !result && (
        <div style={{ animation: 'fade-in 0.4s ease-out' }}>
          <div className="glass-card mb-4 text-center">
            <h3 className="mb-2">Fincan Fotoğrafı Yükle</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="mb-4">
              Fincanının içini gösteren net bir fotoğraf yükle ya da kamerandan çek.
            </p>

            {selectedImage ? (
              <div className="mb-4" style={{ position: 'relative', width: '100%', maxWidth: '250px', margin: '0 auto' }}>
                <img 
                  src={selectedImage} 
                  alt="Uploaded Coffee Cup" 
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="mt-2">JPG, PNG formatları</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            )}

            {/* Presets if user has no image */}
            {!selectedImage && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Fotoğrafın yok mu? Hazır fincanlardan birini seç:</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  {PRESET_CUPS.map((cup) => (
                    <div 
                      key={cup.id}
                      onClick={() => selectPreset(cup.url)}
                      style={{ cursor: 'pointer', width: '80px', textAlign: 'center' }}
                    >
                      <img 
                        src={cup.url} 
                        alt={cup.name} 
                        style={{ width: '100%', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)' }} 
                      />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{cup.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="glass-card mb-4">
            <h3 className="mb-2" style={{ fontSize: '1rem' }}>Yorumlama Seçenekleri</h3>
            <div className="flex-between">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hikâye Modu (Akıcı ve Masalsı)</span>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                <input 
                  type="checkbox" 
                  checked={storyMode} 
                  onChange={(e) => setStoryMode(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span 
                  style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: storyMode ? 'var(--accent-purple)' : '#ccc',
                    transition: '.4s', borderRadius: '20px'
                  }}
                >
                  <span 
                    style={{
                      position: 'absolute', content: '""', height: '14px', width: '14px', left: storyMode ? '22px' : '4px', bottom: '3px',
                      backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                    }}
                  />
                </span>
              </label>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} className="mt-2">
              Hikâye modu, paylaşım yapmaya uygun akıcı ve edebi bir dille yazılır. Klasik mod ise başlıklar halinde detaylandırır.
            </p>
          </div>

          {/* Action Button */}
          <button 
            className="glass-button-gold w-full" 
            onClick={startReading} 
            disabled={!selectedImage}
          >
            <Sparkles size={18} /> Fala Bak (1 Hak)
          </button>
        </div>
      )}

      {/* Loading Scanning Screen */}
      {isLoading && (
        <div className="text-center mt-4" style={{ animation: 'fade-in 0.3s ease-out' }}>
          <div className="scanner-view mb-4" style={{ maxWidth: '280px', margin: '0 auto' }}>
            <div className="scanner-laser" />
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Scanning Cup" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
              />
            )}
          </div>
          <h3 className="mb-2" style={{ color: 'var(--accent-gold)' }}>Fincanınız Analiz Ediliyor</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {loadingStep}
          </p>
        </div>
      )}

      {/* Result View */}
      {result && !isLoading && (
        <div style={{ animation: 'fade-in 0.5s ease-out' }}>
          <div className="glass-card mb-4">
            <div className="flex-between mb-4">
              <span className="premium-badge"><Sparkles size={10} /> AI Falı Hazır</span>
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
                  title="Kopyala & Paylaş"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Tab layout for Story vs Structured */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', marginBottom: '16px' }}>
              <button 
                onClick={() => setActiveTab('story')}
                style={{ 
                  flex: 1, padding: '10px', background: 'none', border: 'none', 
                  borderBottom: activeTab === 'story' ? '2px solid var(--accent-gold)' : 'none',
                  color: activeTab === 'story' ? 'var(--accent-gold)' : 'var(--text-muted)',
                  fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer'
                }}
              >
                <BookOpen size={14} style={{ marginRight: '6px', display: 'inline' }} />
                Hikâye Yorumu
              </button>
              <button 
                onClick={() => setActiveTab('sections')}
                style={{ 
                  flex: 1, padding: '10px', background: 'none', border: 'none', 
                  borderBottom: activeTab === 'sections' ? '2px solid var(--accent-gold)' : 'none',
                  color: activeTab === 'sections' ? 'var(--accent-gold)' : 'var(--text-muted)',
                  fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer'
                }}
              >
                <List size={14} style={{ marginRight: '6px', display: 'inline' }} />
                Detaylı Başlıklar
              </button>
            </div>

            {activeTab === 'story' ? (
              <div style={{ lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                {result.text}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ borderLeft: '3px solid #f43f5e', paddingLeft: '12px' }}>
                  <h4 style={{ color: '#f43f5e', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Heart size={14} /> Aşk Hayatı</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{result.love}</p>
                </div>
                <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '12px' }}>
                  <h4 style={{ color: '#3b82f6', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> Kariyer & İş</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{result.career}</p>
                </div>
                <div style={{ borderLeft: '3px solid #eab308', paddingLeft: '12px' }}>
                  <h4 style={{ color: '#eab308', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} /> Para & Bereket</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{result.money}</p>
                </div>
                <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '12px' }}>
                  <h4 style={{ color: '#10b981', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}><HeartPulse size={14} /> Sağlık & Enerji</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{result.health}</p>
                </div>
                <div style={{ borderLeft: '3px solid #a855f7', paddingLeft: '12px' }}>
                  <h4 style={{ color: '#a855f7', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> Sosyal Hayat</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{result.social}</p>
                </div>
              </div>
            )}

            <p className="disclaimer-text mt-4">
              Bu içerik yalnızca eğlence amaçlıdır. Ciddi tıbbi, hukuki veya finansal kararlar için kesinlikle yönlendirme teşkil etmez.
            </p>
          </div>

          <button className="glass-button w-full" onClick={resetPage}>
            <RefreshCw size={16} /> Yeni Fal Baktır
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
