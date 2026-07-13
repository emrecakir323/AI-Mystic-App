import { useState } from 'react';
import { 
  Moon, 
  ArrowLeft, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Share2, 
  RefreshCw 
} from 'lucide-react';
import { getHoroscopeReading, HOROSCOPE_LIST, ReadingResult, saveReadingToHistory } from '../services/geminiService';

interface HoroscopeProps {
  onBack: () => void;
  isPremium: boolean;
  useCredit: () => boolean;
}

// Emoji symbols for zodiac signs
const ZODIAC_EMOJIS: Record<string, string> = {
  koc: '♈', boga: '♉', ikizler: '♊', yengec: '♋',
  aslan: '♌', basak: '♍', terazi: '♎', akrep: '♏',
  yay: '♐', oglak: '♑', kova: '♒', balik: '♓'
};

const ELEMENT_COLORS: Record<string, string> = {
  'Ateş': '#ff5252',
  'Toprak': '#8d6e63',
  'Hava': '#29b6f6',
  'Su': '#26a69a'
};

export default function Horoscope({ onBack, isPremium: _isPremium, useCredit }: HoroscopeProps) {
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);

  const selectSign = async (signId: string, type = timeframe) => {
    if (!useCredit()) return;

    setSelectedSign(signId);
    setTimeframe(type);
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const reading = await getHoroscopeReading(signId, type);
      setResult(reading);
      const signName = HOROSCOPE_LIST.find(h => h.id === signId)?.name || 'Burç';
      const timeframeName = type === 'daily' ? 'Günlük' : type === 'weekly' ? 'Haftalık' : 'Aylık';
      saveReadingToHistory('horoscope', 'Burç Analizi', `${signName} Burcu - ${timeframeName} Yorum`, reading);
    } catch (err: any) {
      setError(err.message || 'Burç yorumu yüklenirken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeframeChange = (newTimeframe: 'daily' | 'weekly' | 'monthly') => {
    if (!selectedSign) return;
    selectSign(selectedSign, newTimeframe);
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!result) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(result.text);
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

  const shareHoroscope = () => {
    if (!result || !selectedSign) return;
    const signInfo = HOROSCOPE_LIST.find(h => h.id === selectedSign)!;
    const shareText = `🔮 AI Mystic - ${signInfo.name} Burcu (${timeframe === 'daily' ? 'Günlük' : timeframe === 'weekly' ? 'Haftalık' : 'Aylık'}) Yorumum:\n\n${result.text}\n\nKendi burç analizini öğrenmek için hemen tıkla!`;
    navigator.clipboard.writeText(shareText);
    alert('Burç yorumu kopyalandı!');
  };

  const resetSelection = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSelectedSign(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="scroll-view">
      {/* Header */}
      <div className="flex-between mb-4">
        {selectedSign ? (
          <button onClick={resetSelection} className="glass-button" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} /> Tüm Burçlar
          </button>
        ) : (
          <button onClick={onBack} className="glass-button" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} /> Geri
          </button>
        )}
        <h2 style={{ fontSize: '1.2rem' }}>Burç Analizi ♈</h2>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Grid of signs */}
      {!selectedSign && !isLoading && (
        <div style={{ animation: 'fade-in 0.4s ease-out' }}>
          <div className="glass-card mb-4 text-center">
            <h3 className="mb-2">Burcunu Seç</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Günlük gezegen hareketlerinin ve gökyüzü enerjilerinin senin üzerindeki etkilerini analiz edelim.
            </p>
          </div>

          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '12px'
            }}
          >
            {HOROSCOPE_LIST.map((sign) => (
              <div 
                key={sign.id}
                onClick={() => selectSign(sign.id)}
                className="glass-card text-center flex-between"
                style={{ 
                  flexDirection: 'column',
                  padding: '16px 8px',
                  cursor: 'pointer',
                  border: '1px solid var(--glass-border)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <span style={{ fontSize: '2.5rem', marginBottom: '8px', filter: 'drop-shadow(0 0 5px rgba(255,183,3,0.3))' }}>
                  {ZODIAC_EMOJIS[sign.id]}
                </span>
                <h4 style={{ fontSize: '0.95rem' }}>{sign.name}</h4>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {sign.dates}
                </span>
                <span 
                  style={{ 
                    fontSize: '0.6rem', 
                    color: ELEMENT_COLORS[sign.element],
                    border: `1px solid ${ELEMENT_COLORS[sign.element]}`,
                    borderRadius: '50px',
                    padding: '1px 6px',
                    marginTop: '8px',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}
                >
                  {sign.element}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center mt-4" style={{ animation: 'fade-in 0.3s ease-out' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 20px auto' }} className="spin">
            <Moon size={80} color="var(--accent-gold)" style={{ opacity: 0.8 }} />
          </div>
          <h3 className="mb-2" style={{ color: 'var(--accent-gold)' }}>Gökyüzü Haritası İnceleniyor</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Yıldızların ve gezegenlerin anlık konumları burcunuza göre yorumlanıyor...
          </p>
        </div>
      )}

      {/* Result view */}
      {result && !isLoading && selectedSign && (
        <div style={{ animation: 'fade-in 0.5s ease-out' }}>
          {/* Sign profile top */}
          {(() => {
            const signInfo = HOROSCOPE_LIST.find(h => h.id === selectedSign)!;
            return (
              <div className="glass-card text-center mb-4" style={{ borderBottom: `3px solid ${ELEMENT_COLORS[signInfo.element]}` }}>
                <span style={{ fontSize: '3rem' }}>{ZODIAC_EMOJIS[selectedSign]}</span>
                <h3 className="mt-2" style={{ fontSize: '1.4rem' }}>{signInfo.name} Burcu</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {signInfo.dates} | Element: <strong style={{ color: ELEMENT_COLORS[signInfo.element] }}>{signInfo.element}</strong>
                </p>
              </div>
            );
          })()}

          {/* Timeframe selector tabs */}
          <div className="glass-card mb-4" style={{ padding: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTimeframeChange(t)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    border: 'none',
                    borderRadius: '8px',
                    background: timeframe === t ? 'var(--accent-purple)' : 'transparent',
                    color: timeframe === t ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.85rem'
                  }}
                >
                  {t === 'daily' ? 'Günlük' : t === 'weekly' ? 'Haftalık' : 'Aylık'}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis text card */}
          <div className="glass-card mb-4">
            <div className="flex-between mb-4">
              <span className="premium-badge"><Sparkles size={10} /> AI Astrolog</span>
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
                  onClick={shareHoroscope}
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

          <button className="glass-button w-full" onClick={resetSelection}>
            <RefreshCw size={16} /> Başka Bir Burç Seç
          </button>
        </div>
      )}

      {error && (
        <div className="glass-card text-center" style={{ borderColor: 'red' }}>
          <p style={{ color: '#ff5252', fontSize: '0.9rem' }} className="mb-4">{error}</p>
          <button className="glass-button w-full" onClick={resetSelection}>Geri Dön</button>
        </div>
      )}
    </div>
  );
}
