import { useState } from 'react';
import { 
  Compass, 
  ArrowLeft, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Share2, 
  RefreshCw 
} from 'lucide-react';
import { getTarotReading, TAROT_LIST, ReadingResult, saveReadingToHistory } from '../services/geminiService';

interface TarotReadingProps {
  onBack: () => void;
  isPremium: boolean;
  useCredit: () => boolean;
}

export default function TarotReading({ onBack, isPremium: _isPremium, useCredit }: TarotReadingProps) {
  const [deck, setDeck] = useState<string[]>(() => {
    // Generate a shuffled pool of 12 Major Arcana cards for user to choose from
    return [...TAROT_LIST].sort(() => 0.5 - Math.random()).slice(0, 12).map(c => c.id);
  });
  
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flippedIndex, setFlippedIndex] = useState<number>(-1);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);

  const shuffleDeck = () => {
    setIsShuffling(true);
    setSelectedCards([]);
    setTimeout(() => {
      setDeck([...TAROT_LIST].sort(() => 0.5 - Math.random()).slice(0, 12).map(c => c.id));
      setIsShuffling(false);
    }, 1000);
  };

  const handleCardClick = (cardId: string) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter(id => id !== cardId));
      return;
    }

    if (selectedCards.length < 3) {
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  const startReading = async () => {
    if (selectedCards.length !== 3) return;
    if (!useCredit()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const reading = await getTarotReading(selectedCards);
      setResult(reading);
      saveReadingToHistory('tarot', 'Tarot Falı', '3 Kart Tarot Açılımı', reading);
      
      // Animate flipping the cards one by one
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setFlippedIndex(i);
      }
    } catch (err: any) {
      setError(err.message || 'Tarot açılımı yapılırken hata oluştu.');
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

  const shareFortune = () => {
    if (!result) return;
    const shareText = `🔮 AI Mystic - Tarot Açılımım:\n\n${result.text}\n\nUygulamayı hemen indir ve tarotunu yorumlat!`;
    navigator.clipboard.writeText(shareText);
    alert('Tarot falınız kopyalandı!');
  };

  const resetPage = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setSelectedCards([]);
    setFlippedIndex(-1);
    setResult(null);
    setError(null);
    shuffleDeck();
  };

  return (
    <div className="scroll-view">
      {/* Header */}
      <div className="flex-between mb-4">
        <button onClick={() => { window.speechSynthesis.cancel(); onBack(); }} className="glass-button" style={{ padding: '8px 12px' }}>
          <ArrowLeft size={16} /> Geri
        </button>
        <h2 style={{ fontSize: '1.2rem' }}>Tarot Açılımı 🎴</h2>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Card Selection view */}
      {!isLoading && !result && (
        <div style={{ animation: 'fade-in 0.4s ease-out' }}>
          <div className="glass-card mb-4 text-center">
            <h3 className="mb-2">Geçmiş, Şimdi ve Gelecek</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="mb-4">
              Zihnini soruna odakla, kartları karıştır ve aşağıdaki desteden tam 3 kart seç.
            </p>

            <button 
              className="glass-button mb-4" 
              onClick={shuffleDeck} 
              disabled={isShuffling}
              style={{ margin: '0 auto' }}
            >
              <RefreshCw size={16} className={isShuffling ? 'spin' : ''} /> Kartları Karıştır
            </button>

            {/* Deck grid */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '8px',
                justifyItems: 'center'
              }}
              className="mb-4"
            >
              {deck.map((cardId, index) => {
                const cardIndex = selectedCards.indexOf(cardId);
                const isSelected = cardIndex !== -1;
                return (
                  <div 
                    key={cardId} 
                    onClick={() => handleCardClick(cardId)}
                    className={`tarot-card-container ${isShuffling ? 'shuffling' : ''}`}
                    style={{ 
                      width: '75px', 
                      height: '120px', 
                      opacity: isShuffling ? 0.3 : 1,
                      transform: isShuffling ? `translateY(${Math.sin(index)*10}px)` : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div className="tarot-card-inner" style={{ height: '100%' }}>
                      <div 
                        className="tarot-card-back" 
                        style={{ 
                          height: '100%', 
                          borderWidth: isSelected ? '2px' : '1px',
                          borderColor: isSelected ? 'var(--accent-gold)' : 'var(--glass-border)',
                          boxShadow: isSelected ? '0 0 10px var(--accent-gold-glow)' : 'none'
                        }}
                      >
                        <div 
                          className="tarot-card-back-pattern" 
                          style={{ 
                            fontSize: '1rem',
                            backgroundImage: isSelected ? 'radial-gradient(circle, rgba(255, 183, 3, 0.3) 0%, transparent 70%)' : 'none'
                          }}
                        >
                          {isSelected ? (
                            <span style={{ fontWeight: 800, color: 'var(--accent-gold)', fontSize: '1.2rem' }}>
                              {cardIndex + 1}
                            </span>
                          ) : (
                            <span>✨</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedCards.length > 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Seçilen Kart Sayısı: <strong style={{ color: 'var(--accent-gold)' }}>{selectedCards.length} / 3</strong>
              </p>
            )}
          </div>

          <button 
            className="glass-button-gold w-full" 
            onClick={startReading} 
            disabled={selectedCards.length !== 3}
          >
            <Compass size={18} /> Açılımı Yorumla (1 Hak)
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center mt-4" style={{ animation: 'fade-in 0.3s ease-out' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 20px auto' }} className="spin">
            <Compass size={80} color="var(--accent-gold)" style={{ opacity: 0.8 }} />
          </div>
          <h3 className="mb-2" style={{ color: 'var(--accent-gold)' }}>Kartlar Karşılaştırılıyor</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Kartların derin anlamları birleştiriliyor, kozmik bağlar kuruluyor...
          </p>
        </div>
      )}

      {/* Result view */}
      {result && !isLoading && (
        <div style={{ animation: 'fade-in 0.5s ease-out' }}>
          {/* Card Spreads */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            {selectedCards.map((cardId, index) => {
              const card = TAROT_LIST.find(c => c.id === cardId)!;
              const isFlipped = flippedIndex >= index;
              return (
                <div 
                  key={cardId} 
                  className={`tarot-card-container ${isFlipped ? 'flipped' : ''}`}
                  style={{ width: '95px', height: '155px' }}
                >
                  <div className="tarot-card-inner">
                    <div className="tarot-card-back">
                      <div className="tarot-card-back-pattern">
                        <span>✨</span>
                      </div>
                    </div>
                    <div className="tarot-card-front selected-glow">
                      <span style={{ fontSize: '2rem', marginBottom: '8px' }}>{card.image}</span>
                      <h4 style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', textAlign: 'center' }}>
                        {card.name.split(' ')[0]}
                      </h4>
                      <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {index === 0 ? 'Geçmiş' : index === 1 ? 'Şimdi' : 'Gelecek'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reading Box */}
          <div className="glass-card mb-4">
            <div className="flex-between mb-4">
              <span className="premium-badge"><Sparkles size={10} /> Tarot Analizi</span>
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

            <div style={{ lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
              {result.text}
            </div>

            <p className="disclaimer-text mt-4">
              Bu içerik yalnızca eğlence amaçlıdır. Ciddi tıbbi, hukuki veya finansal kararlar için kesinlikle yönlendirme teşkil etmez.
            </p>
          </div>

          <button className="glass-button w-full" onClick={resetPage}>
            <RefreshCw size={16} /> Yeni Açılım Yap
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
