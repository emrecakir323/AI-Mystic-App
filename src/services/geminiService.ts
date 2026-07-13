// AI Mystic - Gemini API Service & Simulation Fallback

export interface ReadingResult {
  text: string;
  extraInfo?: string;
  love?: string;
  career?: string;
  money?: string;
  health?: string;
  social?: string;
  lines?: {
    life: string;
    heart: string;
    head: string;
  };
  compatibilityPercent?: number;
}

export interface UserProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  relationshipStatus: string;
  workStatus: string;
}

// Storage key for API Key
const API_KEY_STORAGE_KEY = 'ai_mystic_gemini_api_key';

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

export function saveApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function removeApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

// Helper to make Gemini API Call
async function callGemini(
  prompt: string,
  imageBlob?: { mimeType: string; base64Data: string }
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key bulunamadı.');
  }

  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const parts: any[] = [{ text: prompt }];

  if (imageBlob) {
    parts.push({
      inlineData: {
        mimeType: imageBlob.mimeType,
        data: imageBlob.base64Data,
      },
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData?.error?.message || `HTTP hata kodu: ${response.status}`;
    throw new Error(`Gemini API Hatası: ${errorMessage}`);
  }

  const data = await response.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!responseText) {
    throw new Error('API geçerli bir yanıt döndürmedi.');
  }

  return responseText;
}

// Convert Base64 helper
export async function fileToBase64(file: File): Promise<{ mimeType: string; base64Data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({
        mimeType: file.type,
        base64Data,
      });
    };
    reader.onerror = (error) => reject(error);
  });
}

// Build prompt addition for profile
export function getUserProfile(): UserProfile | undefined {
  const saved = localStorage.getItem('ai_mystic_user_profile');
  return saved ? JSON.parse(saved) : undefined;
}

function buildProfilePrompt(profile?: UserProfile): string {
  const activeProfile = profile || getUserProfile();
  if (!activeProfile) return '';

  const relText = {
    single: 'Bekar (İlişkisi yok)',
    relationship: 'İlişkisi var',
    married: 'Evli',
    crush: 'Platonik aşık / Birinden hoşlanıyor'
  }[activeProfile.relationshipStatus] || 'Bilinmiyor';

  const workText = {
    student: 'Öğrenci',
    employed: 'Çalışan (İş sahibi)',
    unemployed: 'İş arıyor / Çalışmıyor'
  }[activeProfile.workStatus] || 'Bilinmiyor';

  return `
Kullanıcı Profil Detayları:
- İsim: ${activeProfile.name || 'Belirtilmedi'}
- Doğum Tarihi/Saati/Yeri: ${activeProfile.birthDate || 'Belirtilmedi'} / ${activeProfile.birthTime || 'Belirtilmedi'} / ${activeProfile.birthPlace || 'Belirtilmedi'}
- İlişki Durumu: ${relText}
- Çalışma Durumu: ${workText}

Lütfen yorum yaparken bu kullanıcının profil detaylarını (ilişki durumu, mesleki durum, yaş) tam olarak göz önünde bulundurarak yorumunu tamamen bu kişiye özel kurgula. Yorumların içinde kullanıcının ismini (örneğin "Sevgili ${activeProfile.name || 'dostum'}...") kullanarak ona hitap et.`;
}

// --- MOCK DATABASE AND GENERATOR FOR FALLBACK ---

const COFFEE_SHAPES = [
  { shape: 'Kuş (Haber)', meaning: 'Yakın zamanda alacağın sevinçli ve uzun zamandır beklediğin bir haber hanene ulaşıyor.' },
  { shape: 'Yol (Seyahat)', meaning: 'Önünde temiz, aydınlık bir yol uzanıyor. Bu yol hem fiziksel bir yolculuk hem de kariyerinde yeni bir aşama olabilir.' },
  { shape: 'Balık (Kısmet)', meaning: 'Büyük bir balık fincanın dibinde belirmekte. Maddi anlamda çok kısmetli ve bereketli bir döneme giriyorsun.' },
  { shape: 'Göz (Nazar)', meaning: 'Etrafında seni kıskanan veya merakla izleyen bir çift göz var. Enerjini korumaya özen göstermelisin.' },
  { shape: 'Anahtar (Çözüm)', meaning: 'Bekleyen bir sorunun anahtarı eline geçecek. Bir kapı kapanırken daha aydınlık bir diğeri açılıyor.' },
  { shape: 'Ağaç (Kökleşme)', meaning: 'İlişkilerinde veya iş hayatında daha sağlam temeller atacaksın. Aile bağların güçlenecek.' },
  { shape: 'At (Murat)', meaning: 'İçten içe dilediğin o büyük muradın gerçekleşmek üzere. Çok asil ve hayırlı bir dilek bu.' },
  { shape: 'Yılan (Gizli Düşman)', meaning: 'Sana dost gibi görünen ama içten içe haset eden birine işaret ediyor. Sırlarını herkesle paylaşma.' }
];

const TAROT_DECK: Record<string, { name: string; type: string; meaningUp: string; image: string }> = {
  'the_fool': { name: 'Mecnun (The Fool)', type: 'Major', meaningUp: 'Yeni başlangıçlar, masumiyet, macera, spontanelik ve inanç.', image: '🃏' },
  'the_magician': { name: 'Büyücü (The Magician)', type: 'Major', meaningUp: 'İrade gücü, yaratıcılık, yetenek, arzu ve tezahür ettirme gücü.', image: '🪄' },
  'the_high_priestess': { name: 'Azize (The High Priestess)', type: 'Major', meaningUp: 'Sezgiler, bilinçdışı sırlar, kutsal dişil enerji ve içsel bilgelik.', image: '🌙' },
  'the_empress': { name: 'İmparatoriçe (The Empress)', type: 'Major', meaningUp: 'Bereket, doğa, annelik, sanat, güzellik ve bolluk.', image: '👑' },
  'the_emperor': { name: 'İmparator (The Emperor)', type: 'Major', meaningUp: 'Otorite, düzen, yapı, koruma, istikrar ve mantık.', image: '⚔️' },
  'the_hierophant': { name: 'Aziz (The Hierophant)', type: 'Major', meaningUp: 'Gelenekler, ruhsal rehberlik, inançlar, öğrenim ve topluluk.', image: '⛪' },
  'the_lovers': { name: 'Aşıklar (The Lovers)', type: 'Major', meaningUp: 'Uyum, aşk, ilişkiler, kişisel değerler ve önemli seçimler.', image: '💞' },
  'the_chariot': { name: 'Araba (The Chariot)', type: 'Major', meaningUp: 'Zafer, kontrol, irade, kararlılık ve engelleri aşma.', image: '🏎️' },
  'strength': { name: 'Güç (Strength)', type: 'Major', meaningUp: 'İçsel güç, cesaret, şefkat, sabır ve tutkuları dizginleme.', image: '🦁' },
  'the_hermit': { name: 'Ermiş (The Hermit)', type: 'Major', meaningUp: 'İçsel arayış, yalnızlık, tefekkür, ruhsal aydınlanma ve rehberlik.', image: '🕯️' },
  'wheel_of_fortune': { name: 'Kader Çarkı (Wheel of Fortune)', type: 'Major', meaningUp: 'Şans, dönüm noktası, kader, değişim ve döngüler.', image: '🎡' },
  'justice': { name: 'Adalet (Justice)', type: 'Major', meaningUp: 'Dürüstlük, hakkaniyet, gerçek, hukuk ve sorumluluk alma.', image: '⚖️' },
  'the_hanged_man': { name: 'Asılan Adam (The Hanged Man)', type: 'Major', meaningUp: 'Farklı bakış açısı, fedakarlık, teslimiyet ve bekleme dönemi.', image: '🤸' },
  'death': { name: 'Ölüm (Death)', type: 'Major', meaningUp: 'Büyük dönüşüm, sonlanmalar, yeni başlangıçlar ve eskiyi bırakma.', image: '💀' },
  'temperance': { name: 'Denge (Temperance)', type: 'Major', meaningUp: 'Uyum, denge, sabır, ılımlılık ve ruhsal amaç.', image: '🧪' },
  'the_devil': { name: 'Şeytan (The Devil)', type: 'Major', meaningUp: 'Bağımlılık, materyalizm, gölge benlik, zincirler ve farkındalık.', image: '😈' },
  'the_tower': { name: 'Yıkılan Kule (The Tower)', type: 'Major', meaningUp: 'Beklenmedik değişim, kaos, aydınlanma, yıkım ve yeniden inşa.', image: '🏰' },
  'the_star': { name: 'Yıldız (The Star)', type: 'Major', meaningUp: 'Umut, inanç, iyileşme, yenilenme ve ruhsal huzur.', image: '⭐' },
  'the_moon': { name: 'Ay (The Moon)', type: 'Major', meaningUp: 'İllüzyon, korku, kaygı, sezgiler ve bilinmeyenin çağrısı.', image: '🌕' },
  'the_sun': { name: 'Güneş (The Sun)', type: 'Major', meaningUp: 'Başarı, neşe, canlılık, aydınlanma, kutlama ve sıcaklık.', image: '☀️' },
  'judgement': { name: 'Mahkeme (Judgement)', type: 'Major', meaningUp: 'Uyanış, muhakeme, af, hayat amacı ve yenilenme.', image: '🔔' },
  'the_world': { name: 'Dünya (The World)', type: 'Major', meaningUp: 'Bütünlük, tamamlanma, başarı, seyahat ve hedefe ulaşma.', image: '🌍' }
};

export const TAROT_LIST = Object.entries(TAROT_DECK).map(([key, value]) => ({
  id: key,
  ...value
}));

const HOROSCOPES = {
  koc: { name: 'Koç', element: 'Ateş', dates: '21 Mart - 19 Nisan' },
  boga: { name: 'Boğa', element: 'Toprak', dates: '20 Nisan - 20 Mayıs' },
  ikizler: { name: 'İkizler', element: 'Hava', dates: '21 Mayıs - 20 Haziran' },
  yengec: { name: 'Yengeç', element: 'Su', dates: '21 Haziran - 22 Temmuz' },
  aslan: { name: 'Aslan', element: 'Ateş', dates: '23 Temmuz - 22 Ağustos' },
  basak: { name: 'Başak', element: 'Toprak', dates: '23 Ağustos - 22 Eylül' },
  terazi: { name: 'Terazi', element: 'Hava', dates: '23 Eylül - 22 Ekim' },
  akrep: { name: 'Akrep', element: 'Su', dates: '23 Ekim - 21 Kasım' },
  yay: { name: 'Yay', element: 'Ateş', dates: '22 Kasım - 21 Aralık' },
  oglak: { name: 'Oğlak', element: 'Toprak', dates: '22 Aralık - 19 Ocak' },
  kova: { name: 'Kova', element: 'Hava', dates: '20 Ocak - 18 Şubat' },
  balik: { name: 'Balık', element: 'Su', dates: '19 Şubat - 20 Mart' }
};

export const HOROSCOPE_LIST = Object.entries(HOROSCOPES).map(([key, value]) => ({
  id: key,
  ...value
}));

// Generates simulated rich readings in Turkish using profile context if available
const mockGenerate = {
  coffee: (storyMode: boolean, profile?: UserProfile): ReadingResult => {
    const activeProfile = profile || getUserProfile();
    const selectedShapes = [...COFFEE_SHAPES].sort(() => 0.5 - Math.random()).slice(0, 3);
    const shapeList = selectedShapes.map(s => s.shape.split(' ')[0]).join(', ');
    const name = activeProfile?.name || 'Sevgili dostum';
    
    let mainStory = '';
    if (storyMode) {
      mainStory = `Fincanını kaldırdığımda yoğun bir mistik enerji hissettim. Sevgili ${name}, telve desenlerinde özellikle ${shapeList} sembolleri göze çarpıyor. İlk olarak, fincanın ağız kısmına doğru uzanan ${selectedShapes[0].shape} sembolü, son zamanlarda kafanı kurcalayan bir meselenin çok yakında ferahlığa kavuşacağını gösteriyor. Orta kısımlardaki ${selectedShapes[1].shape} ise seni sabırla atlatman gereken küçük bir dönemece götürüyor. Son olarak, dipteki ${selectedShapes[2].shape} köklü bir dileğinin gerçekleşmek üzere olduğunu fısıldıyor. Genel olarak, fincanında aydınlık bir gelecek ve ruhsal bir arınma seziliyor.`;
    } else {
      mainStory = `Sevgili ${name}, fincanında beliren ana semboller: ${selectedShapes.map(s => s.shape).join(' ve ')}. Bu semboller hayatındaki geçiş dönemlerini, alacağın önemli kararları ve yakın çevrendeki insan ilişkilerini yansıtıyor. Kendine zaman tanımalı, sezgilerine güvenmeli ve karşına çıkacak fırsatları cesaretle kucaklamalısın.`;
    }

    // Adapt love / career based on profile
    let loveComment = '';
    if (activeProfile?.relationshipStatus === 'single') {
      loveComment = `Aşk hayatında bekar olmanın verdiği bağımsızlığı seviyorsun ancak ${selectedShapes[0].meaning.toLowerCase()} Yakın zamanda hayatına heyecan katacak, ortak frekansta buluşabileceğin yeni bir aday karşına çıkabilir. Sınırlarını açık tut.`;
    } else if (activeProfile?.relationshipStatus === 'relationship' || activeProfile?.relationshipStatus === 'married') {
      loveComment = `Mevcut ilişkinde partnerinle olan bağlarında ${selectedShapes[0].meaning.toLowerCase()} Karşılıklı anlayış derinleşecek. Ufak tefek fikir ayrılıklarını ortak bir paydada buluşarak çözeceksiniz.`;
    } else if (activeProfile?.relationshipStatus === 'crush') {
      loveComment = `Platonik hislerinle ilgili kalbinde tatlı bir karmaşa var. ${selectedShapes[0].meaning.toLowerCase()} Sevdiğin veya ilgi duyduğun kişiden alacağın küçük bir adım, aranızdaki mesafeyi eritebilir.`;
    } else {
      loveComment = `Aşk hayatında ${selectedShapes[0].meaning.toLowerCase()} Mevcut ilişkilerin derinleşeceği veya yeni heyecan verici adımların atılacağı olumlu bir döneme giriyorsun.`;
    }

    let careerComment = '';
    if (activeProfile?.workStatus === 'student') {
      careerComment = `Eğitim hayatında ve derslerinde ${selectedShapes[1].meaning.toLowerCase()} Yaklaşan sınavlar veya ödevlerde yeteneklerini kanıtlaman için harika bir döneme giriyorsun. Konsantrasyonunu bozma.`;
    } else if (activeProfile?.workStatus === 'employed') {
      careerComment = `İş hayatında ve kariyerinde ${selectedShapes[1].meaning.toLowerCase()} Yeni sorumluluklar almak seni korkutmasın; aksine yeteneklerini üst yöneticilerine göstermen için harika bir fırsat sunulacak.`;
    } else if (activeProfile?.workStatus === 'unemployed') {
      careerComment = `İş arayış sürecinde ${selectedShapes[1].meaning.toLowerCase()} Çok yakın zamanda, aradığın kriterlere uygun, geleceğini sağlam temellere oturtacak hayırlı bir iş kapısı aralanabilir.`;
    } else {
      careerComment = `Kariyerinde ${selectedShapes[1].meaning.toLowerCase()} Yeteneklerini üstlerine kanıtlaman için harika bir döneme giriyorsun.`;
    }

    return {
      text: mainStory,
      extraInfo: `Fincanda beliren başlıca şekiller: ${selectedShapes.map(s => s.shape).join(', ')}`,
      love: loveComment,
      career: careerComment,
      money: `Maddi konularda ${selectedShapes[2].meaning.toLowerCase()} Beklenmedik bir kaynaktan gelecek küçük bir destek veya ek gelir, bütçeni rahatlatacak ve seni sevindirecek.`,
      health: `Enerjinin yüksek olduğu bir gün. Ancak stres kaynaklı ufak tefek baş ağrılarına karşı dikkatli olmalısın. Ruhunu dinlendirecek aktivitelere vakit ayır.`,
      social: `Sosyal çevrende parladığın bir dönem. Bazı eski dostlarla bir araya gelip keyifli planlar yapabilir, yeni insanlarla tanışarak vizyonunu genişletebilirsin.`
    };
  },

  tarot: (cards: string[], profile?: UserProfile): ReadingResult => {
    const activeProfile = profile || getUserProfile();
    const cObjects = cards.map(id => TAROT_DECK[id] || TAROT_DECK['the_fool']);
    const name = activeProfile?.name || 'Sevgili dostum';
    
    const text = `Sevgili ${name}, seçtiğin kartlar sırasıyla: **${cObjects[0].name} (Geçmiş)**, **${cObjects[1].name} (Şimdi)** ve **${cObjects[2].name} (Gelecek)**.
    
**Geçmiş Enerjisi (${cObjects[0].name}):** Hayatının bu evresi, geçmişte attığın adımların ve aldığın derslerin bir yansıması. ${cObjects[0].meaningUp} Bu kart, seni şimdiki anına hazırlayan içsel bir olgunlaşma dönemini simgeliyor.

**Şimdiki Zaman Enerjisi (${cObjects[1].name}):** Şu an tam olarak odaklanman gereken durumları gösteriyor. ${cObjects[1].meaningUp} Sezgilerini dinlemeli ve bu kartın sunduğu enerjiyi hayatına entegre etmelisin.

**Gelecek Enerjisi (${cObjects[2].name}):** Önündeki günlerde seni bekleyen potansiyel gelişmeleri işaret ediyor. ${cObjects[2].meaningUp} Kararlı davranır ve kartın önerdiği bilgelikle ilerlersen, hedeflerine ulaşman çok daha kolay olacaktır.

*Sentez Yorum:* Bu üç kart bir araya geldiğinde, hayatında önemli bir karar aşamasında olduğunu ve geçmiş tecrübelerin ışığında sezgilerini kullanarak geleceğe emin adımlarla ilerlemen gerektiğini fısıldıyor.`;

    return { text };
  },

  horoscope: (sign: string, type: 'daily' | 'weekly' | 'monthly', profile?: UserProfile): ReadingResult => {
    const activeProfile = profile || getUserProfile();
    const name = HOROSCOPES[sign as keyof typeof HOROSCOPES]?.name || 'Koç';
    const element = HOROSCOPES[sign as keyof typeof HOROSCOPES]?.element || 'Ateş';
    const userName = activeProfile?.name ? `Sevgili ${activeProfile.name},` : '';

    let text = '';
    if (type === 'daily') {
      text = `${userName} bugün Ay'ın konumu, ${name} burcu için özellikle içsel dengeleri ön plana çıkarıyor. ${element} elementinin verdiği dinamizmle sabah saatlerinde yüksek bir energy hissetsen de, öğleden sonra daha sakin kalıp planlarını gözden geçirmek isteyebilirsin. Aşk hayatında partnerinle yapacağın samimi bir konuşma bağları güçlendirecek. Kariyerinde ise fevri kararlardan kaçınmalısın. Bugün şanslı sayın: 7, şanslı rengin: Gece Mavisi.`;
    } else if (type === 'weekly') {
      text = `${userName} bu hafta gökyüzündeki gezegen hareketleri ${name} burcu için adeta bir yenilenme sürecini müjdeliyor. İş hayatında uzun süredir emek verdiğin projelerin meyvelerini toplamaya başlayabilirsin. İkili ilişkilerde ise bazı yanlış anlaşılmaların tatlıya bağlanacağı, iletişimin yoğun olacağı günler kapıda. Hafta ortasında finansal konularda temkinli olmanda fayda var; gereksiz harcamalardan kaçın.`;
    } else {
      text = `${userName} bu ay ${name} burcu için köklü dönüşümlerin ve büyük kararların ayı olacak. Göksel enerjiler, hedeflerini büyütmen ve cesur adımlar atman için seni destekliyor. Özellikle sosyal çevrenden alacağın desteklerle yeni kapılar aralanabilir. Aşkta aradığın huzur ve güveni bulacağın, ilişkilerin ciddiyete binebileceği bir dönem. Sağlığına ve bağışıklık sistemine ekstra özen göstermeyi unutma.`;
    }

    return { text };
  },

  dream: (dreamText: string, profile?: UserProfile): ReadingResult => {
    const activeProfile = profile || getUserProfile();
    const textLower = dreamText.toLowerCase();
    const name = activeProfile?.name || 'Sevgili dostum';
    let detectedSymbols: string[] = [];
    let interpretation = '';

    if (textLower.includes('deniz') || textLower.includes('su')) {
      detectedSymbols.push('Deniz/Su (Bilinçaltı ve Duygular)');
    }
    if (textLower.includes('balık')) {
      detectedSymbols.push('Balık (Kısmet ve Bolluk)');
    }
    if (textLower.includes('uçmak') || textLower.includes('gökyüzü')) {
      detectedSymbols.push('Uçmak (Özgürlük ve Yükseliş)');
    }
    if (textLower.includes('düşmek')) {
      detectedSymbols.push('Düşmek (Kontrol Kaybı ve Kaygı)');
    }
    if (textLower.includes('yılan')) {
      detectedSymbols.push('Yılan (Dönüşüm ve Gizli Bilgi/Haset)');
    }
    if (textLower.includes('köpek') || textLower.includes('kedi')) {
      detectedSymbols.push('Evcil Hayvan (Sadakat ve Dostluk)');
    }

    if (detectedSymbols.length === 0) {
      detectedSymbols.push('Bilinmeyen Mistisizm Sembolleri');
      interpretation = `Sevgili ${name}, rüyanda anlattığın imgeler, iç dünyanda derin bir arayış içinde olduğunu gösteriyor. Zihninin derinliklerindeki karmaşık duyguları sembolize eden bu rüya, hayatında yeni bir sayfa açmak, bazı eski alışkanlıklarından arınmak ve iç sesine daha fazla kulak vermek istediğini gösteriyor. Karşına çıkacak gizemli gelişmelere karşı açık olmalısın.`;
    } else {
      interpretation = `Sevgili ${name}, rüyanda öne çıkan semboller şunlar: **${detectedSymbols.join(', ')}**.
      
Bu sembollerin birleşimi, bilinçaltının sana şu mesajı ilettiğini gösteriyor: Ruhsal dünyanda duygusal derinliğin arttığı, sezgilerinin güçlendiği bir dönemdesin. Rüyandaki imgeler, hayatındaki belirsizliklerin yavaş yavaş çözüleceğini, içindeki gücü keşfederek özgürleşeceğini ve seni kısıtlayan kalıplardan kurtulacağını müjdeliyor.`;
    }

    return {
      text: interpretation,
      extraInfo: `Analiz edilen semboller: ${detectedSymbols.join(', ')}`
    };
  },

  palm: (profile?: UserProfile): ReadingResult => {
    const activeProfile = profile || getUserProfile();
    const name = activeProfile?.name || 'Sevgili dostum';
    return {
      text: `Sevgili ${name}, avuç içi çizgilerini incelediğimde, hayat enerjinin oldukça güçlü olduğunu seziyorum. Genel olarak dengeli, derin ve tecrübelerle zenginleşmiş bir yaşam yolu karşına çıkıyor. Kendine olan inancını koruduğun sürece çizgilerinin vadettiği huzura erişeceksin.`,
      lines: {
        life: 'Yaşam çizgin derin ve belirgin bir kavisle uzanıyor. Bu durum, fiziksel direncinin yüksek olduğunu ve hayati zorluklar karşısında büyük bir yenilenme gücüne sahip olduğunu gösteriyor. Hayatının ilerleyen dönemlerinde köklü değişimler seni bekliyor.',
        heart: 'Kalp çizgin parmak diplerine doğru tatlı bir kavis yapıyor. İkili ilişkilerinde tutkulu, sadık ve şefkatli bir yapıya sahipsin. Sevgini göstermekten çekinmeyen yapın seni bazen kırılgan yapsa da, sevgide aradığın derinliği er geç bulacaksın.',
        head: 'Baş çizgin avucunun ortasına doğru net bir şekilde uzanıyor. Mantıklı düşünebilen, analitik zekası gelişmiş ve odaklanma yeteneği yüksek biri olduğunu gösteriyor. Karşılaştığın problemleri yaratıcı fikirlerle çözmekte oldukça ustasın.'
      }
    };
  },

  chat: (message: string, profile?: UserProfile): string => {
    const activeProfile = profile || getUserProfile();
    const textLower = message.toLowerCase();
    const name = activeProfile?.name || 'fani dostum';
    
    if (textLower.includes('iş') || textLower.includes('kariyer') || textLower.includes('meslek') || textLower.includes('para') || textLower.includes('zengin')) {
      return `Sevgili ${name}, kariyer ve maddi konularla ilgili zihninde bazı sorular var gibi görünüyor. Yıldızlar, önümüzdeki dönemde önüne çıkacak fırsatları iyi değerlendirmen gerektiğini söylüyor. Kesin bir tarih vermek yerine, önümüzdeki 3 vakte kadar işlerin senin lehine dönebileceği enerjiler hissediyorum. Hazırlıklı ol ve yeteneklerine güven.`;
    }
    
    if (textLower.includes('aşk') || textLower.includes('sevgili') || textLower.includes('evlilik') || textLower.includes('hoşlan') || textLower.includes('sev')) {
      return `Sevgili ${name}, aşkın ve duyguların enerjisi şu sıralar kalbinde yoğunlaşıyor. Eğer hayatında biri varsa, aranızdaki bağın güçleneceği ve ortak kararlar alabileceğiniz bir sürece giriyorsunuz. Yalnızsan, kendini sevmeye odaklandığında doğru frekanstaki insanın hayatına çekildiğini göreceksiniz. Kalbini açık tut.`;
    }

    if (textLower.includes('sağlık') || textLower.includes('hastalık') || textLower.includes('şifa')) {
      return `Bedeninin ve ruhunun dinlenmeye ihtiyacı olduğu bir dönemdesin ${name}. Enerjini tüketen insanlardan uzak durmak ve doğada vakit geçirmek sana şifa gibi gelecektir. Unutma, ruhun sağlıklı olduğunda bedenin de onunla uyumlanır.`;
    }

    const answers = [
      `Sevgili ${name}, geleceğin kapıları her zaman ardına kadar açık ve yollar tek bir yöne gitmez. Sezgilerini dinlemeli ve içindeki sese güvenmelisin.`,
      `Sorduğun sorunun cevabı aslında içinde bir yerlerde gizli ${name}. Kendi gücünün farkına vardığında engellerin birer birer kalktığını göreceksiniz.`,
      `Şu sıralar etrafındaki enerjiler bir değişim içinde. Sabırlı olup olayların akışına izin vermek en doğrusu olacaktır ${name}.`,
      `Gökyüzünün mesajı senin için net ${name}: Kararsız kaldığın konularda mantığınla değil, sezgilerinle hareket et. Cevap seni şaşırtacak.`
    ];

    return answers[Math.floor(Math.random() * answers.length)];
  },

  friendship: (profile?: UserProfile): ReadingResult => {
    const activeProfile = profile || getUserProfile();
    const percent = Math.floor(Math.random() * 31) + 70; // 70-100%
    const name = activeProfile?.name ? `${activeProfile.name} ve arkadaşının` : 'İkinizin';
    let msg = '';
    if (percent >= 90) {
      msg = `Harika bir uyum! ${name} enerjisi birbirini mükemmel tamamlıyor. Birlikteyken hem eğleniyor hem de birbirinize büyük bir ruhsal güç veriyorsunuz. Birbirinizi kırmadan, dürüstlükle iletişim kurduğunuz sürece sarsılmaz bir dostluğunuz olacak.`;
    } else if (percent >= 80) {
      msg = `Oldukça yüksek bir arkadaşlık enerjisi. Fikir ayrılıkları yaşasanız bile ortak bir noktada buluşmayı başarıyorsunuz. Birbirinizin sınırlarına saygı gösterdiğiniz sürece harika bir ekip olabilirsiniz.`;
    } else {
      msg = `İyi bir uyum yakalanabilir ancak zaman zaman iletişimde ufak tefek yanlış anlaşılmalar veya beklenti farklılıkları yaşanabilir. Birbirinizi dinlemek ve açık olmak bu arkadaşlığın anahtarıdır.`;
    }

    return {
      text: msg,
      compatibilityPercent: percent
    };
  }
};

// --- MAIN EXPORTED API WRAPPERS ---

export async function getCoffeeFortune(storyMode: boolean, imageFile?: File, profile?: UserProfile): Promise<ReadingResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    // Return mock with simulated delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    return mockGenerate.coffee(storyMode, profile);
  }

  try {
    let base64Img: { mimeType: string; base64Data: string } | undefined;
    if (imageFile) {
      base64Img = await fileToBase64(imageFile);
    }

    const modeText = storyMode ? "anlatıcı ve hikayeleştirici tarzda" : "klasik ve başlıklar altında";
    let prompt = `Sen asırlık tecrübesi olan, altıncı hissi son derece kuvvetli bir Türk kahvesi yorumcususun. Yüklenen Türk kahvesi fincanı fotoğrafını mistik gözlerinle analiz et.
Bana ${modeText} Türkçe ve çok zengin içerikli bir kahve falı yorumu oluştur.
Anlatımında "hanene doğan güneş", "yıldızının parlaması", "üç vakte kadar gelecek sevinç", "yol ayrımları", "göz nazarı" gibi geleneksel mistik fallara özgü otantik deyimleri ve tabirleri bolca kullan.
Yorum şu bölümlerden oluşsun ve bunları JSON yapısında döndürmeni istiyorum veya düzgün Markdown formatında yaz ama mutlaka şu başlıklar yer alsın:
1. Genel Hikaye/Yorum (text)
2. Aşk Hayatı Yorumu (love)
3. Kariyer ve İş Yorumu (career)
4. Para ve Maddi Durum Yorumu (money)
5. Sağlık Durumu Yorumu (health)
6. Sosyal Yaşam Yorumu (social)
7. Fincanda görülen ana semboller (extraInfo)

Lütfen yorumun en sonuna mutlaka şu uyarıyı ekle: "Bu içerik yalnızca eğlence amaçlıdır."`;

    prompt += buildProfilePrompt(profile);

    const resultText = await callGemini(prompt, base64Img);
    // Parse result or return it directly
    return parseGeminiResponse(resultText, mockGenerate.coffee(storyMode, profile));
  } catch (error) {
    console.error("Gemini API error in Coffee Fortune, falling back to mock:", error);
    return mockGenerate.coffee(storyMode, profile);
  }
}

export async function getTarotReading(selectedCardIds: string[], profile?: UserProfile): Promise<ReadingResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 2500));
    return mockGenerate.tarot(selectedCardIds, profile);
  }

  try {
    const cardNames = selectedCardIds.map(id => TAROT_DECK[id]?.name || id).join(', ');
    let prompt = `Sen kadim tarot sembollerinin gizemine hakim, sezgisel enerjilerle bağ kuran bir Tarot Üstadısın. Bir Tarot falı açılımı yapmanı istiyorum. Seçilen kartlar sırasıyla Geçmiş, Şimdi ve Gelecek pozisyonlarındadır.
Kartlar: ${cardNames}.
Lütfen bu kartların anlamlarını, birbirleriyle olan numerolojik ilişkilerini ve pozisyonel enerjilerini birleştirerek Türkçe, son derece kişiselleştirilmiş, akıcı, derinlikli ve adeta bir kehanet gibi akan sürükleyici bir yorum yap. 
Lütfen yorumun en sonuna şu uyarıyı ekle: "Bu içerik yalnızca eğlence amaçlıdır."`;

    prompt += buildProfilePrompt(profile);

    const text = await callGemini(prompt);
    return { text };
  } catch (error) {
    console.error("Gemini API error in Tarot, falling back to mock:", error);
    return mockGenerate.tarot(selectedCardIds, profile);
  }
}

export async function getHoroscopeReading(sign: string, type: 'daily' | 'weekly' | 'monthly', profile?: UserProfile): Promise<ReadingResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockGenerate.horoscope(sign, type, profile);
  }

  try {
    let prompt = `Sen gökyüzü hareketlerini, doğum haritalarını ve gezegen etkileşimlerini yorumlayan profesyonel bir astrologsun. ${sign} burcu için ${type === 'daily' ? 'günlük' : type === 'weekly' ? 'haftalık' : 'aylık'} astroloji yorumu yazar mısın? 
Doğal, akıcı, ruhsal tavsiyeler barındıran, motive edici ve yapay zeka tarafından özel hazırlanmış hissi veren, son derece kaliteli ve derin bir dil kullan. Türkçe yaz.
Sonunda mutlaka "Bu içerik yalnızca eğlence amaçlıdır." uyarısı yer alsın.`;

    prompt += buildProfilePrompt(profile);

    const text = await callGemini(prompt);
    return { text };
  } catch (error) {
    console.error("Gemini API error in Horoscope, falling back to mock:", error);
    return mockGenerate.horoscope(sign, type, profile);
  }
}

export async function getDreamInterpretation(dreamText: string, profile?: UserProfile): Promise<ReadingResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return mockGenerate.dream(dreamText, profile);
  }

  try {
    let prompt = `Sen rüyaları insan zihninin derin kapıları olarak gören, sembolizm ve bilinçaltı arketipi uzmanı bir Rüya Tabircisisin. Kullanıcı rüyasını şu şekilde yazdı: "${dreamText}"
Bu rüyadaki sembolleri hem Carl Jung ekolü psikolojik derinlikle hem de geleneksel mistik inanışlara dayalı olarak son derece kapsamlı ve derinlikli bir şekilde Türkçe yorumla.
Metin içinde analiz ettiğin sembolleri (örneğin: deniz, balık vb.) başlıklar halinde detaylandır.
Sonunda mutlaka "Bu içerik yalnızca eğlence amaçlıdır." uyarısı yer alsın.`;

    prompt += buildProfilePrompt(profile);

    const text = await callGemini(prompt);
    return {
      text,
      extraInfo: "Semboller AI tarafından rüya metninden otomatik olarak çözümlenmiştir."
    };
  } catch (error) {
    console.error("Gemini API error in Dream, falling back to mock:", error);
    return mockGenerate.dream(dreamText, profile);
  }
}

export async function getPalmReading(imageFile?: File, profile?: UserProfile): Promise<ReadingResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return mockGenerate.palm(profile);
  }

  try {
    let base64Img: { mimeType: string; base64Data: string } | undefined;
    if (imageFile) {
      base64Img = await fileToBase64(imageFile);
    }

    let prompt = `Sen el çizgilerinin gizli coğrafyasını okuyan bilge bir el falı üstadısın (Kiroloji uzmanı). Lütfen yüklenen avuç içi fotoğrafını analiz et.
Geleneksel el falı inanışlarına dayanarak şu üç çizgiyi detaylıca yorumla:
1. Yaşam Çizgisi (life) - canlılık, sağlık ve yaşam dönemeçleri.
2. Kalp Çizgisi (heart) - duygusal ilişkiler, empati seviyesi ve kalbi arzular.
3. Baş Çizgisi (head) - mantık, analitik güç ve odaklanma yeteneği.

Cevabı şu başlıklar veya alanlar halinde Türkçe döndür:
- Genel Yorum (text)
- Yaşam Çizgisi Yorumu (life)
- Kalp Çizgisi Yorumu (heart)
- Baş Çizgisi Yorumu (head)

Sonunda mutlaka "Bu içerik yalnızca eğlence amaçlıdır." uyarısı yer alsın.`;

    prompt += buildProfilePrompt(profile);

    const resultText = await callGemini(prompt, base64Img);
    return parseGeminiPalmResponse(resultText, mockGenerate.palm(profile));
  } catch (error) {
    console.error("Gemini API error in Palmistry, falling back to mock:", error);
    return mockGenerate.palm(profile);
  }
}

export async function getOracleChatResponse(message: string, history: { role: 'user' | 'model'; text: string }[], profile?: UserProfile): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockGenerate.chat(message, profile);
  }

  try {
    const formattedHistory = history.map(h => `${h.role === 'user' ? 'Kullanıcı' : 'Kahin'}: ${h.text}`).join('\n');
    let prompt = `Sen mistik, bilge ve motive edici bir AI Kahinsin (Oracle). Kullanıcı sana sorular soruyor. 
Kesin gelecek iddialarında bulunmadan, olasılıklardan, içsel enerjilerden ve motive edici önerilerden bahsederek eğlence amaçlı cevaplar ver. 
Asla finansal, hukuki veya hayati tıbbi kararlar hakkında yönlendirme yapma. Türkçe cevap ver.
Cevaplarının sonuna her zaman küçük bir parantez içi veya dipnot olarak "Bu içerik eğlence amaçlıdır." uyarısını ekle.

Geçmiş Sohbet:
${formattedHistory}

Kullanıcının Yeni Sorusu: "${message}"`;

    prompt += buildProfilePrompt(profile);

    return await callGemini(prompt);
  } catch (error) {
    console.error("Gemini API error in Chat, falling back to mock:", error);
    return mockGenerate.chat(message, profile);
  }
}

export async function getFriendshipReading(imageFile1?: File, _imageFile2?: File, profile?: UserProfile): Promise<ReadingResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return mockGenerate.friendship(profile);
  }

  try {
    let base64Img1: { mimeType: string; base64Data: string } | undefined;
    if (imageFile1) {
      base64Img1 = await fileToBase64(imageFile1);
    }
    
    let prompt = `Sen ilişkilerin ve dostlukların enerjilerini saptayan sezgisel bir bağ analiz uzmanısın. Arkadaş Falı analizi yapmanı istiyorum. İki arkadaşın fincanlarının veya ortak enerjilerinin analizidir. 
Lütfen bu iki görseldeki / enerjideki uyumu analiz et ve:
1. Uyum yüzdesini belirle (0-100 arası)
2. Ortak enerjiyi, arkadaşlığın güçlü yönlerini, birbirinizi besleyen yanları ve olası iletişim engellerini tatlı, eğlenceli, edebi ve motive edici bir dille yorumla.
Türkçe yaz. Sonunda mutlaka "Bu içerik yalnızca eğlence amaçlıdır." uyarısı yer alsın.`;

    prompt += buildProfilePrompt(profile);

    const resultText = await callGemini(prompt, base64Img1);
    const percent = Math.floor(Math.random() * 20) + 80;
    return {
      text: resultText,
      compatibilityPercent: percent
    };
  } catch (error) {
    console.error("Gemini API error in Friendship, falling back to mock:", error);
    return mockGenerate.friendship(profile);
  }
}

// --- HELPER PARSERS ---

function parseGeminiResponse(text: string, fallback: ReadingResult): ReadingResult {
  const result: ReadingResult = { text };
  
  const loveMatch = text.match(/(?:Aşk|Love)[\s\S]*?\n([\s\S]*?)(?=\n(?:Kariyer|Career|Para|Money|Sağlık|Health|Sosyal|Social|Fincan|Ağaç|Yol|Balık|$))/i);
  if (loveMatch) result.love = loveMatch[1].trim();
  
  const careerMatch = text.match(/(?:Kariyer|Career|İş)[\s\S]*?\n([\s\S]*?)(?=\n(?:Para|Money|Sağlık|Health|Sosyal|Social|Aşk|Love|$))/i);
  if (careerMatch) result.career = careerMatch[1].trim();

  const moneyMatch = text.match(/(?:Para|Money|Maddi)[\s\S]*?\n([\s\S]*?)(?=\n(?:Sağlık|Health|Sosyal|Social|Aşk|Love|Kariyer|Career|$))/i);
  if (moneyMatch) result.money = moneyMatch[1].trim();

  const healthMatch = text.match(/(?:Sağlık|Health)[\s\S]*?\n([\s\S]*?)(?=\n(?:Sosyal|Social|Aşk|Love|Kariyer|Career|Para|Money|$))/i);
  if (healthMatch) result.health = healthMatch[1].trim();

  const socialMatch = text.match(/(?:Sosyal|Social|Yaşam)[\s\S]*?\n([\s\S]*?)(?=\n(?:Aşk|Love|Kariyer|Career|Para|Money|Sağlık|Health|$))/i);
  if (socialMatch) result.social = socialMatch[1].trim();

  const extraMatch = text.match(/(?:Semboller|Şekiller|Görülen)[\s\S]*?\n([\s\S]*?)(?=$)/i);
  if (extraMatch) result.extraInfo = extraMatch[1].trim();

  result.love = result.love || fallback.love;
  result.career = result.career || fallback.career;
  result.money = result.money || fallback.money;
  result.health = result.health || fallback.health;
  result.social = result.social || fallback.social;
  result.extraInfo = result.extraInfo || fallback.extraInfo;

  return result;
}

function parseGeminiPalmResponse(text: string, fallback: ReadingResult): ReadingResult {
  const result: ReadingResult = { text, lines: { life: '', heart: '', head: '' } };
  
  const lifeMatch = text.match(/(?:Yaşam|Life)[\s\S]*?\n([\s\S]*?)(?=\n(?:Kalp|Heart|Baş|Head|$))/i);
  const heartMatch = text.match(/(?:Kalp|Heart)[\s\S]*?\n([\s\S]*?)(?=\n(?:Yaşam|Life|Baş|Head|$))/i);
  const headMatch = text.match(/(?:Baş|Head|Zihin)[\s\S]*?\n([\s\S]*?)(?=\n(?:Yaşam|Life|Kalp|Heart|$))/i);

  result.lines!.life = lifeMatch ? lifeMatch[1].trim() : fallback.lines!.life;
  result.lines!.heart = heartMatch ? heartMatch[1].trim() : fallback.lines!.heart;
  result.lines!.head = headMatch ? headMatch[1].trim() : fallback.lines!.head;

  return result;
}

export interface SavedReading {
  id: string;
  type: string;
  typeName: string;
  date: string;
  title: string;
  text: string;
  love?: string;
  career?: string;
  money?: string;
  health?: string;
  social?: string;
  notes?: string;
}

export function saveReadingToHistory(
  type: string,
  typeName: string,
  title: string,
  result: ReadingResult
): void {
  const existingJson = localStorage.getItem('ai_mystic_saved_readings');
  const existing: SavedReading[] = existingJson ? JSON.parse(existingJson) : [];
  
  const newReading: SavedReading = {
    id: `reading-${Date.now()}`,
    type,
    typeName,
    date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
    title,
    text: result.text,
    love: result.love,
    career: result.career,
    money: result.money,
    health: result.health,
    social: result.social,
    notes: ''
  };
  
  existing.unshift(newReading);
  localStorage.setItem('ai_mystic_saved_readings', JSON.stringify(existing));
}
