import { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  HelpCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { getOracleChatResponse } from '../services/geminiService';

interface OracleChatProps {
  onBack: () => void;
  isPremium: boolean;
  useCredit: () => boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
}

export default function OracleChat({ onBack, isPremium: _isPremium, useCredit }: OracleChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'welcome', 
      sender: 'model', 
      text: 'Hoş geldin fani dostum. Gökyüzü ve yıldızların enerjisini yanıma alarak zihnini kurcalayan gizemleri aydınlatmaya geldim. Bana sormak istediğin soruyu yaz ya da aşağıdaki hazır sorulardan birini seç.' 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Yeni bir iş bulabilecek miyim? 💼",
    "Bu hafta benim için nasıl geçecek? 🌟",
    "Aşk hayatımda yakında ne var? ❤️",
    "Şu anki enerjim neyi fısıldıyor? 🔮"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    if (!useCredit()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Build history for API
      const history = messages.slice(1).map(m => ({
        role: m.sender,
        text: m.text
      }));

      const reply = await getOracleChatResponse(text, history);
      
      const modelMsg: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        sender: 'model',
        text: reply
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        sender: 'model',
        text: 'Kozmik dalgalarda bir parazit algıladım. Lütfen sorunuzu tekrar sorun...'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleSpeech = (msgId: string, text: string) => {
    if (activeSpeechMsgId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeechMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';

    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang.includes('tr'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    utterance.onend = () => setActiveSpeechMsgId(null);
    utterance.onerror = () => setActiveSpeechMsgId(null);

    setActiveSpeechMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="scroll-view" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
      {/* Header */}
      <div className="header-bar">
        <button onClick={() => { window.speechSynthesis.cancel(); onBack(); }} className="glass-button" style={{ padding: '8px 12px' }}>
          <ArrowLeft size={16} /> Geri
        </button>
        <h2 style={{ fontSize: '1.2rem' }}>AI Kahin Chat 💬</h2>
        <div style={{ width: '40px' }}></div>
      </div>

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: '380px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div 
                className={`chat-bubble ${msg.sender}`} 
                style={{ 
                  maxWidth: '100%',
                  margin: 0,
                  position: 'relative'
                }}
              >
                {msg.text}

                {/* TTS Reader for Kahin's replies */}
                {msg.sender === 'model' && msg.id !== 'welcome' && (
                  <button
                    onClick={() => toggleSpeech(msg.id, msg.text)}
                    style={{
                      background: 'none', border: 'none', color: activeSpeechMsgId === msg.id ? 'var(--accent-gold)' : 'var(--text-muted)',
                      cursor: 'pointer', marginTop: '6px', fontSize: '0.75rem',
                      display: 'flex', alignItems: 'center', gap: '3px'
                    }}
                  >
                    {activeSpeechMsgId === msg.id ? (
                      <>
                        <VolumeX size={12} /> Ses Kes
                      </>
                    ) : (
                      <>
                        <Volume2 size={12} /> Dinle
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-bubble model" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '12px 20px' }}>
              <span className="dot spin" style={{ animationDelay: '0.1s' }}>🔮</span>
              <span className="dot spin" style={{ animationDelay: '0.2s' }}>🔮</span>
              <span className="dot spin" style={{ animationDelay: '0.3s' }}>🔮</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick selection questions */}
      {messages.length === 1 && !isTyping && (
        <div style={{ padding: '0 20px 10px 20px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HelpCircle size={12} /> Hızlı Sorular:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {quickQuestions.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => handleSend(q.slice(0, -3))} // Strip emoji
                className="glass-button"
                style={{ justifyContent: 'flex-start', padding: '10px 14px', fontSize: '0.8rem', textAlign: 'left' }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel */}
      <div 
        style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid var(--glass-border)',
          background: 'rgba(12, 6, 28, 0.9)',
          position: 'sticky',
          bottom: 0
        }}
      >
        <div className="flex-row" style={{ gap: '10px' }}>
          <input 
            type="text" 
            className="glass-input" 
            placeholder="Sorunu buraya yaz..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
            disabled={isTyping}
            style={{ flex: 1 }}
          />
          <button 
            className="glass-button-gold" 
            onClick={() => handleSend(inputValue)}
            disabled={isTyping || !inputValue.trim()}
            style={{ padding: '12px', borderRadius: '12px' }}
          >
            <Send size={16} />
          </button>
        </div>
        <p className="disclaimer-text mt-2" style={{ border: 'none', padding: 0 }}>
          Kahin sohbeti eğlence amaçlıdır.
        </p>
      </div>
    </div>
  );
}
