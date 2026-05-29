/* ==========================================================================
   GAME CONFIGURATION & DICTIONARIES
   ========================================================================== */
const WORD_DICT_FR = {
    "Animaux": ["LION", "TIGRE", "CHIEN", "CHAT", "ELEPHANT", "GIRAFE", "SINGE", "DAUPHIN", "REQUIN", "OISEAU", "SERPENT", "TORTUE", "LAPIN", "RENARD", "CHEVAL", "VACHE", "MOUTON", "PANDA", "OURS", "HIBOU"],
    "Pays & Villes": ["FRANCE", "CANADA", "BRESIL", "JAPON", "ITALIE", "ESPAGNE", "MAROC", "EGYPTE", "CHINE", "INDE", "SUISSE", "BELGIQUE", "SENEGAL", "MEXIQUE", "RUSSIE", "PARIS", "LONDRES", "TOKYO", "ROME"],
    "Nourriture": ["PIZZA", "PASTA", "CREPE", "POMME", "BANANE", "CHOCOLAT", "FROMAGE", "SALADE", "SOUPE", "GATEAU", "FRITES", "ORANGE", "PAIN", "BURGER", "CAFE", "POULET", "RIZ", "SUSHI", "BISCUIT"],
    "Métiers": ["DOCTEUR", "AVOCAT", "PILOTE", "POMPIER", "POLICIER", "BOULANGER", "MAITRE", "ARTISTE", "ACTEUR", "DENTISTE", "JUGE", "COIFFEUR", "CHEF", "CHANTEUR", "ECRIVAIN", "PILOTE", "MEDECIN"],
    "Technologie": ["INTERNET", "ORDINATEUR", "MOBILE", "ECRAN", "CLAVIER", "SOURIS", "ROBOT", "CODE", "RESEAU", "DONNEES", "CLOUD", "SITE", "APPLICATION", "LOGICIEL", "CONSOLE", "PIXEL", "FICHIER"],
    "Nature & Espace": ["FORET", "FLEUVE", "MONTAGNE", "DESERT", "PLANETE", "SOLEIL", "ETOILE", "NUAGE", "PLUIE", "FLEUR", "ARBRE", "OCEAN", "VOLCAN", "ECLAIR", "RIVIERE", "TERRE", "LUNE", "GALAXIE"]
};

const WORD_DICT_EN = {
    "Animals": ["LION", "TIGER", "DOG", "CAT", "ELEPHANT", "GIRAFFE", "MONKEY", "DOLPHIN", "SHARK", "BIRD", "SNAKE", "TURTLE", "RABBIT", "FOX", "HORSE", "COW", "SHEEP", "PANDA", "BEAR", "OWL"],
    "Countries & Cities": ["FRANCE", "CANADA", "BRAZIL", "JAPAN", "ITALY", "SPAIN", "MOROCCO", "EGYPT", "CHINA", "INDIA", "SWITZERLAND", "BELGIUM", "SENEGAL", "MEXICO", "RUSSIA", "PARIS", "LONDON", "TOKYO", "ROME"],
    "Food": ["PIZZA", "PASTA", "COOKIE", "APPLE", "BANANA", "CHOCOLATE", "CHEESE", "SALAD", "SOUP", "CAKE", "FRIES", "ORANGE", "BREAD", "BURGER", "COFFEE", "CHICKEN", "RICE", "SUSHI", "BISCUIT"],
    "Jobs": ["DOCTOR", "LAWYER", "PILOT", "FIREMAN", "POLICE", "BAKER", "TEACHER", "ARTISTE", "ACTOR", "DENTIST", "JUDGE", "HAIRDRESSER", "CHEF", "SINGER", "WRITER", "PHYSICIAN"],
    "Technology": ["INTERNET", "COMPUTER", "MOBILE", "SCREEN", "KEYBOARD", "MOUSE", "ROBOT", "CODE", "NETWORK", "DATA", "CLOUD", "WEBSITE", "APPLICATION", "SOFTWARE", "CONSOLE", "PIXEL", "FILE"],
    "Nature & Space": ["FOREST", "RIVER", "MOUNTAIN", "DESERT", "PLANET", "SUN", "STAR", "CLOUD", "RAIN", "FLOWER", "TREE", "OCEAN", "VOLCANO", "LIGHTNING", "STREAM", "EARTH", "MOON", "GALAXY"]
};

// 5 Difficulty levels configuration (UPDATED TO LARGER GRIDS: 8x8 to 16x16)
const DIFFICULTY_LEVELS = [
    {
        name: "Très Facile",
        size: 8,
        wordCount: 6,
        directions: [[0, 1], [1, 0]], // Right, Down
        badgeClass: "badge-tf"
    },
    {
        name: "Facile",
        size: 10,
        wordCount: 8,
        directions: [[0, 1], [1, 0]], // Right, Down
        badgeClass: "badge-f"
    },
    {
        name: "Moyen",
        size: 12,
        wordCount: 9,
        directions: [[0, 1], [1, 0], [1, 1], [-1, 1]], // Right, Down, Diagonal Down-Right, Diagonal Up-Right
        badgeClass: "badge-m"
    },
    {
        name: "Difficile",
        size: 14,
        wordCount: 11,
        directions: [
            [0, 1], [1, 0], [1, 1], [-1, 1], // Forward: R, D, DR, UR
            [0, -1], [-1, 0], [-1, -1], [1, -1] // Backward: L, U, UL, DL
        ],
        badgeClass: "badge-d"
    },
    {
        name: "Expert",
        size: 16,
        wordCount: 13,
        directions: [
            [0, 1], [1, 0], [1, 1], [-1, 1],
            [0, -1], [-1, 0], [-1, -1], [1, -1]
        ],
        timer: 240, // 4 minutes limit for 16x16 grid
        badgeClass: "badge-e"
    }
];

// French letter frequencies for realistic grid fill
const FILL_LETTERS = "EEEEEEAAAAAIIIIIOOOOOSSSSSTTTTTNNNNNRRRRRUUUUULLLLDDDDGGGMMPPCCBBVVFQHQXJWYZ";

/* ==========================================================================
   GAME STATE VARIABLES
   ========================================================================== */
let currentLanguage = "fr";
let currentCategory = "Animaux";
let currentDiffIndex = 2; // Default to Medium
let currentLevel = {
    grid: [],
    words: [], // { text: "WORD", found: false, cells: [{r, c}, ...] }
    size: 12,
    directions: []
};

// Selection State
let isSelecting = false;
let selectStartCell = null;
let selectCurrentCell = null;
let selectedCells = []; // Array of {r, c}

// User Profile Stats
let userStats = {
    wins: 0,
    score: 0
};

// UI Sound settings
let soundEnabled = true;
let vibrationEnabled = true;

// Active Timer
let timerInterval = null;
let timeLeft = 0;
let timeSpent = 0;

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    setupEventListeners();
    populateCategoryScreen();
    checkAndroidAdMobStatus();
});

// Dictionary helper
function getActiveDict() {
    return currentLanguage === "fr" ? WORD_DICT_FR : WORD_DICT_EN;
}

// Load persistent stats
function loadUserProfile() {
    const savedWins = localStorage.getItem("mm_wins");
    const savedScore = localStorage.getItem("mm_score");
    if (savedWins !== null) userStats.wins = parseInt(savedWins);
    if (savedScore !== null) userStats.score = parseInt(savedScore);
    
    document.getElementById("stat-wins").innerText = userStats.wins;
    document.getElementById("stat-score").innerText = userStats.score;

    // Load active language
    const savedLang = localStorage.getItem("mm_lang");
    if (savedLang !== null) {
        currentLanguage = savedLang;
    } else {
        currentLanguage = "fr";
    }

    const dict = getActiveDict();
    currentCategory = Object.keys(dict)[0]; // Set default category matching dictionary language

    const langSelect = document.getElementById("select-lang");
    if (langSelect) langSelect.value = currentLanguage;

    updateUILanguage();
}

function saveUserProfile() {
    localStorage.setItem("mm_wins", userStats.wins);
    localStorage.setItem("mm_score", userStats.score);
    document.getElementById("stat-wins").innerText = userStats.wins;
    document.getElementById("stat-score").innerText = userStats.score;
}

function checkAndroidAdMobStatus() {
    const statusText = document.getElementById("admob-status");
    if (window.AndroidInterface) {
        statusText.innerText = "Active (AdMob Native)";
        statusText.style.background = "rgba(52, 211, 153, 0.15)";
        statusText.style.color = "#34d399";
        statusText.style.borderColor = "rgba(52, 211, 153, 0.3)";
    } else {
        statusText.innerText = "Mode Test Simulateur";
    }
}

/* ==========================================================================
   NAVIGATION & TRANSLATIONS
   ========================================================================== */
function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add("active");
    }
}

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem("mm_lang", lang);
    
    const dict = getActiveDict();
    // Default to the first category of the new active language dictionary
    currentCategory = Object.keys(dict)[0];
    
    updateUILanguage();
    populateCategoryScreen();
    
    showToast(lang === "fr" ? "Dictionnaire Français activé" : "English dictionary enabled");
}

function updateUILanguage() {
    const isFR = currentLanguage === "fr";
    
    // Titles & Subtitles
    document.querySelector(".logo-container h1").innerText = isFR ? "MOTS MÊLÉS" : "WORD SEARCH";
    document.querySelector(".logo-container p.subtitle").innerText = isFR ? "Edition Premium" : "Premium Edition";
    
    // Menu buttons
    document.getElementById("btn-play-quick").innerText = isFR ? "Jouer Immédiatement" : "Quick Play";
    document.getElementById("btn-select-category").innerText = isFR ? "Choisir une Catégorie" : "Select Category";
    document.getElementById("btn-settings-toggle").innerText = isFR ? "⚙️ Options" : "⚙️ Settings";
    
    // Quick stats labels
    document.querySelectorAll(".stat-label")[0].innerText = isFR ? "Victoires" : "Wins";
    document.querySelectorAll(".stat-label")[1].innerText = isFR ? "Score" : "Score";
    
    // Screen Headers
    document.querySelector("#screen-categories h2").innerText = isFR ? "Catégories" : "Categories";
    document.querySelector("#screen-difficulty h2").innerText = isFR ? "Difficulté" : "Difficulty";
    document.querySelector("#screen-settings h2").innerText = isFR ? "Options & Réglages" : "Settings & Options";
    
    // Difficulty labels inside difficulty selection
    const diffCards = document.querySelectorAll(".diff-card");
    const diffTexts = [
        {
            name: isFR ? "Très Facile" : "Very Easy",
            sub: isFR ? "Grille 8x8 • Mots courts • Horizontal/Vertical" : "8x8 Grid • Short words • Horizontal/Vertical",
            badge: isFR ? "Débutant" : "Beginner"
        },
        {
            name: isFR ? "Facile" : "Easy",
            sub: isFR ? "Grille 10x10 • Plus de mots • Alignements classiques" : "10x10 Grid • More words • Classical alignments",
            badge: isFR ? "Standard" : "Standard"
        },
        {
            name: isFR ? "Moyen" : "Medium",
            sub: isFR ? "Grille 12x12 • Avec Diagonales • Défi sympa" : "12x12 Grid • With Diagonals • Fun challenge",
            badge: isFR ? "Intermédiaire" : "Intermediate"
        },
        {
            name: isFR ? "Difficile" : "Hard",
            sub: isFR ? "Grille 14x14 • Mots à l'envers • Diagonales inverses" : "14x14 Grid • Reversed words • Inverse diagonals",
            badge: isFR ? "Expert" : "Expert"
        },
        {
            name: isFR ? "Expert" : "Expert",
            sub: isFR ? "Grille 16x16 • Temps limité • Mots croisés cachés" : "16x16 Grid • Limited time • Intersecting hidden words",
            badge: isFR ? "Légende" : "Legend"
        }
    ];
    
    diffCards.forEach((card, idx) => {
        const info = diffTexts[idx];
        card.querySelector("h3").innerText = info.name;
        card.querySelector("p").innerText = info.sub;
        card.querySelector(".diff-badge").innerText = info.badge;
    });
    
    // Gameplay elements
    document.querySelector(".word-list-header span").innerHTML = isFR ? 
        `Trouvez ces mots (<span id="words-found-count">0</span>/<span id="words-total-count">0</span>)` : 
        `Find these words (<span id="words-found-count">0</span>/<span id="words-total-count">0</span>)`;
    document.getElementById("btn-hint").innerText = isFR ? "💡 Indice" : "💡 Hint";
    
    // Settings Screen elements labels
    const settingItems = document.querySelectorAll(".setting-item");
    
    // Sound item
    settingItems[0].querySelector("h3").innerText = isFR ? "Effets Sonores" : "Sound Effects";
    settingItems[0].querySelector("p").innerText = isFR ? "Sons de sélection et victoire synthétisés" : "Synthesized sound effects";
    
    // Vibration item
    settingItems[1].querySelector("h3").innerText = isFR ? "Vibrations" : "Haptic Vibrations";
    settingItems[1].querySelector("p").innerText = isFR ? "Retour tactile lors des sélections (si supporté)" : "Tactile haptic swipe response";
    
    // Language item
    settingItems[2].querySelector("h3").innerText = isFR ? "Langue du dictionnaire" : "Word Dictionary";
    settingItems[2].querySelector("p").innerText = isFR ? "Choix de la langue des mots à trouver" : "Language of hidden words";
    
    // Ads status item
    settingItems[3].querySelector("h3").innerText = isFR ? "Publicité Intégrée" : "Integrated Ads";
    settingItems[3].querySelector("p").innerText = isFR ? "Status de la passerelle native" : "Native bridge status";
    
    // Victory Modal translation elements
    document.querySelector("#modal-victory h2").innerText = isFR ? "Niveau Réussi !" : "Level Cleared!";
    document.querySelector(".congrats-text").innerText = isFR ? 
        "Excellent travail ! Vous avez trouvé tous les mots cachés." : 
        "Excellent work! You found all the hidden words.";
    
    document.querySelectorAll(".v-lbl")[0].innerText = isFR ? "Temps" : "Time";
    document.querySelectorAll(".v-lbl")[1].innerText = isFR ? "Points" : "Score";
    document.querySelectorAll(".v-lbl")[2].innerText = isFR ? "Difficulté" : "Difficulty";
    
    document.getElementById("btn-next-level").innerText = isFR ? "Niveau Suivant" : "Next Level";
    document.querySelector("#modal-victory button.btn-secondary").innerText = isFR ? "Menu Principal" : "Main Menu";
}

function populateCategoryScreen() {
    const container = document.getElementById("categories-container");
    container.innerHTML = "";
    
    const emojis = {
        // French keys
        "Animaux": "🦁", "Pays & Villes": "🌍", "Nourriture": "🍕", "Métiers": "👨‍🚒", "Technologie": "💻", "Nature & Espace": "🌲",
        // English keys
        "Animals": "🦁", "Countries & Cities": "🌍", "Food": "🍕", "Jobs": "👨‍🚒", "Technology": "💻", "Nature & Space": "🌲"
    };

    const dict = getActiveDict();

    Object.keys(dict).forEach(catName => {
        const card = document.createElement("div");
        card.className = "category-card";
        card.innerHTML = `
            <span class="cat-emoji">${emojis[catName] || "🏷️"}</span>
            <span class="cat-name">${catName}</span>
            <span class="cat-count">${dict[catName].length} ${currentLanguage === 'fr' ? 'mots' : 'words'}</span>
        `;
        card.addEventListener("click", () => {
            currentCategory = catName;
            showScreen("screen-difficulty");
        });
        container.appendChild(card);
    });
}

function setupEventListeners() {
    // Menu Buttons
    document.getElementById("btn-play-quick").addEventListener("click", () => {
        const dict = getActiveDict();
        currentCategory = Object.keys(dict)[Math.floor(Math.random() * Object.keys(dict).length)];
        currentDiffIndex = 1; // Easy default for quick play
        startGame();
    });
    
    document.getElementById("btn-select-category").addEventListener("click", () => {
        showScreen("screen-categories");
    });
    
    document.getElementById("btn-settings-toggle").addEventListener("click", () => {
        showScreen("screen-settings");
    });

    // Difficulty Select Buttons
    document.querySelectorAll(".diff-card").forEach(card => {
        card.addEventListener("click", () => {
            currentDiffIndex = parseInt(card.getAttribute("data-diff"));
            startGame();
        });
    });

    document.getElementById("btn-back-difficulty").addEventListener("click", () => {
        showScreen("screen-categories");
    });

    // Game Actions
    document.getElementById("btn-hint").addEventListener("click", triggerHint);
    document.getElementById("btn-next-level").addEventListener("click", () => {
        hideVictoryModal();
        
        // TRIGGER AD INTERSTITIAL VIA ADMOB BRIDGE IF AVAILABLE
        showAdInterstitial();
        
        // Load a new game
        startGame();
    });

    // Option Switches
    const soundSwitch = document.getElementById("switch-sound");
    soundSwitch.addEventListener("change", () => {
        soundEnabled = soundSwitch.checked;
    });

    const vibrateSwitch = document.getElementById("switch-vibrate");
    vibrateSwitch.addEventListener("change", () => {
        vibrationEnabled = vibrateSwitch.checked;
    });

    // Language Select Dropdown
    const langSelect = document.getElementById("select-lang");
    if (langSelect) {
        langSelect.addEventListener("change", () => {
            changeLanguage(langSelect.value);
        });
    }

    // Grid Touch/Mouse Events
    const board = document.getElementById("grid-board");
    
    // Mouse Support
    board.addEventListener("mousedown", handleStart);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);

    // Touch Support
    board.addEventListener("touchstart", handleStart, { passive: false });
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd, { passive: false });

    // Handle Canvas Resize dynamically
    window.addEventListener("resize", resizeSwipeCanvas);
}

/* ==========================================================================
   ADMOB ADS INTEGRATION BRIDGE
   ========================================================================== */
function showAdInterstitial() {
    console.log("Tentative d'affichage de publicité...");
    if (window.AndroidInterface && typeof window.AndroidInterface.showInterstitialAd === "function") {
        try {
            window.AndroidInterface.showInterstitialAd();
        } catch (e) {
            console.error("Erreur lors de l'appel à la pub native: ", e);
        }
    } else {
        // Fallback for browser developer test: nice visual alert
        console.log("Simulateur AdMob: Chargement d'une publicité Interstitielle...");
        showToast("Publicité Interstitielle simulée chargée.");
    }
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.style.position = "absolute";
    toast.style.bottom = "80px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = "rgba(10, 14, 26, 0.9)";
    toast.style.border = "1px solid var(--color-secondary)";
    toast.style.color = "white";
    toast.style.padding = "8px 16px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "12px";
    toast.style.zIndex = "1000";
    toast.style.pointerEvents = "none";
    toast.style.transition = "opacity 0.5s ease";
    toast.innerText = message;
    
    document.querySelector(".app-container").appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

/* ==========================================================================
   WEB AUDIO API SYNTHESIZER
   ========================================================================== */
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    try {
        initAudio();
        const now = audioCtx.currentTime;
        
        switch (type) {
            case "select": {
                // Short, soft blip
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(440, now); // A4
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.08);
                break;
            }
            case "correct": {
                // Beautiful arpeggio (C-major triad C5 -> E5 -> G5)
                const playNote = (freq, delay, dur) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(freq, now + delay);
                    gain.gain.setValueAtTime(0.08, now + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + delay);
                    osc.stop(now + delay + dur);
                };
                playNote(523.25, 0.0, 0.15); // C5
                playNote(659.25, 0.08, 0.15); // E5
                playNote(783.99, 0.16, 0.25); // G5
                break;
            }
            case "error": {
                // Double buzz
                const playBuzz = (freq, delay) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = "sawtooth";
                    osc.frequency.setValueAtTime(freq, now + delay);
                    gain.gain.setValueAtTime(0.05, now + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + delay);
                    osc.stop(now + delay + 0.12);
                };
                playBuzz(150, 0.0);
                playBuzz(150, 0.1);
                break;
            }
            case "win": {
                // Triumphant melody
                const playNote = (freq, delay, dur) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(freq, now + delay);
                    gain.gain.setValueAtTime(0.06, now + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + delay);
                    osc.stop(now + delay + dur);
                };
                playNote(523.25, 0.0, 0.2); // C5
                playNote(523.25, 0.2, 0.2); // C5
                playNote(523.25, 0.4, 0.2); // C5
                playNote(659.25, 0.6, 0.35); // E5
                playNote(587.33, 0.9, 0.2); // D5
                playNote(659.25, 1.1, 0.2); // E5
                playNote(783.99, 1.3, 0.6); // G5
                break;
            }
        }
    } catch (e) {
        console.error("Sons non supportés par ce navigateur.", e);
    }
}

function doVibrate(duration) {
    if (vibrationEnabled && navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

/* ==========================================================================
   GAME ENGINE & GRID GENERATOR
   ========================================================================== */
function startGame() {
    clearInterval(timerInterval);
    const diff = DIFFICULTY_LEVELS[currentDiffIndex];
    
    // Set up Level state
    currentLevel.size = diff.size;
    currentLevel.directions = diff.directions;
    currentLevel.words = [];
    timeSpent = 0;
    
    const dict = getActiveDict();
    // Select category words and sanitize (remove accents, capitalize)
    let availableWords = [...dict[currentCategory]];
    // Shuffle available words
    availableWords.sort(() => 0.5 - Math.random());
    
    // Filter by word size appropriate for grid
    const maxWordSize = currentLevel.size;
    availableWords = availableWords
        .map(w => sanitizeWord(w))
        .filter(w => w.length <= maxWordSize);

    // Initialize blank grid
    currentLevel.grid = Array(currentLevel.size).fill(null).map(() => Array(currentLevel.size).fill(""));

    // Try placing words
    let wordsToPlaceCount = Math.min(diff.wordCount, availableWords.length);
    let placedWords = [];

    for (let word of availableWords) {
        if (placedWords.length >= wordsToPlaceCount) break;
        
        let successfullyPlaced = tryPlaceWord(word);
        if (successfullyPlaced) {
            placedWords.push(successfullyPlaced); // stores { text, cells }
        }
    }

    currentLevel.words = placedWords;

    // Fill remaining blank spaces
    for (let r = 0; r < currentLevel.size; r++) {
        for (let c = 0; c < currentLevel.size; c++) {
            if (currentLevel.grid[r][c] === "") {
                currentLevel.grid[r][c] = FILL_LETTERS[Math.floor(Math.random() * FILL_LETTERS.length)];
            }
        }
    }

    // Set UI metadata
    document.getElementById("game-category-title").innerText = currentCategory;
    
    // Set difficulty badge text & color on gameplay
    const diffText = document.getElementById("game-difficulty-text");
    diffText.innerText = diff.name;
    diffText.className = "difficulty-indicator " + diff.badgeClass;

    document.getElementById("words-found-count").innerText = "0";
    document.getElementById("words-total-count").innerText = currentLevel.words.length;
    document.getElementById("game-score").innerText = userStats.score;

    // Render components
    renderGridBoard();
    renderWordList();
    resizeSwipeCanvas();
    
    // Start Screen Setting
    showScreen("screen-game");

    // Start Timer if Expert level
    const timerBox = document.getElementById("timer-box");
    if (diff.timer) {
        timeLeft = diff.timer;
        timerBox.style.display = "flex";
        timerBox.classList.remove("warning");
        document.getElementById("game-timer").innerText = formatTime(timeLeft);
        timerInterval = setInterval(() => {
            timeLeft--;
            timeSpent++;
            document.getElementById("game-timer").innerText = formatTime(timeLeft);
            if (timeLeft <= 15) {
                timerBox.classList.add("warning");
            }
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                doVibrate([100, 50, 100]);
                playSound("error");
                showToast("Temps écoulé ! Réessayez.");
                showScreen("screen-menu");
            }
        }, 1000);
    } else {
        timerBox.style.display = "none";
        // Just standard count-up timer for fun
        timeLeft = 0;
        timerInterval = setInterval(() => {
            timeSpent++;
        }, 1000);
    }
}

function sanitizeWord(word) {
    return word.normalize("NFD")
               .replace(/[\u0300-\u036f]/g, "") // remove accents
               .toUpperCase()
               .replace(/[^A-Z]/g, ""); // strictly keep alphabet
}

function tryPlaceWord(word) {
    const size = currentLevel.size;
    const dirs = currentLevel.directions;
    
    // Shuffle directions for organic distribution
    const shuffledDirs = [...dirs].sort(() => 0.5 - Math.random());
    
    // Try random positions
    const maxAttempts = 150;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const startR = Math.floor(Math.random() * size);
        const startC = Math.floor(Math.random() * size);
        
        for (let dir of shuffledDirs) {
            const dr = dir[0];
            const dc = dir[1];
            
            // Check boundaries
            const endR = startR + dr * (word.length - 1);
            const endC = startC + dc * (word.length - 1);
            
            if (endR >= 0 && endR < size && endC >= 0 && endC < size) {
                // Check if word fits (no collision or letter matching)
                let fits = true;
                let cellsUsed = [];
                
                for (let i = 0; i < word.length; i++) {
                    const currR = startR + dr * i;
                    const currC = startC + dc * i;
                    const gridVal = currentLevel.grid[currR][currC];
                    
                    if (gridVal !== "" && gridVal !== word[i]) {
                        fits = false;
                        break;
                    }
                    cellsUsed.push({ r: currR, c: currC });
                }
                
                if (fits) {
                    // Place word in grid
                    for (let i = 0; i < word.length; i++) {
                        currentLevel.grid[cellsUsed[i].r][cellsUsed[i].c] = word[i];
                    }
                    return {
                        text: word,
                        found: false,
                        cells: cellsUsed
                    };
                }
            }
        }
    }
    return null;
}

/* ==========================================================================
   RENDERING
   ========================================================================== */
function renderGridBoard() {
    const board = document.getElementById("grid-board");
    board.innerHTML = "";
    
    const size = currentLevel.size;
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    
    // Set cell sizes dynamically depending on grid density
    const cellFontSize = Math.max(12, Math.min(22, 220 / size));
    board.style.setProperty("--cell-font-size", `${cellFontSize}px`);

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement("div");
            cell.className = "letter-cell";
            cell.innerText = currentLevel.grid[r][c];
            cell.setAttribute("data-row", r);
            cell.setAttribute("data-col", c);
            cell.id = `cell-${r}-${c}`;
            board.appendChild(cell);
        }
    }
}

function renderWordList() {
    const container = document.getElementById("word-list-container");
    container.innerHTML = "";
    
    currentLevel.words.forEach((word, idx) => {
        const item = document.createElement("span");
        item.className = "word-item";
        item.innerText = word.text;
        item.id = `word-item-${idx}`;
        container.appendChild(item);
    });
}

function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

/* ==========================================================================
   SWIPE INTERACTION & SELECT GESTURE
   ========================================================================== */
function getCellFromCoordinates(x, y) {
    const elements = document.elementsFromPoint(x, y);
    for (let el of elements) {
        if (el.classList && el.classList.contains("letter-cell")) {
            const r = parseInt(el.getAttribute("data-row"));
            const c = parseInt(el.getAttribute("data-col"));
            return { r, c, el };
        }
    }
    return null;
}

function handleStart(e) {
    if (isSelecting) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const cell = getCellFromCoordinates(clientX, clientY);
    if (cell) {
        // Prevent default only inside grid boundary to allow smooth scroll elsewhere
        e.preventDefault();
        
        isSelecting = true;
        selectStartCell = cell;
        selectCurrentCell = cell;
        
        initAudio(); // Activate web audio context on user interaction
        playSound("select");
        doVibrate(15);
        
        updateSelection();
    }
}

function handleMove(e) {
    if (!isSelecting || !selectStartCell) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const cell = getCellFromCoordinates(clientX, clientY);
    if (cell) {
        e.preventDefault();
        
        // Only trigger update if moved to a different cell
        if (!selectCurrentCell || selectCurrentCell.r !== cell.r || selectCurrentCell.c !== cell.c) {
            selectCurrentCell = cell;
            playSound("select");
            doVibrate(10);
            updateSelection();
        }
    }
}

function handleEnd(e) {
    if (!isSelecting) return;
    isSelecting = false;
    
    validateSelection();
    
    // Clear canvas lines
    clearSwipeCanvas();
    
    // Clear temporary selection styles
    document.querySelectorAll(".letter-cell").forEach(cell => {
        cell.classList.remove("selected-temp");
    });
    
    selectStartCell = null;
    selectCurrentCell = null;
    selectedCells = [];
}

// Keep grid constrained to standard directions (Horizontal, Vertical, Diagonals)
function updateSelection() {
    if (!selectStartCell || !selectCurrentCell) return;
    
    const r1 = selectStartCell.r;
    const c1 = selectStartCell.c;
    const r2 = selectCurrentCell.r;
    const c2 = selectCurrentCell.c;
    
    const dr = r2 - r1;
    const dc = c2 - c1;
    
    let stepR = 0;
    let stepC = 0;
    
    // Calculate direction vector constrained to 8 ways
    if (dr === 0) {
        // Horizontal
        stepC = dc > 0 ? 1 : -1;
    } else if (dc === 0) {
        // Vertical
        stepR = dr > 0 ? 1 : -1;
    } else if (Math.abs(dr) === Math.abs(dc)) {
        // Perfect diagonal
        stepR = dr > 0 ? 1 : -1;
        stepC = dc > 0 ? 1 : -1;
    } else {
        // Not a straight or perfectly diagonal line -> keep selection to start cell only
        selectedCells = [{ r: r1, c: c1 }];
        drawSelectionLine();
        highlightTempCells();
        return;
    }
    
    const length = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
    selectedCells = [];
    
    for (let i = 0; i < length; i++) {
        selectedCells.push({
            r: r1 + stepR * i,
            c: c1 + stepC * i
        });
    }
    
    drawSelectionLine();
    highlightTempCells();
}

function highlightTempCells() {
    // Reset all temp highlights
    document.querySelectorAll(".letter-cell").forEach(cell => {
        cell.classList.remove("selected-temp");
    });
    
    // Apply new temp highlights
    selectedCells.forEach(cell => {
        const el = document.getElementById(`cell-${cell.r}-${cell.c}`);
        if (el) el.classList.add("selected-temp");
    });
}

/* ==========================================================================
   CANVAS OVERLAY DRAWING (LINE TRACER)
   ========================================================================== */
function resizeSwipeCanvas() {
    const canvas = document.getElementById("swipe-canvas");
    const container = document.querySelector(".grid-wrapper");
    if (!canvas || !container) return;
    
    canvas.width = container.clientWidth - 20;
    canvas.height = container.clientHeight - 20;
}

function clearSwipeCanvas() {
    const canvas = document.getElementById("swipe-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawSelectionLine() {
    const canvas = document.getElementById("swipe-canvas");
    if (!canvas || selectedCells.length === 0) return;
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const size = currentLevel.size;
    const cellWidth = canvas.width / size;
    const cellHeight = canvas.height / size;
    
    ctx.beginPath();
    
    selectedCells.forEach((cell, idx) => {
        // Calculate center coordinate of each letter cell in canvas coordinates
        const x = cell.c * cellWidth + cellWidth / 2;
        const y = cell.r * cellHeight + cellHeight / 2;
        
        if (idx === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    // Glowing Swipe tracer styling (Vibrant violet/cyan transparent)
    ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
    ctx.lineWidth = Math.min(cellWidth, cellHeight) * 0.7; // Thick capsule indicator
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    
    // Draw central inner sharp neon line
    ctx.beginPath();
    selectedCells.forEach((cell, idx) => {
        const x = cell.c * cellWidth + cellWidth / 2;
        const y = cell.r * cellHeight + cellHeight / 2;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "rgba(6, 182, 212, 0.9)";
    ctx.lineWidth = 4;
    ctx.stroke();
}

/* ==========================================================================
   VERIFICATION & GAMEPLAY LOGIC
   ========================================================================== */
function validateSelection() {
    if (selectedCells.length < 2) return;
    
    // Gather letters
    let swipedString = selectedCells.map(cell => currentLevel.grid[cell.r][cell.c]).join("");
    let reversedString = swipedString.split("").reverse().join("");
    
    // Check against word dictionary
    let foundWordIndex = -1;
    let matchingString = "";
    
    for (let i = 0; i < currentLevel.words.length; i++) {
        const w = currentLevel.words[i];
        if (w.found) continue;
        
        if (w.text === swipedString) {
            foundWordIndex = i;
            matchingString = swipedString;
            break;
        } else if (w.text === reversedString) {
            foundWordIndex = i;
            matchingString = reversedString;
            break;
        }
    }
    
    if (foundWordIndex !== -1) {
        // Success!
        const matchedWord = currentLevel.words[foundWordIndex];
        matchedWord.found = true;
        
        // Permanent highlights
        applyPermanentWordHighlight(matchedWord.cells);
        
        // Update word list text
        const wordEl = document.getElementById(`word-item-${foundWordIndex}`);
        if (wordEl) {
            wordEl.classList.add("found");
        }
        
        // Play success effects
        playSound("correct");
        doVibrate(40);
        
        // Score calculation: 10 points * multiplier for size
        const points = matchedWord.text.length * 10 * (currentDiffIndex + 1);
        userStats.score += points;
        document.getElementById("game-score").innerText = userStats.score;
        saveUserProfile();

        // Update words found count
        const foundCount = currentLevel.words.filter(w => w.found).length;
        document.getElementById("words-found-count").innerText = foundCount;

        // Check victory
        if (foundCount === currentLevel.words.length) {
            handleLevelVictory();
        }
    } else {
        // Error vibration and blip
        playSound("error");
        doVibrate([50, 50]);
    }
}

// Assigns a unique transparent overlay colors for found words so it looks gorgeous!
function applyPermanentWordHighlight(cells) {
    // Sleek HSL palettes for completed words
    const palettes = [
        { color: "#34d399", glow: "rgba(52, 211, 153, 0.4)" }, // Mint
        { color: "#60a5fa", glow: "rgba(96, 165, 250, 0.4)" }, // Blue
        { color: "#fbbf24", glow: "rgba(251, 191, 36, 0.4)" }, // Gold
        { color: "#ec4899", glow: "rgba(236, 72, 153, 0.4)" }, // Pink
        { color: "#a78bfa", glow: "rgba(167, 139, 250, 0.4)" } // Lavender
    ];
    
    const palette = palettes[Math.floor(Math.random() * palettes.length)];

    cells.forEach(cell => {
        const el = document.getElementById(`cell-${cell.r}-${cell.c}`);
        if (el) {
            el.classList.add("found");
            el.style.setProperty("--cell-found-color", palette.color);
            el.style.setProperty("--cell-found-glow", palette.glow);
        }
    });
}

function handleLevelVictory() {
    clearInterval(timerInterval);
    playSound("win");
    doVibrate([100, 50, 100, 50, 200]);
    
    // Launch celebratory JS Confetti if browser supports it
    triggerConfetti();

    // Increment victories count
    userStats.wins++;
    // End bonus score based on speed
    const speedBonus = Math.max(50, 300 - timeSpent);
    userStats.score += speedBonus;
    saveUserProfile();

    // Set Modal statistics
    document.getElementById("vic-time").innerText = formatTime(timeSpent);
    document.getElementById("vic-score").innerText = `+${speedBonus}`;
    document.getElementById("vic-difficulty").innerText = DIFFICULTY_LEVELS[currentDiffIndex].name;
    
    setTimeout(() => {
        showVictoryModal();
    }, 800);
}

/* ==========================================================================
   HINTS SYSTEM
   ========================================================================== */
function triggerHint() {
    // Find first unfound word
    const unfoundWord = currentLevel.words.find(w => !w.found);
    if (!unfoundWord) return;

    // Light up the first letter of this word for 1.5 seconds as a flash indicator
    const firstCell = unfoundWord.cells[0];
    const el = document.getElementById(`cell-${firstCell.r}-${firstCell.c}`);
    
    if (el) {
        // Flash letter
        el.style.transition = "none";
        el.style.backgroundColor = "var(--color-accent)";
        el.style.boxShadow = "0 0 20px var(--color-accent)";
        el.style.transform = "scale(1.2)";
        doVibrate(50);
        playSound("select");

        setTimeout(() => {
            el.style.transition = "";
            el.style.backgroundColor = "";
            el.style.boxShadow = "";
            el.style.transform = "";
        }, 1500);
        
        showToast(`Indice: Commence par '${unfoundWord.text[0]}'`);
    }
}

/* ==========================================================================
   VICTORY MODAL CONTROL
   ========================================================================== */
function showVictoryModal() {
    document.getElementById("modal-victory").classList.add("active");
}

function hideVictoryModal() {
    document.getElementById("modal-victory").classList.remove("active");
}

/* ==========================================================================
   CANVAS SHIM AND JS CONFETTI
   ========================================================================== */
function triggerConfetti() {
    // Simple pure JS canvas confetti effect
    const container = document.querySelector(".app-container");
    const confettiCanvas = document.createElement("canvas");
    confettiCanvas.style.position = "absolute";
    confettiCanvas.style.top = "0";
    confettiCanvas.style.left = "0";
    confettiCanvas.style.width = "100%";
    confettiCanvas.style.height = "100%";
    confettiCanvas.style.pointerEvents = "none";
    confettiCanvas.style.zIndex = "99";
    container.appendChild(confettiCanvas);

    const ctx = confettiCanvas.getContext("2d");
    confettiCanvas.width = container.clientWidth;
    confettiCanvas.height = container.clientHeight;

    const colors = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];
    const particles = [];

    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            size: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 4 - 2
        });
    }

    let animationFrame;
    function update() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        let finished = true;

        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += p.rotationSpeed;

            if (p.y < confettiCanvas.height) {
                finished = false;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        if (!finished) {
            animationFrame = requestAnimationFrame(update);
        } else {
            confettiCanvas.remove();
        }
    }

    update();
}
