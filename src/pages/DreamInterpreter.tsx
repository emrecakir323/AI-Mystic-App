import { useState } from 'react';
import { 
  Moon, 
  ArrowLeft, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Share2, 
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { getDreamInterpretation, ReadingResult, saveReadingToHistory } from '../services/geminiService';

interface DreamInterpreterProps {
  onBack: () => void;
  isPremium: boolean;
  useCredit: () => boolean;
}

export default function DreamInterpreter({ onBack, isPremium: _isPremium, useCredit }: DreamInterpreterProps) {
  const [dreamText, setDreamText] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);

  const startInterpretation = async () => {
    if (dreamText.trim().length < 10) {
      alert('Lütfen rüyanızı daha detaylı yazın (en az 10 karakter).');
      return;
    }

    if (!useCredit()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const interpretation = await getDreamInterpretation(dreamText);
      setResult(interpretation);
      saveReadingToHistory('dream', 'Rüya Yorumu', dreamText.length > 30 ? dreamText.substring(0, 27) + '...' : dreamText, interpretation);
    } catch (err: any) {
      setError(err.message || 'Rüya yorumu sırasında hata oluştu.');
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

  const shareInterpretation = () => {
    if (!result) return;
    const shareText = `🔮 AI Mystic - Rüya Analizim:\n\n${result.text}\n\nUygulamayı hemen indir ve rüyanı yorumlat!`;
    navigator.clipboard.writeText(shareText);
    alert('Rüya yorumunuz kopyalandı!');
  };

  const resetPage = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setDreamText('');
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
        <h2 style={{ fontSize: '1.2rem' }}>Rüya Yorumu 🌙</h2>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Input Form */}
      {!isLoading && !result && (
        <div style={{ animation: 'fade-in 0.4s ease-out' }}>
          <div className="glass-card mb-4">
            <div className="flex-row mb-3" style={{ gap: '8px' }}>
              <BookOpen size={18} color="var(--accent-gold)" />
              <h3 style={{ fontSize: '1rem' }}>Rüya Günlüğü</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="mb-3">
              Gördüğünüz rüyayı, hatırladığınız tüm detaylar, renkler ve nesnelerle birlikte yazın.
            </p>

            <textarea 
              className="glass-input" 
              placeholder="Örn: Denizde yürüyordum ve çok büyük, parlayan altın renkli bir balık gördüm. Balık bana gülümsüyordu, gökyüzünde ise iki tane dolunay vardı..."
              rows={6}
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              style={{ resize: 'vertical', minHeight: '120px', lineHeight: '1.5' }}
            />

            <div className="flex-between mt-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>En az 10 karakter girin</span>
              <span>{dreamText.length} karakter</span>
            </div>
          </div>

          <button 
            className="glass-button-gold w-full" 
            onClick={startInterpretation} 
            disabled={dreamText.trim().length < 10}
          >
            <Sparkles size={18} /> Rüyayı Yorumla (1 Hak)
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center mt-4" style={{ animation: 'fade-in 0.3s ease-out' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 20px auto' }} className="spin">
            <Moon size={80} color="var(--accent-gold)" style={{ opacity: 0.8 }} />
          </div>
          <h3 className="mb-2" style={{ color: 'var(--accent-gold)' }}>Bilinçaltı Analiz Ediliyor</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Rüyanızdaki semboller ve gizli arketipler AI tarafından çözümleniyor...
          </p>
        </div>
      )}

      {/* Result view */}
      {result && !isLoading && (
        <div style={{ animation: 'fade-in 0.5s ease-out' }}>
          <div className="glass-card mb-4">
            <div className="flex-between mb-4">
              <span className="premium-badge"><Sparkles size={10} /> Rüya Çözümlemesi</span>
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
                  onClick={shareInterpretation}
                  style={{ padding: '8px 12px' }}
                  title="Paylaş"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {result.extraInfo && (
              <div style={{ 
                background: 'rgba(255, 183, 3, 0.05)', 
                border: '1px solid var(--glass-border-gold)',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '16px',
                fontSize: '0.8rem',
                color: 'var(--accent-gold)'
              }}>
                {result.extraInfo}
              </div>
            )}

            <div style={{ lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
              {result.text}
            </div>

            <p className="disclaimer-text mt-4">
              Bu içerik yalnızca eğlence amaçlıdır. Ciddi tıbbi, hukuki veya finansal kararlar için kesinlikle yönlendirme teşkil etmez.
            </p>
          </div>

          <button className="glass-button w-full" onClick={resetPage}>
            <RefreshCw size={16} /> Başka Bir Rüya Yorumlat
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
