import { useState } from 'react';
import { 
  Crown, 
  ArrowLeft, 
  ShieldCheck, 
  Check, 
  CreditCard, 
  Sparkles,
  Lock,
  Calendar,
  User
} from 'lucide-react';

interface PremiumCheckoutProps {
  onBack: () => void;
  onPurchaseSuccess: () => void;
}

export default function PremiumCheckout({ onBack, onPurchaseSuccess }: PremiumCheckoutProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  // Checkout Steps
  const [checkoutState, setCheckoutState] = useState<'form' | 'processing' | 'success'>('form');
  const [processingStep, setProcessingStep] = useState('');

  // Auto-format Card Number (xxxx xxxx xxxx xxxx)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // numbers only
    if (value.length > 16) value = value.substring(0, 16);
    
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Auto-format Expiry Date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // numbers only
    if (value.length > 4) value = value.substring(0, 4);
    
    if (value.length > 2) {
      setCardExpiry(`${value.substring(0, 2)}/${value.substring(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Auto-format CVC (max 3 digits)
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // numbers only
    if (value.length > 3) value = value.substring(0, 3);
    setCardCvc(value);
  };

  const startCheckout = () => {
    if (cardNumber.replace(/\s/g, '').length < 16) {
      alert('Lütfen geçerli bir 16 haneli kart numarası girin.');
      return;
    }
    if (cardExpiry.length < 5) {
      alert('Lütfen son kullanma tarihini girin (AA/YY).');
      return;
    }
    if (cardCvc.length < 3) {
      alert('Lütfen 3 haneli güvenlik kodunu (CVC) girin.');
      return;
    }
    if (!cardName.trim()) {
      alert('Lütfen kart sahibinin adını girin.');
      return;
    }

    // Start simulated banking pipeline
    setCheckoutState('processing');
    const steps = [
      'Güvenli 3D Secure bağlantısı kuruluyor...',
      'Mistik banka provizyonu alınıyor...',
      'Abonelik kaydı oluşturuluyor...',
      'İşlem başarıyla onaylandı! 🎉'
    ];

    let current = 0;
    setProcessingStep(steps[0]);
    
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setProcessingStep(steps[current]);
      } else {
        clearInterval(interval);
        setCheckoutState('success');
      }
    }, 1200);
  };

  const handleFinish = () => {
    // Save to local storage and notify context
    localStorage.setItem('ai_mystic_premium', 'true');
    onPurchaseSuccess();
  };

  return (
    <div className="scroll-view" style={{ animation: 'fade-in 0.4s ease-out' }}>
      {/* Back Button */}
      {checkoutState === 'form' && (
        <button 
          onClick={onBack}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', 
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', marginBottom: '16px', fontSize: '0.85rem'
          }}
        >
          <ArrowLeft size={16} /> Geri Dön
        </button>
      )}

      {checkoutState === 'form' && (
        <div>
          {/* Header */}
          <div className="text-center mb-6">
            <div 
              style={{ 
                width: '60px', height: '60px', borderRadius: '50%', 
                background: 'rgba(255, 183, 3, 0.15)', display: 'flex',
                alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
                marginBottom: '12px', border: '2px solid var(--accent-gold)'
              }}
            >
              <Crown size={30} color="var(--accent-gold)" className="pulse" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-mystic)', fontSize: '1.4rem' }} className="title-gold mb-1">
              Mystic Premium'a Yüksel
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Sınırsız mistik keşifler ve özel içeriklerin kilidini açın.
            </p>
          </div>

          {/* Pricing Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="mb-6">
            {/* Yearly Plan */}
            <div 
              onClick={() => setSelectedPlan('yearly')}
              className={`glass-card ${selectedPlan === 'yearly' ? 'active-gold' : ''}`}
              style={{ 
                cursor: 'pointer', padding: '16px', position: 'relative',
                border: selectedPlan === 'yearly' ? '1.5px solid var(--accent-gold)' : '1px solid var(--glass-border)'
              }}
            >
              <div 
                style={{ 
                  position: 'absolute', top: -10, right: 15, 
                  background: 'linear-gradient(135deg, #eab308, #ff8c00)', 
                  color: 'white', fontSize: '0.65rem', fontWeight: 'bold', 
                  padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                %50 AVANTAJLI
              </div>
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', 
                    border: '2px solid var(--accent-gold)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    {selectedPlan === 'yearly' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-gold)' }} />}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Yıllık Üyelik</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Her ay otomatik yenilenir, iptal edilebilir.</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>24.99 TL</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ay</span>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>(Yıllık tek çekim 299.99 TL)</p>
                </div>
              </div>
            </div>

            {/* Monthly Plan */}
            <div 
              onClick={() => setSelectedPlan('monthly')}
              className={`glass-card ${selectedPlan === 'monthly' ? 'active-gold' : ''}`}
              style={{ 
                cursor: 'pointer', padding: '16px',
                border: selectedPlan === 'monthly' ? '1.5px solid var(--accent-gold)' : '1px solid var(--glass-border)'
              }}
            >
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', 
                    border: '2px solid var(--accent-gold)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    {selectedPlan === 'monthly' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-gold)' }} />}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Aylık Üyelik</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dilediğiniz an iptal edilebilir paket.</p>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>49.99 TL</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Glassmorphic Credit Card Preview */}
          <div 
            className="mb-6"
            style={{
              width: '100%', aspectRatio: '1.586', borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(138,43,226,0.3) 0%, rgba(255,183,3,0.1) 100%)',
              backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)',
              padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'between',
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden'
            }}
          >
            {/* Shiny card chip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div 
                style={{ 
                  width: '38px', height: '28px', borderRadius: '4px', 
                  background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
                  opacity: 0.8
                }} 
              />
              <Crown size={22} color="var(--accent-gold)" />
            </div>

            {/* Card Number display */}
            <div 
              style={{ 
                fontSize: '1.2rem', letterSpacing: '2px', fontFamily: 'monospace', 
                color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)', margin: '20px 0 10px 0' 
              }}
            >
              {cardNumber || '•••• •••• •••• ••••'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
              <div>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', display: 'block' }}>KART SAHİBİ</span>
                <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{cardName.toUpperCase() || 'AD SOYAD'}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', display: 'block' }}>GEÇERLİLİK</span>
                <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{cardExpiry || 'AA/YY'}</span>
              </div>
            </div>
          </div>

          {/* Secure Payment Warning */}
          <div 
            className="flex-row mb-4" 
            style={{ 
              gap: '8px', padding: '10px', borderRadius: '8px', 
              background: 'rgba(255, 82, 82, 0.1)', border: '1px solid rgba(255, 82, 82, 0.2)' 
            }}
          >
            <ShieldCheck size={18} color="#ff5252" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
              <strong>🔒 Test Ortamı Koruması:</strong> Bu uygulama tamamen bir prototiptir. Lütfen buraya **gerçek kredi kartı bilgilerinizi girmeyiniz**. Simülasyonu denemek için sahte numaralar girebilirsiniz.
            </p>
          </div>

          {/* Payment Form Fields */}
          <div className="glass-card mb-4" style={{ padding: '16px' }}>
            <h3 className="mb-3" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={14} color="var(--accent-gold)" /> Ödeme Detayları
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Kart Sahibi Adı</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="KARTTAKİ İSİM"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    style={{ fontSize: '0.8rem', paddingLeft: '32px' }}
                  />
                  <User size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Kart Numarası</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    style={{ fontSize: '0.8rem', paddingLeft: '32px' }}
                  />
                  <CreditCard size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Son Kullanma</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="AA/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      style={{ fontSize: '0.8rem', paddingLeft: '32px' }}
                    />
                    <Calendar size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Güvenlik Kodu (CVC)</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="password" 
                      className="glass-input" 
                      placeholder="000"
                      value={cardCvc}
                      onChange={handleCvcChange}
                      style={{ fontSize: '0.8rem', paddingLeft: '32px' }}
                    />
                    <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Payment Trigger */}
          <button 
            className="glass-button-gold w-full mb-4" 
            onClick={startCheckout}
            style={{ padding: '12px', fontSize: '0.9rem' }}
          >
            <Lock size={14} /> Güvenli Ödeme Yap ({selectedPlan === 'yearly' ? '299.99 TL' : '49.99 TL'})
          </button>
        </div>
      )}

      {/* STEP 2: PROCESSING SCREEN */}
      {checkoutState === 'processing' && (
        <div 
          className="text-center" 
          style={{ 
            minHeight: '300px', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', animation: 'fade-in 0.3s ease-out' 
          }}
        >
          <div className="spinner mb-4" style={{ width: '40px', height: '40px' }} />
          <h3 className="mb-2" style={{ color: 'var(--accent-gold)' }}>Mistik İşlem Sürüyor</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {processingStep}
          </p>
        </div>
      )}

      {/* STEP 3: SUCCESS ANIMATED CARD */}
      {checkoutState === 'success' && (
        <div 
          className="glass-card text-center" 
          style={{ 
            padding: '30px 20px', border: '2px solid var(--accent-gold)', 
            animation: 'fade-in 0.5s ease-out', position: 'relative' 
          }}
        >
          {/* Confetti simulation overlay */}
          <div 
            style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              pointerEvents: 'none', overflow: 'hidden'
            }}
          >
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                style={{
                  position: 'absolute',
                  width: `${Math.random() * 8 + 4}px`,
                  height: `${Math.random() * 12 + 6}px`,
                  background: ['#ffb703', '#8a2be2', '#10b981', '#f43f5e'][Math.floor(Math.random()*4)],
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  opacity: Math.random(),
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: `fall ${Math.random() * 2 + 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <div 
            style={{ 
              width: '64px', height: '64px', borderRadius: '50%', 
              background: 'rgba(16, 185, 129, 0.15)', display: 'flex',
              alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
              marginBottom: '16px', border: '2px solid #10b981'
            }}
          >
            <Check size={36} color="#10b981" />
          </div>

          <h2 style={{ fontFamily: 'var(--font-mystic)', color: '#ffb703', fontSize: '1.4rem' }} className="mb-2">
            Artık Mystic Premium Üyesiniz! 👑
          </h2>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }} className="mb-6">
            Bütün kapılar önünüze açıldı. Sınırsız fal bakma, detaylı arkadaş uyumu analizi ve reklam barındırmayan eşsiz mistik seansların keyfini çıkarın.
          </p>

          <div 
            className="mb-6" 
            style={{ 
              padding: '12px', borderRadius: '8px', 
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
              display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', textAlign: 'left'
            }}
          >
            <div><strong>Ödeme Şekli:</strong> Simüle Edilmiş Kart</div>
            <div><strong>Paket Türü:</strong> {selectedPlan === 'yearly' ? 'Yıllık Mystic Plan' : 'Aylık Mystic Plan'}</div>
            <div><strong>Üyelik Durumu:</strong> <span style={{ color: '#10b981' }}>Aktif</span></div>
          </div>

          <button 
            className="glass-button-gold w-full" 
            onClick={handleFinish}
            style={{ padding: '12px', fontSize: '0.9rem' }}
          >
            <Sparkles size={16} /> Mistik Seansa Başla
          </button>
        </div>
      )}
    </div>
  );
}
