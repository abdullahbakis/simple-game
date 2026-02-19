export type LangCode = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'zh';

export interface Translations {
  langName: string;
  startMenu: {
    tagline: string;
    best: string;
    play: string;
    startLevel: string;
    selectLevel: string;
    shop: string;
    privacyPolicy: string;
  };
  hud: {
    hp: string;
    level: string;
    target: string;
    levelTarget: string;
  };
  levelComplete: {
    nice: string;
    coinsEarned: string;
    nextLevel: string;
    cosmicTitle: string;
    cosmicQuote: string;
    cosmicSkinUnlocked: string;
    claimGlory: string;
  };
  gameOver: {
    oops: string;
    score: string;
    reviveAd: string;
    reviveCoins: string;
    giveUp: string;
  };
  shop: {
    title: string;
    bank: string;
    freeCoins: string;
    special: string;
    unlockNextMilestone: string;
    lineSkins: string;
    coins: string;
    orBeatLevel100: string;
    equipped: string;
    equip: string;
    buy: string;
    locked: string;
    iapPouch: string;
    iapSack: string;
    iapChest: string;
    iapBarrel: string;
    iapVault: string;
  };
  milestones: {
    firstSteps: { title: string; subtitle: string };
    risingStar: { title: string; subtitle: string };
    chainArtist: { title: string; subtitle: string };
    gravityMaster: { title: string; subtitle: string };
    warpNavigator: { title: string; subtitle: string };
    stormChaser: { title: string; subtitle: string };
    antiGravityAce: { title: string; subtitle: string };
    laserDancer: { title: string; subtitle: string };
    meteorDodger: { title: string; subtitle: string };
    teslaTamer: { title: string; subtitle: string };
    forceBender: { title: string; subtitle: string };
    phaseWalker: { title: string; subtitle: string };
    ironWill: { title: string; subtitle: string };
    orbitBreaker: { title: string; subtitle: string };
    solarGuardian: { title: string; subtitle: string };
    timeBender: { title: string; subtitle: string };
    apexPredator: { title: string; subtitle: string };
    voidWalker: { title: string; subtitle: string };
    livingLegend: { title: string; subtitle: string };
  };
}

export const TRANSLATIONS: Record<LangCode, Translations> = {
  en: {
    langName: 'English',
    startMenu: {
      tagline: '100 Levels -- Draw lines -- Guide the candies!',
      best: 'Best: Level {n} cleared',
      play: 'PLAY',
      startLevel: 'START LVL {n}',
      selectLevel: 'Select Level',
      shop: 'Shop',
      privacyPolicy: 'Privacy Policy',
    },
    hud: {
      hp: 'HP',
      level: 'L{n}',
      target: 'Target',
      levelTarget: 'Level {level} -- Target: {target}',
    },
    levelComplete: {
      nice: 'NICE!',
      coinsEarned: '+{n} coins earned',
      nextLevel: 'Next Level',
      cosmicTitle: 'COSMIC EMPEROR',
      cosmicQuote: '"The universe doesn\'t yield to the strong -- it yields to the relentless. You didn\'t just play the game. You mastered chaos itself."',
      cosmicSkinUnlocked: 'Cosmic Emperor Skin Unlocked',
      claimGlory: 'Claim Glory',
    },
    gameOver: {
      oops: 'OOPS!',
      score: 'Score: {score} / {target}',
      reviveAd: 'Revive (Watch Ad)',
      reviveCoins: 'Revive ({n} Coins)',
      giveUp: 'Give Up',
    },
    shop: {
      title: 'Shop',
      bank: 'Bank',
      freeCoins: 'Free Coins',
      special: 'Special',
      unlockNextMilestone: 'Unlock Next Milestone',
      lineSkins: 'Line Skins',
      coins: '{n} coins',
      orBeatLevel100: 'Or beat Level 100',
      equipped: 'Equipped',
      equip: 'Equip',
      buy: 'Buy',
      locked: 'Locked',
      iapPouch: 'Pouch',
      iapSack: 'Sack',
      iapChest: 'Chest',
      iapBarrel: 'Barrel',
      iapVault: 'Vault',
    },
    milestones: {
      firstSteps: { title: 'First Steps', subtitle: 'Keep going!' },
      risingStar: { title: 'Rising Star', subtitle: "You're getting good" },
      chainArtist: { title: 'Chain Artist', subtitle: 'Nice drawing skills' },
      gravityMaster: { title: 'Gravity Master', subtitle: 'Defying the pull' },
      warpNavigator: { title: 'Warp Navigator', subtitle: 'Portal expert' },
      stormChaser: { title: 'Storm Chaser', subtitle: 'EMP? No problem' },
      antiGravityAce: { title: 'Anti-Gravity Ace', subtitle: 'What goes up...' },
      laserDancer: { title: 'Laser Dancer', subtitle: "Don't touch the red" },
      meteorDodger: { title: 'Meteor Dodger', subtitle: 'Space survivor' },
      teslaTamer: { title: 'Tesla Tamer', subtitle: 'Electricity bows to you' },
      forceBender: { title: 'Force Bender', subtitle: 'Repulsors? Please.' },
      phaseWalker: { title: 'Phase Walker', subtitle: 'Between dimensions' },
      ironWill: { title: 'Iron Will', subtitle: "Magnetism can't stop you" },
      orbitBreaker: { title: 'Orbit Breaker', subtitle: 'Unstoppable force' },
      solarGuardian: { title: 'Solar Guardian', subtitle: 'Born from starfire' },
      timeBender: { title: 'Time Bender', subtitle: 'Slow-mo is your ally' },
      apexPredator: { title: 'Apex Predator', subtitle: 'Top of the chain' },
      voidWalker: { title: 'Void Walker', subtitle: 'Into the abyss' },
      livingLegend: { title: 'Living Legend', subtitle: 'Almost there...' },
    },
  },

  tr: {
    langName: 'Türkçe',
    startMenu: {
      tagline: '100 Seviye -- Çizgi çiz -- Şekerleri yönlendir!',
      best: 'En iyi: Seviye {n} tamamlandı',
      play: 'OYNA',
      startLevel: 'SEV {n} BAŞLAT',
      selectLevel: 'Seviye Seç',
      shop: 'Mağaza',
      privacyPolicy: 'Gizlilik Politikası',
    },
    hud: {
      hp: 'CAN',
      level: 'S{n}',
      target: 'Hedef',
      levelTarget: 'Seviye {level} -- Hedef: {target}',
    },
    levelComplete: {
      nice: 'SÜPER!',
      coinsEarned: '+{n} jeton kazanıldı',
      nextLevel: 'Sonraki Seviye',
      cosmicTitle: 'KOZMİK İMPARATOR',
      cosmicQuote: '"Evren güçlüye değil, kararlı olana boyun eğer. Sadece oyunu oynamadın. Kaosu ehlileştirdin."',
      cosmicSkinUnlocked: 'Kozmik İmparator Görünümü Açıldı',
      claimGlory: 'Zaferi Al',
    },
    gameOver: {
      oops: 'OPSS!',
      score: 'Puan: {score} / {target}',
      reviveAd: 'Canlan (Reklam İzle)',
      reviveCoins: 'Canlan ({n} Jeton)',
      giveUp: 'Pes Et',
    },
    shop: {
      title: 'Mağaza',
      bank: 'Banka',
      freeCoins: 'Ücretsiz Jeton',
      special: 'Özel',
      unlockNextMilestone: 'Sonraki Aşamayı Aç',
      lineSkins: 'Çizgi Görünümleri',
      coins: '{n} jeton',
      orBeatLevel100: 'Ya da Seviye 100\'ü geç',
      equipped: 'Takılı',
      equip: 'Tak',
      buy: 'Satın Al',
      locked: 'Kilitli',
      iapPouch: 'Kese',
      iapSack: 'Torba',
      iapChest: 'Sandık',
      iapBarrel: 'Fıçı',
      iapVault: 'Kasa',
    },
    milestones: {
      firstSteps: { title: 'İlk Adımlar', subtitle: 'Devam et!' },
      risingStar: { title: 'Yükselen Yıldız', subtitle: 'Gelişiyorsun' },
      chainArtist: { title: 'Zincir Sanatçısı', subtitle: 'Harika çizim becerileri' },
      gravityMaster: { title: 'Yerçekimi Ustası', subtitle: 'Çekime meydan okuyorsun' },
      warpNavigator: { title: 'Işınlanma Navigatörü', subtitle: 'Portal uzmanı' },
      stormChaser: { title: 'Fırtına Avcısı', subtitle: 'EMP mi? Sorun değil' },
      antiGravityAce: { title: 'Ters Yerçekimi Ası', subtitle: 'Yukarı çıkan...' },
      laserDancer: { title: 'Lazer Dansçısı', subtitle: 'Kırmızıya dokunma' },
      meteorDodger: { title: 'Meteor Kaçağı', subtitle: 'Uzay savaşçısı' },
      teslaTamer: { title: 'Tesla Ehlileştirici', subtitle: 'Elektrik sana boyun eğer' },
      forceBender: { title: 'Kuvvet Bükücü', subtitle: 'İticiler mi? Rica ederim.' },
      phaseWalker: { title: 'Faz Yürüyüşçüsü', subtitle: 'Boyutlar arasında' },
      ironWill: { title: 'Demir İrade', subtitle: 'Manyetizm seni durduramaz' },
      orbitBreaker: { title: 'Yörünge Kırıcı', subtitle: 'Durdurulamaz güç' },
      solarGuardian: { title: 'Güneş Muhafızı', subtitle: 'Yıldız ateşinden doğdu' },
      timeBender: { title: 'Zaman Bükücü', subtitle: 'Ağır çekim senin müttefikin' },
      apexPredator: { title: 'Zirve Avcısı', subtitle: 'Zincirin tepesi' },
      voidWalker: { title: 'Boşluk Yürüyüşçüsü', subtitle: 'Uçuruma doğru' },
      livingLegend: { title: 'Yaşayan Efsane', subtitle: 'Neredeyse tamamdır...' },
    },
  },

  es: {
    langName: 'Español',
    startMenu: {
      tagline: '100 Niveles -- Dibuja líneas -- ¡Guía los caramelos!',
      best: 'Mejor: Nivel {n} completado',
      play: 'JUGAR',
      startLevel: 'INICIAR NIV {n}',
      selectLevel: 'Seleccionar Nivel',
      shop: 'Tienda',
      privacyPolicy: 'Política de Privacidad',
    },
    hud: {
      hp: 'VP',
      level: 'N{n}',
      target: 'Meta',
      levelTarget: 'Nivel {level} -- Meta: {target}',
    },
    levelComplete: {
      nice: '¡GENIAL!',
      coinsEarned: '+{n} monedas ganadas',
      nextLevel: 'Siguiente Nivel',
      cosmicTitle: 'EMPERADOR CÓSMICO',
      cosmicQuote: '"El universo no cede ante los fuertes, cede ante los tenaces. No solo jugaste. Dominaste el caos."',
      cosmicSkinUnlocked: 'Skin Emperador Cósmico Desbloqueado',
      claimGlory: 'Reclamar Gloria',
    },
    gameOver: {
      oops: '¡VAYA!',
      score: 'Puntos: {score} / {target}',
      reviveAd: 'Revivir (Ver Anuncio)',
      reviveCoins: 'Revivir ({n} Monedas)',
      giveUp: 'Rendirse',
    },
    shop: {
      title: 'Tienda',
      bank: 'Banco',
      freeCoins: 'Monedas Gratis',
      special: 'Especial',
      unlockNextMilestone: 'Desbloquear Siguiente Hito',
      lineSkins: 'Skins de Línea',
      coins: '{n} monedas',
      orBeatLevel100: 'O supera el Nivel 100',
      equipped: 'Equipado',
      equip: 'Equipar',
      buy: 'Comprar',
      locked: 'Bloqueado',
      iapPouch: 'Bolsita',
      iapSack: 'Saco',
      iapChest: 'Cofre',
      iapBarrel: 'Barril',
      iapVault: 'Cámara',
    },
    milestones: {
      firstSteps: { title: 'Primeros Pasos', subtitle: '¡Sigue adelante!' },
      risingStar: { title: 'Estrella en Alza', subtitle: 'Estás mejorando' },
      chainArtist: { title: 'Artista de Cadenas', subtitle: 'Buen ojo para el dibujo' },
      gravityMaster: { title: 'Maestro de Gravedad', subtitle: 'Desafiando la atracción' },
      warpNavigator: { title: 'Navegador Warp', subtitle: 'Experto en portales' },
      stormChaser: { title: 'Cazador de Tormentas', subtitle: '¿EMP? Sin problema' },
      antiGravityAce: { title: 'As Antigravedad', subtitle: 'Lo que sube...' },
      laserDancer: { title: 'Bailarín Láser', subtitle: 'No toques el rojo' },
      meteorDodger: { title: 'Esquivador de Meteoros', subtitle: 'Sobreviviente espacial' },
      teslaTamer: { title: 'Domador Tesla', subtitle: 'La electricidad te obedece' },
      forceBender: { title: 'Doblador de Fuerzas', subtitle: '¿Repulsores? Por favor.' },
      phaseWalker: { title: 'Caminante de Fase', subtitle: 'Entre dimensiones' },
      ironWill: { title: 'Voluntad de Hierro', subtitle: 'El magnetismo no te detiene' },
      orbitBreaker: { title: 'Rompe Órbitas', subtitle: 'Fuerza imparable' },
      solarGuardian: { title: 'Guardián Solar', subtitle: 'Nacido del fuego estelar' },
      timeBender: { title: 'Dobla Tiempo', subtitle: 'La cámara lenta es tu aliada' },
      apexPredator: { title: 'Depredador Ápex', subtitle: 'En la cima de la cadena' },
      voidWalker: { title: 'Caminante del Vacío', subtitle: 'Al abismo' },
      livingLegend: { title: 'Leyenda Viva', subtitle: 'Casi allí...' },
    },
  },

  fr: {
    langName: 'Français',
    startMenu: {
      tagline: '100 Niveaux -- Dessinez des lignes -- Guidez les bonbons !',
      best: 'Meilleur : Niveau {n} complété',
      play: 'JOUER',
      startLevel: 'NIV {n} DÉMARRER',
      selectLevel: 'Choisir le Niveau',
      shop: 'Boutique',
      privacyPolicy: 'Politique de Confidentialité',
    },
    hud: {
      hp: 'PV',
      level: 'N{n}',
      target: 'Objectif',
      levelTarget: 'Niveau {level} -- Objectif : {target}',
    },
    levelComplete: {
      nice: 'SUPER !',
      coinsEarned: '+{n} pièces gagnées',
      nextLevel: 'Niveau Suivant',
      cosmicTitle: 'EMPEREUR COSMIQUE',
      cosmicQuote: '"L\'univers ne cède pas aux forts, il cède aux implacables. Tu n\'as pas seulement joué. Tu as maîtrisé le chaos."',
      cosmicSkinUnlocked: 'Skin Empereur Cosmique Débloqué',
      claimGlory: 'Réclamer la Gloire',
    },
    gameOver: {
      oops: 'OUPS !',
      score: 'Score : {score} / {target}',
      reviveAd: 'Revivre (Voir une Pub)',
      reviveCoins: 'Revivre ({n} Pièces)',
      giveUp: 'Abandonner',
    },
    shop: {
      title: 'Boutique',
      bank: 'Banque',
      freeCoins: 'Pièces Gratuites',
      special: 'Spécial',
      unlockNextMilestone: 'Débloquer le Prochain Palier',
      lineSkins: 'Skins de Ligne',
      coins: '{n} pièces',
      orBeatLevel100: 'Ou passez le Niveau 100',
      equipped: 'Équipé',
      equip: 'Équiper',
      buy: 'Acheter',
      locked: 'Verrouillé',
      iapPouch: 'Pochette',
      iapSack: 'Sac',
      iapChest: 'Coffre',
      iapBarrel: 'Tonneau',
      iapVault: 'Coffre-fort',
    },
    milestones: {
      firstSteps: { title: 'Premiers Pas', subtitle: 'Continue !' },
      risingStar: { title: 'Étoile Montante', subtitle: 'Tu progresses bien' },
      chainArtist: { title: 'Artiste de Lignes', subtitle: 'Beau talent de dessin' },
      gravityMaster: { title: 'Maître de la Gravité', subtitle: 'Défier l\'attraction' },
      warpNavigator: { title: 'Navigateur Warp', subtitle: 'Expert des portails' },
      stormChaser: { title: 'Chasseur de Tempête', subtitle: 'EMP ? Pas de souci' },
      antiGravityAce: { title: 'As Antigravité', subtitle: 'Ce qui monte...' },
      laserDancer: { title: 'Danseur Laser', subtitle: 'Ne touche pas le rouge' },
      meteorDodger: { title: 'Esquiveur de Météores', subtitle: 'Survivant de l\'espace' },
      teslaTamer: { title: 'Dompteur Tesla', subtitle: 'L\'électricité t\'obéit' },
      forceBender: { title: 'Courbeur de Force', subtitle: 'Répulseurs ? S\'il vous plaît.' },
      phaseWalker: { title: 'Marcheur de Phase', subtitle: 'Entre les dimensions' },
      ironWill: { title: 'Volonté de Fer', subtitle: 'Le magnétisme ne t\'arrête pas' },
      orbitBreaker: { title: 'Briseur d\'Orbite', subtitle: 'Force irrésistible' },
      solarGuardian: { title: 'Gardien Solaire', subtitle: 'Né du feu stellaire' },
      timeBender: { title: 'Courbeur du Temps', subtitle: 'Le ralenti est ton allié' },
      apexPredator: { title: 'Prédateur Apex', subtitle: 'Au sommet de la chaîne' },
      voidWalker: { title: 'Marcheur du Vide', subtitle: 'Vers l\'abîme' },
      livingLegend: { title: 'Légende Vivante', subtitle: 'Presque là...' },
    },
  },

  de: {
    langName: 'Deutsch',
    startMenu: {
      tagline: '100 Level -- Linien zeichnen -- Bonbons führen!',
      best: 'Bestleistung: Level {n} abgeschlossen',
      play: 'SPIELEN',
      startLevel: 'LEVEL {n} STARTEN',
      selectLevel: 'Level Auswählen',
      shop: 'Shop',
      privacyPolicy: 'Datenschutzrichtlinie',
    },
    hud: {
      hp: 'LP',
      level: 'L{n}',
      target: 'Ziel',
      levelTarget: 'Level {level} -- Ziel: {target}',
    },
    levelComplete: {
      nice: 'SUPER!',
      coinsEarned: '+{n} Münzen verdient',
      nextLevel: 'Nächstes Level',
      cosmicTitle: 'KOSMISCHER KAISER',
      cosmicQuote: '"Das Universum weicht nicht den Starken – es weicht den Unerbittlichen. Du hast nicht nur gespielt. Du hast das Chaos gemeistert."',
      cosmicSkinUnlocked: 'Kosmischer Kaiser Skin freigeschaltet',
      claimGlory: 'Ruhm beanspruchen',
    },
    gameOver: {
      oops: 'MIST!',
      score: 'Punkte: {score} / {target}',
      reviveAd: 'Wiederbeleben (Werbung schauen)',
      reviveCoins: 'Wiederbeleben ({n} Münzen)',
      giveUp: 'Aufgeben',
    },
    shop: {
      title: 'Shop',
      bank: 'Bank',
      freeCoins: 'Gratis-Münzen',
      special: 'Spezial',
      unlockNextMilestone: 'Nächsten Meilenstein freischalten',
      lineSkins: 'Linien-Skins',
      coins: '{n} Münzen',
      orBeatLevel100: 'Oder Level 100 bestehen',
      equipped: 'Ausgerüstet',
      equip: 'Ausrüsten',
      buy: 'Kaufen',
      locked: 'Gesperrt',
      iapPouch: 'Beutel',
      iapSack: 'Sack',
      iapChest: 'Truhe',
      iapBarrel: 'Fass',
      iapVault: 'Tresor',
    },
    milestones: {
      firstSteps: { title: 'Erste Schritte', subtitle: 'Weiter so!' },
      risingStar: { title: 'Aufgehender Stern', subtitle: 'Du wirst besser' },
      chainArtist: { title: 'Kettenzeichner', subtitle: 'Gute Zeichnungskünste' },
      gravityMaster: { title: 'Schwerkraft-Meister', subtitle: 'Trotze der Schwerkraft' },
      warpNavigator: { title: 'Warp-Navigator', subtitle: 'Portal-Experte' },
      stormChaser: { title: 'Sturmjäger', subtitle: 'EMP? Kein Problem' },
      antiGravityAce: { title: 'Antigravitations-Ass', subtitle: 'Was hoch geht...' },
      laserDancer: { title: 'Laser-Tänzer', subtitle: 'Nicht rot berühren' },
      meteorDodger: { title: 'Meteor-Ausweicher', subtitle: 'Weltraum-Überlebender' },
      teslaTamer: { title: 'Tesla-Bändiger', subtitle: 'Strom gehorcht dir' },
      forceBender: { title: 'Kraftbieger', subtitle: 'Repulsoren? Bitte.' },
      phaseWalker: { title: 'Phasenläufer', subtitle: 'Zwischen den Dimensionen' },
      ironWill: { title: 'Eiserner Wille', subtitle: 'Magnetismus hält dich nicht auf' },
      orbitBreaker: { title: 'Orbitzerstörer', subtitle: 'Unaufhaltbare Kraft' },
      solarGuardian: { title: 'Sonnenwächter', subtitle: 'Aus Sternfeuer geboren' },
      timeBender: { title: 'Zeitbieger', subtitle: 'Zeitlupe ist dein Verbündeter' },
      apexPredator: { title: 'Apex-Raubtier', subtitle: 'Spitze der Nahrungskette' },
      voidWalker: { title: 'Leere-Wanderer', subtitle: 'In den Abgrund' },
      livingLegend: { title: 'Lebende Legende', subtitle: 'Fast da...' },
    },
  },

  it: {
    langName: 'Italiano',
    startMenu: {
      tagline: '100 Livelli -- Disegna linee -- Guida le caramelle!',
      best: 'Migliore: Livello {n} completato',
      play: 'GIOCA',
      startLevel: 'AVVIA LIV {n}',
      selectLevel: 'Seleziona Livello',
      shop: 'Negozio',
      privacyPolicy: 'Informativa sulla Privacy',
    },
    hud: {
      hp: 'PV',
      level: 'L{n}',
      target: 'Obiettivo',
      levelTarget: 'Livello {level} -- Obiettivo: {target}',
    },
    levelComplete: {
      nice: 'BRAVISSIMO!',
      coinsEarned: '+{n} monete guadagnate',
      nextLevel: 'Livello Successivo',
      cosmicTitle: 'IMPERATORE COSMICO',
      cosmicQuote: '"L\'universo non cede ai forti, cede agli inesorabili. Non hai solo giocato. Hai dominato il caos."',
      cosmicSkinUnlocked: 'Skin Imperatore Cosmico Sbloccato',
      claimGlory: 'Reclama la Gloria',
    },
    gameOver: {
      oops: 'OPS!',
      score: 'Punti: {score} / {target}',
      reviveAd: 'Rivivi (Guarda Pub)',
      reviveCoins: 'Rivivi ({n} Monete)',
      giveUp: 'Arrendersi',
    },
    shop: {
      title: 'Negozio',
      bank: 'Banca',
      freeCoins: 'Monete Gratis',
      special: 'Speciale',
      unlockNextMilestone: 'Sblocca Prossimo Traguardo',
      lineSkins: 'Skin Linea',
      coins: '{n} monete',
      orBeatLevel100: 'O supera il Livello 100',
      equipped: 'Equipaggiato',
      equip: 'Equipaggia',
      buy: 'Acquista',
      locked: 'Bloccato',
      iapPouch: 'Borsetta',
      iapSack: 'Sacco',
      iapChest: 'Forziere',
      iapBarrel: 'Barile',
      iapVault: 'Cassaforte',
    },
    milestones: {
      firstSteps: { title: 'Primi Passi', subtitle: 'Continua!' },
      risingStar: { title: 'Stella Nascente', subtitle: 'Stai migliorando' },
      chainArtist: { title: 'Artista delle Catene', subtitle: 'Belle abilità di disegno' },
      gravityMaster: { title: 'Maestro della Gravità', subtitle: 'Sfidando la forza' },
      warpNavigator: { title: 'Navigatore Warp', subtitle: 'Esperto di portali' },
      stormChaser: { title: 'Cacciatore di Tempeste', subtitle: 'EMP? Nessun problema' },
      antiGravityAce: { title: 'Asso Antigravità', subtitle: 'Quello che sale...' },
      laserDancer: { title: 'Ballerino Laser', subtitle: 'Non toccare il rosso' },
      meteorDodger: { title: 'Schiva Meteore', subtitle: 'Sopravvissuto spaziale' },
      teslaTamer: { title: 'Addestratore Tesla', subtitle: "L'elettricità ti obbedisce" },
      forceBender: { title: 'Distortore di Forze', subtitle: 'Repulsori? Prego.' },
      phaseWalker: { title: 'Camminatore di Fase', subtitle: 'Tra le dimensioni' },
      ironWill: { title: 'Volontà di Ferro', subtitle: 'Il magnetismo non ti ferma' },
      orbitBreaker: { title: 'Spezza Orbite', subtitle: 'Forza inarrestabile' },
      solarGuardian: { title: 'Guardiano Solare', subtitle: 'Nato dal fuoco stellare' },
      timeBender: { title: 'Piegatore del Tempo', subtitle: 'Il rallentatore è tuo alleato' },
      apexPredator: { title: 'Predatore Apice', subtitle: 'In cima alla catena' },
      voidWalker: { title: 'Camminatore del Vuoto', subtitle: "Nell'abisso" },
      livingLegend: { title: 'Leggenda Vivente', subtitle: 'Quasi lì...' },
    },
  },

  pt: {
    langName: 'Português',
    startMenu: {
      tagline: '100 Níveis -- Desenhe linhas -- Guie os doces!',
      best: 'Melhor: Nível {n} concluído',
      play: 'JOGAR',
      startLevel: 'INICIAR NÍV {n}',
      selectLevel: 'Selecionar Nível',
      shop: 'Loja',
      privacyPolicy: 'Política de Privacidade',
    },
    hud: {
      hp: 'PV',
      level: 'N{n}',
      target: 'Meta',
      levelTarget: 'Nível {level} -- Meta: {target}',
    },
    levelComplete: {
      nice: 'ÓTIMO!',
      coinsEarned: '+{n} moedas ganhas',
      nextLevel: 'Próximo Nível',
      cosmicTitle: 'IMPERADOR CÓSMICO',
      cosmicQuote: '"O universo não cede aos fortes — cede aos implacáveis. Você não apenas jogou. Você dominou o caos."',
      cosmicSkinUnlocked: 'Skin Imperador Cósmico Desbloqueado',
      claimGlory: 'Reivindicar Glória',
    },
    gameOver: {
      oops: 'OPS!',
      score: 'Pontos: {score} / {target}',
      reviveAd: 'Reviver (Ver Anúncio)',
      reviveCoins: 'Reviver ({n} Moedas)',
      giveUp: 'Desistir',
    },
    shop: {
      title: 'Loja',
      bank: 'Banco',
      freeCoins: 'Moedas Grátis',
      special: 'Especial',
      unlockNextMilestone: 'Desbloquear Próxima Meta',
      lineSkins: 'Skins de Linha',
      coins: '{n} moedas',
      orBeatLevel100: 'Ou passe o Nível 100',
      equipped: 'Equipado',
      equip: 'Equipar',
      buy: 'Comprar',
      locked: 'Bloqueado',
      iapPouch: 'Bolsinha',
      iapSack: 'Saco',
      iapChest: 'Baú',
      iapBarrel: 'Barril',
      iapVault: 'Cofre',
    },
    milestones: {
      firstSteps: { title: 'Primeiros Passos', subtitle: 'Continue!' },
      risingStar: { title: 'Estrela em Ascensão', subtitle: 'Você está melhorando' },
      chainArtist: { title: 'Artista das Correntes', subtitle: 'Boas habilidades de desenho' },
      gravityMaster: { title: 'Mestre da Gravidade', subtitle: 'Desafiando a atração' },
      warpNavigator: { title: 'Navegador Warp', subtitle: 'Especialista em portais' },
      stormChaser: { title: 'Caçador de Tempestades', subtitle: 'EMP? Sem problema' },
      antiGravityAce: { title: 'Ás Antigravidade', subtitle: 'O que sobe...' },
      laserDancer: { title: 'Dançarino Laser', subtitle: 'Não toque no vermelho' },
      meteorDodger: { title: 'Esquivador de Meteoros', subtitle: 'Sobrevivente espacial' },
      teslaTamer: { title: 'Domador Tesla', subtitle: 'A eletricidade obedece a você' },
      forceBender: { title: 'Dobrador de Forças', subtitle: 'Repulsores? Por favor.' },
      phaseWalker: { title: 'Andador de Fase', subtitle: 'Entre dimensões' },
      ironWill: { title: 'Vontade de Ferro', subtitle: 'O magnetismo não te para' },
      orbitBreaker: { title: 'Quebra-Órbita', subtitle: 'Força imparável' },
      solarGuardian: { title: 'Guardião Solar', subtitle: 'Nascido do fogo estelar' },
      timeBender: { title: 'Dobrador do Tempo', subtitle: 'O câmera lenta é seu aliado' },
      apexPredator: { title: 'Predador Ápice', subtitle: 'No topo da cadeia' },
      voidWalker: { title: 'Andador do Vazio', subtitle: 'Ao abismo' },
      livingLegend: { title: 'Lenda Viva', subtitle: 'Quase lá...' },
    },
  },

  ru: {
    langName: 'Русский',
    startMenu: {
      tagline: '100 уровней -- Рисуй линии -- Направляй конфеты!',
      best: 'Рекорд: уровень {n} пройден',
      play: 'ИГРАТЬ',
      startLevel: 'СТАРТ УР {n}',
      selectLevel: 'Выбрать Уровень',
      shop: 'Магазин',
      privacyPolicy: 'Политика Конфиденциальности',
    },
    hud: {
      hp: 'ХП',
      level: 'У{n}',
      target: 'Цель',
      levelTarget: 'Уровень {level} -- Цель: {target}',
    },
    levelComplete: {
      nice: 'ОТЛИЧНО!',
      coinsEarned: '+{n} монет получено',
      nextLevel: 'Следующий Уровень',
      cosmicTitle: 'КОСМИЧЕСКИЙ ИМПЕРАТОР',
      cosmicQuote: '"Вселенная не покоряется сильным — она покоряется неукротимым. Ты не просто сыграл. Ты покорил хаос."',
      cosmicSkinUnlocked: 'Скин Космического Императора Разблокирован',
      claimGlory: 'Принять Славу',
    },
    gameOver: {
      oops: 'УПС!',
      score: 'Счёт: {score} / {target}',
      reviveAd: 'Возродиться (Смотреть Рекламу)',
      reviveCoins: 'Возродиться ({n} монет)',
      giveUp: 'Сдаться',
    },
    shop: {
      title: 'Магазин',
      bank: 'Банк',
      freeCoins: 'Бесплатные Монеты',
      special: 'Особое',
      unlockNextMilestone: 'Разблокировать Следующий Этап',
      lineSkins: 'Скины Линий',
      coins: '{n} монет',
      orBeatLevel100: 'Или пройди уровень 100',
      equipped: 'Надето',
      equip: 'Надеть',
      buy: 'Купить',
      locked: 'Заблокировано',
      iapPouch: 'Кошелёк',
      iapSack: 'Мешок',
      iapChest: 'Сундук',
      iapBarrel: 'Бочка',
      iapVault: 'Сейф',
    },
    milestones: {
      firstSteps: { title: 'Первые Шаги', subtitle: 'Продолжай!' },
      risingStar: { title: 'Восходящая Звезда', subtitle: 'Ты становишься лучше' },
      chainArtist: { title: 'Художник Цепей', subtitle: 'Хорошие навыки рисования' },
      gravityMaster: { title: 'Мастер Гравитации', subtitle: 'Бросая вызов притяжению' },
      warpNavigator: { title: 'Навигатор Варп', subtitle: 'Эксперт по порталам' },
      stormChaser: { title: 'Охотник за Бурями', subtitle: 'ЭМИ? Не проблема' },
      antiGravityAce: { title: 'Ас Антигравитации', subtitle: 'Что поднимается...' },
      laserDancer: { title: 'Лазерный Танцор', subtitle: 'Не касайся красного' },
      meteorDodger: { title: 'Уклонист от Метеоров', subtitle: 'Выживший в космосе' },
      teslaTamer: { title: 'Укротитель Тесла', subtitle: 'Электричество подчиняется тебе' },
      forceBender: { title: 'Изгибатель Сил', subtitle: 'Отталкиватели? Пожалуйста.' },
      phaseWalker: { title: 'Фазовый Ходок', subtitle: 'Между измерениями' },
      ironWill: { title: 'Железная Воля', subtitle: 'Магнетизм не остановит тебя' },
      orbitBreaker: { title: 'Разрушитель Орбит', subtitle: 'Неудержимая сила' },
      solarGuardian: { title: 'Солнечный Страж', subtitle: 'Рождённый из звёздного огня' },
      timeBender: { title: 'Изгибатель Времени', subtitle: 'Замедление — твой союзник' },
      apexPredator: { title: 'Вершинный Хищник', subtitle: 'На вершине цепи' },
      voidWalker: { title: 'Странник Пустоты', subtitle: 'В бездну' },
      livingLegend: { title: 'Живая Легенда', subtitle: 'Почти там...' },
    },
  },

  ja: {
    langName: '日本語',
    startMenu: {
      tagline: '100ステージ -- 線を引く -- キャンディを導け！',
      best: 'ベスト：レベル {n} クリア',
      play: 'プレイ',
      startLevel: 'Lv{n} スタート',
      selectLevel: 'レベル選択',
      shop: 'ショップ',
      privacyPolicy: 'プライバシーポリシー',
    },
    hud: {
      hp: 'HP',
      level: 'L{n}',
      target: '目標',
      levelTarget: 'レベル {level} -- 目標: {target}',
    },
    levelComplete: {
      nice: 'すごい！',
      coinsEarned: '+{n} コイン獲得',
      nextLevel: '次のレベル',
      cosmicTitle: 'コズミックエンペラー',
      cosmicQuote: '「宇宙は強者ではなく、不屈の者に従う。ゲームをプレイしただけでなく、混沌そのものを制した。」',
      cosmicSkinUnlocked: 'コズミックエンペラースキン解放',
      claimGlory: '栄光を掴め',
    },
    gameOver: {
      oops: 'やり直し！',
      score: 'スコア: {score} / {target}',
      reviveAd: '復活（広告を見る）',
      reviveCoins: '復活（{n} コイン）',
      giveUp: '諦める',
    },
    shop: {
      title: 'ショップ',
      bank: 'バンク',
      freeCoins: '無料コイン',
      special: 'スペシャル',
      unlockNextMilestone: '次のマイルストーンを解放',
      lineSkins: 'ラインスキン',
      coins: '{n} コイン',
      orBeatLevel100: 'またはレベル100をクリア',
      equipped: '装備中',
      equip: '装備',
      buy: '購入',
      locked: 'ロック中',
      iapPouch: 'ポーチ',
      iapSack: '袋',
      iapChest: '宝箱',
      iapBarrel: '樽',
      iapVault: '金庫',
    },
    milestones: {
      firstSteps: { title: '最初の一歩', subtitle: '続けよう！' },
      risingStar: { title: '新星', subtitle: '上達してきた' },
      chainArtist: { title: 'チェーンアーティスト', subtitle: '描画スキルが光る' },
      gravityMaster: { title: '重力マスター', subtitle: '引力に挑む' },
      warpNavigator: { title: 'ワープナビゲーター', subtitle: 'ポータルの達人' },
      stormChaser: { title: 'ストームチェイサー', subtitle: 'EMP？問題なし' },
      antiGravityAce: { title: '反重力エース', subtitle: '上がるものは...' },
      laserDancer: { title: 'レーザーダンサー', subtitle: '赤に触れるな' },
      meteorDodger: { title: '流星よけ', subtitle: '宇宙の生存者' },
      teslaTamer: { title: 'テスラテイマー', subtitle: '電気が従う' },
      forceBender: { title: 'フォースベンダー', subtitle: 'リパルサー？お安いご用' },
      phaseWalker: { title: 'フェーズウォーカー', subtitle: '次元の狭間で' },
      ironWill: { title: '鉄の意志', subtitle: '磁力も止められない' },
      orbitBreaker: { title: 'オービットブレイカー', subtitle: '止まらない力' },
      solarGuardian: { title: 'ソーラーガーディアン', subtitle: '星の炎から生まれた' },
      timeBender: { title: 'タイムベンダー', subtitle: 'スローモーが味方' },
      apexPredator: { title: '頂点の捕食者', subtitle: '食物連鎖の頂点' },
      voidWalker: { title: 'ヴォイドウォーカー', subtitle: '深淵へ' },
      livingLegend: { title: '生ける伝説', subtitle: 'もう少しだ...' },
    },
  },

  zh: {
    langName: '中文',
    startMenu: {
      tagline: '100关卡 -- 画线条 -- 引导糖果！',
      best: '最佳：第 {n} 关通过',
      play: '开始游戏',
      startLevel: '开始第 {n} 关',
      selectLevel: '选择关卡',
      shop: '商店',
      privacyPolicy: '隐私政策',
    },
    hud: {
      hp: '血量',
      level: 'L{n}',
      target: '目标',
      levelTarget: '第 {level} 关 -- 目标: {target}',
    },
    levelComplete: {
      nice: '太棒了！',
      coinsEarned: '+{n} 金币已获得',
      nextLevel: '下一关',
      cosmicTitle: '宇宙皇帝',
      cosmicQuote: '"宇宙不向强者低头——它向不屈者低头。你不只是玩了游戏，你征服了混沌本身。"',
      cosmicSkinUnlocked: '宇宙皇帝皮肤已解锁',
      claimGlory: '领取荣耀',
    },
    gameOver: {
      oops: '哎呀！',
      score: '得分：{score} / {target}',
      reviveAd: '复活（观看广告）',
      reviveCoins: '复活（{n} 金币）',
      giveUp: '放弃',
    },
    shop: {
      title: '商店',
      bank: '金库',
      freeCoins: '免费金币',
      special: '特别',
      unlockNextMilestone: '解锁下一里程碑',
      lineSkins: '线条皮肤',
      coins: '{n} 金币',
      orBeatLevel100: '或通过第100关',
      equipped: '已装备',
      equip: '装备',
      buy: '购买',
      locked: '已锁定',
      iapPouch: '小袋',
      iapSack: '布袋',
      iapChest: '宝箱',
      iapBarrel: '木桶',
      iapVault: '保险柜',
    },
    milestones: {
      firstSteps: { title: '第一步', subtitle: '继续加油！' },
      risingStar: { title: '冉冉新星', subtitle: '你越来越厉害了' },
      chainArtist: { title: '链条艺术家', subtitle: '精湛的绘画技巧' },
      gravityMaster: { title: '重力大师', subtitle: '挑战引力' },
      warpNavigator: { title: '翘曲导航者', subtitle: '传送门专家' },
      stormChaser: { title: '风暴追逐者', subtitle: '电磁脉冲？没问题' },
      antiGravityAce: { title: '反重力王牌', subtitle: '飞上天的...' },
      laserDancer: { title: '激光舞者', subtitle: '别碰红色' },
      meteorDodger: { title: '陨石躲避者', subtitle: '太空幸存者' },
      teslaTamer: { title: '特斯拉驯服者', subtitle: '电力听从你的指挥' },
      forceBender: { title: '力场扭曲者', subtitle: '斥力场？小意思。' },
      phaseWalker: { title: '相位行者', subtitle: '穿梭维度之间' },
      ironWill: { title: '铁的意志', subtitle: '磁力无法阻挡你' },
      orbitBreaker: { title: '轨道破坏者', subtitle: '无法阻挡的力量' },
      solarGuardian: { title: '太阳守护者', subtitle: '生于星火之中' },
      timeBender: { title: '时间扭曲者', subtitle: '慢镜头是你的盟友' },
      apexPredator: { title: '顶级猎食者', subtitle: '站在食物链顶端' },
      voidWalker: { title: '虚空行者', subtitle: '走向深渊' },
      livingLegend: { title: '活着的传说', subtitle: '快到了...' },
    },
  },
};

export const LANG_STORAGE_KEY = 'candyflow_lang';

export function loadLang(): LangCode {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored && stored in TRANSLATIONS) return stored as LangCode;
  return 'en';
}

export function saveLang(lang: LangCode) {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}

export function t(translations: Translations): Translations {
  return translations;
}
