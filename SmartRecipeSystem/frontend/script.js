const API_BASE = 'http://localhost:8080/api';
const DEFAULT_USER_ID = 1;

let recipesDB = [];
let activeFilter = 'all';
let backendConnected = false;

// --- CONTINUOUS ALARM LOGIC (Web Audio API) ---
let audioCtx = null;
let alarmInterval = null;

function playAlarmSequence() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        function beep(timeOffset) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, audioCtx.currentTime + timeOffset);

            gain.gain.setValueAtTime(0.5, audioCtx.currentTime + timeOffset);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + timeOffset + 0.15);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(audioCtx.currentTime + timeOffset);
            osc.stop(audioCtx.currentTime + timeOffset + 0.15);
        }

        beep(0);
        beep(0.25);
        beep(0.5);
    } catch (e) {
        console.log("Audio blocked by browser.");
    }
}

// --- KITCHEN TIMER LOGIC ---
let timerInterval = null;
let timerSeconds = 0;
let isTimerRunning = false;
let isTimerRinging = false;

function toggleTimer() {
    const btn = document.getElementById('timer-start-btn');
    const inputM = document.getElementById('timer-m');
    const inputS = document.getElementById('timer-s');
    const title = document.getElementById('timer-title');
    const subtitle = document.getElementById('timer-subtitle');
    const icon = document.getElementById('timer-icon');

    if (isTimerRinging) {
        clearInterval(alarmInterval);
        isTimerRinging = false;
        inputM.disabled = false;
        inputS.disabled = false;

        title.innerText = "Kitchen Timer";
        title.classList.remove('text-red-400', 'animate-pulse');
        subtitle.innerText = "Alarm sound enabled";
        subtitle.classList.remove('text-red-300');
        icon.classList.remove('text-red-500', 'animate-bounce');
        icon.classList.add('text-blue-400');

        btn.innerHTML = '<i class="ph-bold ph-play"></i>';
        btn.className = 'w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-500/20 shrink-0';
        return;
    }

    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        btn.innerHTML = '<i class="ph-bold ph-play"></i>';
        btn.className = 'w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-500/20 shrink-0';
        inputM.disabled = false;
        inputS.disabled = false;
    } else {
        let m = parseInt(inputM.value) || 0;
        let s = parseInt(inputS.value) || 0;
        timerSeconds = (m * 60) + s;

        if (timerSeconds <= 0) return;

        isTimerRunning = true;
        inputM.disabled = true;
        inputS.disabled = true;

        btn.innerHTML = '<i class="ph-bold ph-pause"></i>';
        btn.className = 'w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center transition-all shadow-lg shadow-orange-500/20 shrink-0';

        timerInterval = setInterval(() => {
            timerSeconds--;
            if (timerSeconds <= 0) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                isTimerRinging = true;
                updateTimerDisplay(0);

                title.innerText = "Time's Up!";
                title.classList.add('text-red-400', 'animate-pulse');
                subtitle.innerText = "Click Stop to mute alarm";
                subtitle.classList.add('text-red-300');
                icon.classList.remove('text-blue-400');
                icon.classList.add('text-red-500', 'animate-bounce');

                btn.innerHTML = '<i class="ph-bold ph-bell-ringing"></i>';
                btn.className = 'w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all shadow-lg shadow-red-500/50 shrink-0 animate-bounce';

                playAlarmSequence();
                alarmInterval = setInterval(playAlarmSequence, 1000);
            } else {
                updateTimerDisplay(timerSeconds);
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    clearInterval(alarmInterval);
    isTimerRunning = false;
    isTimerRinging = false;

    document.getElementById('timer-m').value = "05";
    document.getElementById('timer-s').value = "00";
    document.getElementById('timer-m').disabled = false;
    document.getElementById('timer-s').disabled = false;

    const title = document.getElementById('timer-title');
    const subtitle = document.getElementById('timer-subtitle');
    const icon = document.getElementById('timer-icon');

    title.innerText = "Kitchen Timer";
    title.classList.remove('text-red-400', 'animate-pulse');
    subtitle.innerText = "Alarm sound enabled";
    subtitle.classList.remove('text-red-300');
    icon.classList.remove('text-red-500', 'animate-bounce');
    icon.classList.add('text-blue-400');

    const btn = document.getElementById('timer-start-btn');
    btn.innerHTML = '<i class="ph-bold ph-play"></i>';
    btn.className = 'w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-500/20 shrink-0';
}

function updateTimerDisplay(totalSeconds) {
    let m = Math.floor(totalSeconds / 60);
    let s = totalSeconds % 60;
    document.getElementById('timer-m').value = m.toString().padStart(2, '0');
    document.getElementById('timer-s').value = s.toString().padStart(2, '0');
}

// --- ALL 30 INGREDIENTS FROM ORIGINAL PROJECT ---
const dashboardItems = [
    { name: "Red Tomato", price: 45, weight: "1 kg", category: "vegetables", img: "Items_Images/tomato.jpeg" },
    { name: "Red Onion", price: 35, weight: "1 kg", category: "vegetables", img: "Items_Images/onion.jpeg" },
    { name: "Potatoes", price: 30, weight: "1 kg", category: "vegetables", img: "Items_Images/potato.jpeg" },
    { name: "Spinach (Palak)", price: 25, weight: "500 g", category: "vegetables", img: "Items_Images/spinach.jpeg" },
    { name: "Capsicum", price: 40, weight: "500 g", category: "vegetables", img: "Items_Images/capsicum.jpeg" },
    { name: "Cauliflower", price: 35, weight: "1 pc", category: "vegetables", img: "Items_Images/cauliflower.jpeg" },
    { name: "Ginger", price: 30, weight: "250 g", category: "vegetables", img: "Items_Images/ginger.jpeg" },
    { name: "Garlic", price: 45, weight: "250 g", category: "vegetables", img: "Items_Images/garlic.jpeg" },
    { name: "Green Chillies", price: 15, weight: "200 g", category: "vegetables", img: "Items_Images/green_chillies.jpeg" },
    { name: "Amul Taaza Milk", price: 72, weight: "1 L", category: "dairy", img: "Items_Images/milk.jpeg" },
    { name: "Fresh Paneer", price: 380, weight: "1 kg", category: "dairy", img: "Items_Images/paneer.jpeg" },
    { name: "Butter Block", price: 275, weight: "500 g", category: "dairy", img: "Items_Images/butter.jpeg" },
    { name: "Curd (Dahi)", price: 110, weight: "1 kg", category: "dairy", img: "Items_Images/curd.jpeg" },
    { name: "Banana", price: 60, weight: "1 Dozen", category: "fruits", img: "Items_Images/banana.jpeg" },
    { name: "Apple", price: 120, weight: "4 pcs", category: "fruits", img: "Items_Images/apple.jpeg" },
    { name: "Pomegranate", price: 140, weight: "500 g", category: "fruits", img: "Items_Images/pomegranate.jpeg" },
    { name: "Sweet Lime", price: 80, weight: "1 kg", category: "fruits", img: "Items_Images/sweetlime.jpeg" },
    { name: "Basmati Rice", price: 650, weight: "5 kg", category: "grains", img: "Items_Images/rice.jpeg" },
    { name: "Wheat Flour", price: 450, weight: "10 kg", category: "grains", img: "Items_Images/wheat_flour.jpeg" },
    { name: "Toor Dal", price: 160, weight: "1 kg", category: "grains", img: "Items_Images/dal.jpeg" },
    { name: "Turmeric", price: 60, weight: "200 g", category: "spices", img: "Items_Images/turmeric.jpeg" },
    { name: "Red Chilli", price: 85, weight: "200 g", category: "spices", img: "Items_Images/red_chilli.jpeg" },
    { name: "Cumin Seeds", price: 70, weight: "100 g", category: "spices", img: "Items_Images/cumin.jpeg" },
    { name: "Black Pepper", price: 120, weight: "100 g", category: "spices", img: "Items_Images/black_pepper.jpeg" },
    { name: "Salt", price: 25, weight: "1 kg", category: "spices", img: "Items_Images/salt.jpeg" },
    { name: "Brown Bread", price: 45, weight: "1 Pack", category: "dairy", img: "Items_Images/bread.jpeg" },
    { name: "Tea Leaves", price: 120, weight: "250 g", category: "spices", img: "Items_Images/tea.jpeg" },
    { name: "Sugar", price: 45, weight: "1 kg", category: "grains", img: "Items_Images/sugar.jpeg" },
    { name: "Eggs", price: 40, weight: "6 pcs", category: "dairy", img: "Items_Images/eggs.jpeg" },
    { name: "Coffee Powder", price: 190, weight: "100 g", category: "spices", img: "Items_Images/coffee.jpeg" }
];

// --- YOUTUBE EMBED MAP FOR ALL 40 RECIPES ---
const recipeVideoMap = {
    'palak paneer': 'https://www.youtube.com/embed/5lVLxEr_qgM?si=SgrAHiPyWRNXI9wT',
    'dal tadka': 'https://www.youtube.com/embed/aBi4hylX5cs?si=6OwX7fAxmVB7si-C',
    'tomato soup': 'https://www.youtube.com/embed/af3xz0mpeNw?si=814nEd5KfQWUaifn',
    'aloo gobi': 'https://www.youtube.com/embed/KMVI7NHcbNE?si=8IRHJyx8hIoNdRkf',
    'paneer bhurji': 'https://www.youtube.com/embed/KgW--wj5iBM?si=PwUK27pWfvgbfZrp',
    'masala omelette': 'https://www.youtube.com/embed/aSmWYtOf6Os?si=bx5vCcArABsICj85',
    'french toast': 'https://www.youtube.com/embed/mw9yNYLg7f4?si=BiLO3Nf-Qeptt0-Y',
    'masala chai': 'https://www.youtube.com/embed/zIuQBFFR9ow?si=91lWUT_HuFWMVDoF',
    'cold coffee': 'https://www.youtube.com/embed/J_YVRNVwhiU?si=JQb0I75JVXu35dhw',
    'banana smoothie': 'https://www.youtube.com/embed/2eLO9rPSMCA?si=8yDoC6TUBo0RaJ-H',
    'banana milkshake': 'https://www.youtube.com/embed/2eLO9rPSMCA?si=8yDoC6TUBo0RaJ-H',
    'jeera rice': 'https://www.youtube.com/embed/H-OtHWRCoas?si=ShS69pKBestl18QM',
    'potato sandwich': 'https://www.youtube.com/embed/gs1GP1KU10w?si=PtFpMlHupmsA9Atk',
    'paneer sandwich': 'https://www.youtube.com/embed/KqE_Df7tIYM?si=bh0VE-4iXekNfja-',
    'mixed fruit salad': 'https://www.youtube.com/embed/DaHzq6eZY7A?si=2SoUiZgUo783siPu',
    'fruit salad': 'https://www.youtube.com/embed/DaHzq6eZY7A?si=2SoUiZgUo783siPu',
    'chapati': 'https://www.youtube.com/embed/hyUwLHMgzMk?si=XRd-XWkg_LBKGGXz',
    'roti': 'https://www.youtube.com/embed/hyUwLHMgzMk?si=XRd-XWkg_LBKGGXz',
    'plain paratha': 'https://www.youtube.com/embed/cP3RwsJL0Ws?si=4Rqvb2_JDH6i0hZ2',
    'aloo paratha': 'https://www.youtube.com/embed/j3pDXY9fqSo?si=5BgVQOfzSQreg9qO',
    'paneer paratha': 'https://www.youtube.com/embed/Y22qReZN7ng?si=RjpGkQhjnn6yZwec',
    'gobi paratha': 'https://www.youtube.com/embed/Ii6kl2G2e6M?si=YFITRXHUVaF0LUMI',
    'spicy dal': 'https://www.youtube.com/embed/3XTSCbZfEgM?si=NgtrGaiNDZgfpmhM',
    'garlic bread': 'https://www.youtube.com/embed/9dezux3qocM?si=_4RpqZk3YTtBauEw',
    'boiled eggs': 'https://www.youtube.com/embed/XW8CyQbIdN4?si=ThVKpBuQLfOwNOqd',
    'egg curry': 'https://www.youtube.com/embed/pqGMxHIfcXg?si=z34dqjlPn_uSOksJ',
    'scrambled eggs': 'https://www.youtube.com/embed/-OHfxqVp-Wg?si=HlRUK6QoiM7q_jbb',
    'apple milkshake': 'https://www.youtube.com/embed/ewx0WbnzDEk?si=Qa42u820oEQFeypI',
    'paneer tikka': 'https://www.youtube.com/embed/c-oVDb-O2Q8?si=miS2jt_GzQ1dofuj',
    'capsicum masala': 'https://www.youtube.com/embed/O4Fg0gUC4CE?si=dxO5Nno316uPjDTD',
    'spinach dal': 'https://www.youtube.com/embed/3xr76O6wmdM?si=zrn969n6qeTVACQw',
    'sweet lassi': 'https://www.youtube.com/embed/SlqpgRCdSyo?si=4WIKscUCD_JkKQOd',
    'salted lassi': 'https://www.youtube.com/embed/M77dzBMpcaE?si=qDyPWK7ftLvnpA2y',
    'pomegranate juice': 'https://www.youtube.com/embed/SQUKndmF088?si=XHVREpPDYINV4zMF',
    'sweet lime juice': 'https://www.youtube.com/embed/4ZBNi5y9U8k?si=50trAAWyrwWE5syt',
    'tomato chutney': 'https://www.youtube.com/embed/kCloVgmrARw?si=oXhnDDQX3OAN5BpE',
    'onion pakoda': 'https://www.youtube.com/embed/ref4lsPJ_r4?si=i8-twvqmth83M3tN',
    'spinach pakoda': 'https://www.youtube.com/embed/MybQXy5QU0g?si=b8ASf3zUEyDPnvUk',
    'kadai paneer': 'https://www.youtube.com/embed/nRPmoioNisI?si=iJfk05H7Jp2xCS63',
    'curd rice': 'https://www.youtube.com/embed/8EhJtAD2mqM?si=AQ2mBYPaGDX_xXcq',
    'khichdi': 'https://www.youtube.com/embed/TvTMsUeC-z4?si=XljzEp-Wd9fH3vSJ',
    'butter toast': 'https://www.youtube.com/embed/YFoGGwCOC64?si=vaIKiQupsyWdTEZH',
    'hot coffee': 'https://www.youtube.com/embed/JeXsKCySpGI?si=acdKdy9F_UdSUb8Q'
};

// --- LOCAL IMAGE MAPPER FOR ALL 40 PHOTOS IN Recipe_Images/ ---
const recipeImageMap = {
    'aloo gobi': 'Recipe_Images/aloo_gobi.jpeg',
    'aloo paratha': 'Recipe_Images/aloo_paratha.jpeg',
    'apple milkshake': 'Recipe_Images/apple_milkshake.jpeg',
    'banana smoothie': 'Recipe_Images/banana_smoothie.jpeg',
    'banana milkshake': 'Recipe_Images/banana_smoothie.jpeg',
    'boiled eggs': 'Recipe_Images/boiled_eggs.jpeg',
    'butter toast': 'Recipe_Images/butter_toast.jpeg',
    'capsicum masala': 'Recipe_Images/capsicum_masala.jpeg',
    'chapati': 'Recipe_Images/chapati.jpeg',
    'roti': 'Recipe_Images/chapati.jpeg',
    'cold coffee': 'Recipe_Images/cold_coffee.jpeg',
    'curd rice': 'Recipe_Images/curd_rice.jpeg',
    'dal tadka': 'Recipe_Images/dal_tadka.jpeg',
    'egg curry': 'Recipe_Images/egg_curry.jpeg',
    'french toast': 'Recipe_Images/french_toast.jpeg',
    'mixed fruit salad': 'Recipe_Images/fruit_salad.jpeg',
    'fruit salad': 'Recipe_Images/fruit_salad.jpeg',
    'garlic bread': 'Recipe_Images/garlic_bread.jpeg',
    'gobi paratha': 'Recipe_Images/gobi_paratha.jpeg',
    'hot coffee': 'Recipe_Images/hot_coffee.jpeg',
    'jeera rice': 'Recipe_Images/jeera_rice.jpeg',
    'kadai paneer': 'Recipe_Images/kadai_paneer.jpeg',
    'khichdi': 'Recipe_Images/khichdi.jpeg',
    'masala chai': 'Recipe_Images/masala_chai.jpeg',
    'masala omelette': 'Recipe_Images/masala_omelette.jpeg',
    'onion pakoda': 'Recipe_Images/onion_pakoda.jpeg',
    'palak paneer': 'Recipe_Images/palak_paneer.jpeg',
    'paneer bhurji': 'Recipe_Images/paneer_bhurji.jpeg',
    'paneer paratha': 'Recipe_Images/paneer_paratha.jpeg',
    'paneer sandwich': 'Recipe_Images/paneer_sandwich.jpeg',
    'paneer tikka': 'Recipe_Images/paneer_tikka.jpeg',
    'plain paratha': 'Recipe_Images/plain_paratha.jpeg',
    'pomegranate juice': 'Recipe_Images/pomegranate_juice.jpeg',
    'potato sandwich': 'Recipe_Images/potato_sandwich.jpeg',
    'salted lassi': 'Recipe_Images/salted_lassi.jpeg',
    'scrambled eggs': 'Recipe_Images/scrambled_eggs.jpeg',
    'spicy dal': 'Recipe_Images/spicy_dal.jpeg',
    'spinach dal': 'Recipe_Images/spinach_dal.jpeg',
    'spinach pakoda': 'Recipe_Images/spinach_pakoda.jpeg',
    'sweet lassi': 'Recipe_Images/sweet_lassi.jpeg',
    'sweet lime juice': 'Recipe_Images/sweet_lime_juice.jpeg',
    'tomato chutney': 'Recipe_Images/tomato_chutney.jpeg',
    'tomato soup': 'Recipe_Images/tomato_soup.jpeg'
};

function getRecipeImage(recipe) {
    const nameLower = (recipe.name || '').toLowerCase();
    for (const key in recipeImageMap) {
        if (nameLower.includes(key)) {
            return recipeImageMap[key];
        }
    }
    return recipe.img || 'km2.png';
}

// --- COMPLETE 40-RECIPE CATALOG MATCHING Recipe_Images FOLDER ---
const fallbackRecipesCatalog = [
    {
        id: 1, name: "Palak Paneer", time: "30 mins", calories: "340 kcal", img: "Recipe_Images/palak_paneer.jpeg",
        ingredients: ["Spinach (Palak)", "Fresh Paneer", "Red Onion", "Red Tomato", "Garlic", "Ginger", "Butter Block", "Cumin Seeds", "Turmeric", "Salt"],
        instructions: "Blanch 500g fresh spinach in boiling water for 2 minutes, then transfer to ice water and blend into a smooth puree.\nHeat butter in a pan, add cumin seeds, finely chopped garlic, ginger, and onions. Saute until golden.\nAdd chopped tomatoes, turmeric, and salt. Cook until tomatoes soften.\nPour in the spinach puree and simmer for 5 minutes.\nAdd cubed fresh paneer and simmer for 3 minutes before serving hot."
    },
    {
        id: 2, name: "Dal Tadka", time: "25 mins", calories: "260 kcal", img: "Recipe_Images/dal_tadka.jpeg",
        ingredients: ["Toor Dal", "Red Onion", "Red Tomato", "Garlic", "Ginger", "Green Chillies", "Butter Block", "Cumin Seeds", "Turmeric", "Red Chilli", "Salt"],
        instructions: "Wash and pressure cook Toor Dal with water, turmeric, and salt for 3-4 whistles until soft.\nHeat butter in a pan and crackle cumin seeds, chopped garlic, ginger, and green chillies.\nAdd chopped onions and tomatoes, cooking until soft.\nStir in red chilli powder, pour the tempering over the cooked dal, and simmer for 2 minutes."
    },
    {
        id: 3, name: "Tomato Soup", time: "20 mins", calories: "140 kcal", img: "Recipe_Images/tomato_soup.jpeg",
        ingredients: ["Red Tomato", "Red Onion", "Garlic", "Butter Block", "Black Pepper", "Sugar", "Salt"],
        instructions: "Melt butter in a saucepan and saute chopped garlic and onions until translucent.\nAdd roughly chopped red tomatoes, water, and salt. Cover and simmer for 12 minutes until mushy.\nBlend until smooth and strain through a sieve.\nReturn to the stove, season with black pepper and a pinch of sugar, and serve hot with a swirl of butter."
    },
    {
        id: 4, name: "Aloo Gobi", time: "25 mins", calories: "220 kcal", img: "Recipe_Images/aloo_gobi.jpeg",
        ingredients: ["Potatoes", "Cauliflower", "Red Onion", "Red Tomato", "Ginger", "Green Chillies", "Cumin Seeds", "Turmeric", "Red Chilli", "Salt"],
        instructions: "Cut potatoes into cubes and cauliflower into medium florets.\nHeat oil in a kadai, crackle cumin seeds, and saute onions, ginger, and green chillies.\nAdd potatoes, cauliflower, turmeric, and salt. Toss well and cover on low heat for 10 minutes.\nAdd chopped tomatoes and red chilli powder, cooking uncovered for 5-7 minutes until crisp-tender."
    },
    {
        id: 5, name: "Paneer Bhurji", time: "15 mins", calories: "310 kcal", img: "Recipe_Images/paneer_bhurji.jpeg",
        ingredients: ["Fresh Paneer", "Red Onion", "Red Tomato", "Capsicum", "Green Chillies", "Butter Block", "Cumin Seeds", "Turmeric", "Red Chilli", "Salt"],
        instructions: "Crumble fresh paneer by hand and set aside.\nHeat butter in a pan and crackle cumin seeds.\nSaute finely chopped onions and green chillies until translucent.\nAdd chopped tomatoes, capsicum, turmeric, red chilli, and salt. Cook for 3 minutes.\nAdd crumbled paneer, toss gently for 2-3 minutes, and serve hot."
    },
    {
        id: 6, name: "Masala Omelette", time: "10 mins", calories: "210 kcal", img: "Recipe_Images/masala_omelette.jpeg",
        ingredients: ["Eggs", "Red Onion", "Red Tomato", "Green Chillies", "Butter Block", "Turmeric", "Black Pepper", "Salt"],
        instructions: "Crack 2 eggs into a bowl and whisk until frothy.\nAdd finely chopped onion, tomato, green chillies, salt, turmeric, and black pepper.\nMelt butter in a pan over medium flame.\nPour in the egg mixture, cook for 2 minutes per side until golden, and serve hot."
    },
    {
        id: 7, name: "French Toast", time: "10 mins", calories: "270 kcal", img: "Recipe_Images/french_toast.jpeg",
        ingredients: ["Brown Bread", "Eggs", "Amul Taaza Milk", "Sugar", "Butter Block"],
        instructions: "Whisk eggs, milk, and sugar in a shallow bowl until sugar dissolves.\nHeat butter on a flat skillet over medium-low heat.\nDip slices of brown bread into the egg custard, coating both sides.\nToast on the skillet for 2 minutes per side until caramelized and golden brown."
    },
    {
        id: 8, name: "Masala Chai", time: "10 mins", calories: "120 kcal", img: "Recipe_Images/masala_chai.jpeg",
        ingredients: ["Amul Taaza Milk", "Tea Leaves", "Ginger", "Sugar"],
        instructions: "Crush fresh ginger and add it to 1 cup of boiling water.\nAdd tea leaves and sugar, simmering for 2 minutes.\nPour in milk and bring to a rolling boil.\nSimmer for 2 minutes until rich and aromatic, then strain into cups."
    },
    {
        id: 9, name: "Cold Coffee", time: "5 mins", calories: "180 kcal", img: "Recipe_Images/cold_coffee.jpeg",
        ingredients: ["Amul Taaza Milk", "Coffee Powder", "Sugar"],
        instructions: "Add coffee powder, sugar, and 2 tbsp warm water to a blender jar.\nBlend for 30 seconds until frothy.\nAdd chilled milk and ice cubes.\nBlend on high speed for 1 minute until creamy and frothy, then pour into a tall glass."
    },
    {
        id: 10, name: "Banana Smoothie", time: "5 mins", calories: "210 kcal", img: "Recipe_Images/banana_smoothie.jpeg",
        ingredients: ["Banana", "Amul Taaza Milk", "Curd (Dahi)", "Sugar"],
        instructions: "Peel and slice ripe bananas into a blender.\nAdd chilled milk, 2 tbsp fresh curd, and sugar.\nBlend on high speed for 45 seconds until thick and creamy.\nPour into chilled glasses and serve immediately."
    },
    {
        id: 11, name: "Jeera Rice", time: "20 mins", calories: "240 kcal", img: "Recipe_Images/jeera_rice.jpeg",
        ingredients: ["Basmati Rice", "Butter Block", "Cumin Seeds", "Green Chillies", "Salt"],
        instructions: "Wash and soak Basmati rice for 15 minutes, then drain.\nHeat butter in a pot and add generous cumin seeds and slit green chillies.\nAdd the soaked rice and gently saute for 1 minute.\nAdd 2 cups of water and salt, cover, and cook on low heat for 12 minutes until fluffy."
    },
    {
        id: 12, name: "Potato Sandwich", time: "15 mins", calories: "280 kcal", img: "Recipe_Images/potato_sandwich.jpeg",
        ingredients: ["Brown Bread", "Potatoes", "Red Onion", "Green Chillies", "Butter Block", "Turmeric", "Red Chilli", "Salt"],
        instructions: "Boil, peel, and mash potatoes in a bowl.\nHeat a little butter and saute chopped onions, green chillies, turmeric, red chilli, and salt, then mix with the mashed potatoes.\nSpread the spiced potato filling generously between slices of buttered brown bread.\nToast on a hot pan with butter until crisp and golden on both sides."
    },
    {
        id: 13, name: "Paneer Sandwich", time: "15 mins", calories: "320 kcal", img: "Recipe_Images/paneer_sandwich.jpeg",
        ingredients: ["Brown Bread", "Fresh Paneer", "Capsicum", "Red Onion", "Red Tomato", "Butter Block", "Black Pepper", "Salt"],
        instructions: "Crumble or finely cube fresh paneer in a mixing bowl.\nToss with finely diced capsicum, onion, tomato, black pepper, and salt.\nLayer the paneer filling between slices of brown bread.\nGrill or toast on a pan with butter until golden brown and crispy."
    },
    {
        id: 14, name: "Mixed Fruit Salad", time: "10 mins", calories: "150 kcal", img: "Recipe_Images/fruit_salad.jpeg",
        ingredients: ["Banana", "Apple", "Pomegranate", "Sweet Lime", "Black Pepper", "Salt"],
        instructions: "Wash and dice apples and bananas into bite-sized pieces.\nPeel and segment the sweet lime and extract fresh pomegranate pearls.\nCombine all fruits in a chilled bowl.\nSprinkle a pinch of black pepper and salt, toss gently, and serve fresh."
    },
    {
        id: 15, name: "Chapati", time: "15 mins", calories: "160 kcal", img: "Recipe_Images/chapati.jpeg",
        ingredients: ["Wheat Flour", "Butter Block", "Salt"],
        instructions: "Combine wheat flour, a pinch of salt, and warm water to knead a soft, pliable dough.\nDivide into small balls and roll into thin, even circles.\nCook on a hot tawa until small bubbles appear, flip, and puff directly over the flame.\nBrush lightly with butter and serve warm."
    },
    {
        id: 16, name: "Plain Paratha", time: "15 mins", calories: "230 kcal", img: "Recipe_Images/plain_paratha.jpeg",
        ingredients: ["Wheat Flour", "Butter Block", "Salt"],
        instructions: "Knead wheat flour, salt, and water into a smooth dough.\nRoll a dough ball into a circle, brush with melted butter, fold into a triangle, and roll out again.\nCook on a preheated tawa over medium heat.\nApply butter on both sides and press gently until flaky and golden brown."
    },
    {
        id: 17, name: "Aloo Paratha", time: "20 mins", calories: "290 kcal", img: "Recipe_Images/aloo_paratha.jpeg",
        ingredients: ["Wheat Flour", "Potatoes", "Red Onion", "Green Chillies", "Butter Block", "Cumin Seeds", "Red Chilli", "Salt"],
        instructions: "Knead wheat flour with water and salt into a soft dough.\nMix boiled mashed potatoes with finely chopped onion, green chillies, cumin seeds, red chilli, and salt.\nStuff the spiced potato filling inside a dough ball and roll out gently.\nRoast on a hot tawa with butter on both sides until crisp and golden."
    },
    {
        id: 18, name: "Paneer Paratha", time: "20 mins", calories: "340 kcal", img: "Recipe_Images/paneer_paratha.jpeg",
        ingredients: ["Wheat Flour", "Fresh Paneer", "Red Onion", "Green Chillies", "Ginger", "Butter Block", "Red Chilli", "Salt"],
        instructions: "Knead wheat flour with water and salt into a soft dough.\nGrate fresh paneer and mix with finely chopped onion, ginger, green chillies, red chilli, and salt.\nStuff the paneer mixture into a dough ball, seal edges, and roll evenly.\nRoast on a hot tawa with butter until golden brown spots appear on both sides."
    },
    {
        id: 19, name: "Gobi Paratha", time: "25 mins", calories: "260 kcal", img: "Recipe_Images/gobi_paratha.jpeg",
        ingredients: ["Wheat Flour", "Cauliflower", "Ginger", "Green Chillies", "Butter Block", "Cumin Seeds", "Red Chilli", "Salt"],
        instructions: "Finely grate cauliflower florets and squeeze out any excess moisture.\nMix grated cauliflower with ginger, green chillies, cumin seeds, red chilli, and salt.\nStuff into rolled wheat flour dough and roll out carefully.\nCook on a hot tawa with butter until crisp and golden brown."
    },
    {
        id: 20, name: "Spicy Dal", time: "25 mins", calories: "250 kcal", img: "Recipe_Images/spicy_dal.jpeg",
        ingredients: ["Toor Dal", "Red Onion", "Red Tomato", "Garlic", "Green Chillies", "Butter Block", "Cumin Seeds", "Turmeric", "Red Chilli", "Salt"],
        instructions: "Pressure cook Toor Dal with turmeric, water, and salt until soft.\nHeat butter in a pan and fry cumin seeds, extra garlic, and slit green chillies.\nAdd onions and tomatoes, cooking until oil separates.\nAdd red chilli powder, combine with the dal, and boil for 3 minutes."
    },
    {
        id: 21, name: "Garlic Bread", time: "12 mins", calories: "240 kcal", img: "Recipe_Images/garlic_bread.jpeg",
        ingredients: ["Brown Bread", "Garlic", "Butter Block", "Black Pepper", "Salt"],
        instructions: "Finely mince fresh garlic cloves and mix into softened butter with salt and black pepper.\nSpread the garlic butter generously over slices of brown bread.\nToast on a pan over low heat until the underside is crisp and golden."
    },
    {
        id: 22, name: "Boiled Eggs", time: "10 mins", calories: "140 kcal", img: "Recipe_Images/boiled_eggs.jpeg",
        ingredients: ["Eggs", "Black Pepper", "Salt"],
        instructions: "Place eggs gently in a saucepan and cover with cold water.\nBring to a rolling boil, cover with a lid, and simmer for 7-8 minutes.\nTransfer eggs to cold water for 2 minutes, then peel.\nHalve the boiled eggs and sprinkle with salt and freshly ground black pepper."
    },
    {
        id: 23, name: "Egg Curry", time: "25 mins", calories: "290 kcal", img: "Recipe_Images/egg_curry.jpeg",
        ingredients: ["Eggs", "Red Onion", "Red Tomato", "Ginger", "Garlic", "Green Chillies", "Cumin Seeds", "Turmeric", "Red Chilli", "Salt"],
        instructions: "Boil and peel 4 eggs, prick lightly, and pan-fry with a pinch of turmeric.\nSaute cumin seeds, finely chopped onions, ginger, garlic, and green chillies until golden brown.\nAdd pureed red tomatoes, turmeric, red chilli, and salt; cook until thick.\nAdd 1 cup warm water, simmer for 5 minutes, and add the boiled eggs."
    },
    {
        id: 24, name: "Scrambled Eggs", time: "8 mins", calories: "200 kcal", img: "Recipe_Images/scrambled_eggs.jpeg",
        ingredients: ["Eggs", "Amul Taaza Milk", "Butter Block", "Black Pepper", "Salt"],
        instructions: "Whisk eggs with 2 tbsp milk, salt, and black pepper until well combined.\nMelt butter in a non-stick skillet over low-medium heat.\nPour in the eggs and gently fold with a spatula as soft curds form.\nRemove from heat while still glossy and serve immediately."
    },
    {
        id: 25, name: "Apple Milkshake", time: "5 mins", calories: "195 kcal", img: "Recipe_Images/apple_milkshake.jpeg",
        ingredients: ["Apple", "Amul Taaza Milk", "Sugar"],
        instructions: "Peel, core, and chop fresh apples into cubes.\nAdd chopped apples, chilled milk, and sugar to a blender.\nBlend on high speed for 1 minute until smooth and frothy.\nPour into chilled glasses and serve immediately."
    },
    {
        id: 26, name: "Paneer Tikka", time: "25 mins", calories: "330 kcal", img: "Recipe_Images/paneer_tikka.jpeg",
        ingredients: ["Fresh Paneer", "Curd (Dahi)", "Capsicum", "Red Onion", "Ginger", "Garlic", "Butter Block", "Turmeric", "Red Chilli", "Black Pepper", "Salt"],
        instructions: "Whisk thick curd with minced ginger, garlic, turmeric, red chilli, black pepper, and salt.\nCut fresh paneer, capsicum, and onion into cubes and coat evenly in the marinade for 15 minutes.\nSkewer or arrange on a hot buttered grill pan.\nRoast on high heat, basting with butter until charred on the edges."
    },
    {
        id: 27, name: "Capsicum Masala", time: "20 mins", calories: "210 kcal", img: "Recipe_Images/capsicum_masala.jpeg",
        ingredients: ["Capsicum", "Red Onion", "Red Tomato", "Ginger", "Garlic", "Cumin Seeds", "Turmeric", "Red Chilli", "Salt"],
        instructions: "Dice capsicum into cubes and set aside.\nSaute cumin seeds, finely chopped onions, ginger, and garlic in a pan.\nAdd chopped tomatoes, turmeric, red chilli, and salt, cooking into a rich masala.\nToss in the diced capsicum and cook covered for 6-8 minutes until tender."
    },
    {
        id: 28, name: "Spinach Dal", time: "25 mins", calories: "270 kcal", img: "Recipe_Images/spinach_dal.jpeg",
        ingredients: ["Toor Dal", "Spinach (Palak)", "Red Onion", "Red Tomato", "Garlic", "Ginger", "Green Chillies", "Butter Block", "Cumin Seeds", "Turmeric", "Salt"],
        instructions: "Pressure cook Toor Dal with turmeric and salt until soft.\nHeat butter in a pan and saute cumin seeds, garlic, ginger, green chillies, and onions.\nAdd chopped tomatoes and finely chopped fresh spinach; cook until spinach wilts.\nPour in the cooked dal and simmer together for 5 minutes."
    },
    {
        id: 29, name: "Sweet Lassi", time: "5 mins", calories: "175 kcal", img: "Recipe_Images/sweet_lassi.jpeg",
        ingredients: ["Curd (Dahi)", "Amul Taaza Milk", "Sugar"],
        instructions: "Add chilled fresh curd, a splash of milk, sugar, and ice cubes to a blender.\nChurn or blend for 45 seconds until thick, smooth, and frothy on top.\nPour into tall glasses and serve chilled."
    },
    {
        id: 30, name: "Salted Lassi", time: "5 mins", calories: "130 kcal", img: "Recipe_Images/salted_lassi.jpeg",
        ingredients: ["Curd (Dahi)", "Cumin Seeds", "Black Pepper", "Salt"],
        instructions: "Dry roast cumin seeds on a pan for 1 minute and crush into a coarse powder.\nWhisk chilled curd with cold water, salt, and black pepper until smooth.\nPour into glasses and garnish with the roasted cumin powder."
    },
    {
        id: 31, name: "Pomegranate Juice", time: "8 mins", calories: "135 kcal", img: "Recipe_Images/pomegranate_juice.jpeg",
        ingredients: ["Pomegranate", "Sugar", "Black Pepper", "Salt"],
        instructions: "Peel pomegranates and collect fresh arils in a blender jar.\nPulse 3-4 times with a splash of water and a tsp of sugar (avoid over-blending seeds).\nStrain through a fine mesh strainer pressing with a spoon.\nAdd a pinch of salt and black pepper and serve chilled."
    },
    {
        id: 32, name: "Sweet Lime Juice", time: "8 mins", calories: "115 kcal", img: "Recipe_Images/sweet_lime_juice.jpeg",
        ingredients: ["Sweet Lime", "Sugar", "Black Pepper", "Salt"],
        instructions: "Peel sweet limes, remove seeds, and place segments into a juicer or blender.\nPulse briefly with a little sugar and water, then strain cleanly.\nSeason with a pinch of salt and black pepper and serve over ice."
    },
    {
        id: 33, name: "Tomato Chutney", time: "15 mins", calories: "125 kcal", img: "Recipe_Images/tomato_chutney.jpeg",
        ingredients: ["Red Tomato", "Red Onion", "Garlic", "Green Chillies", "Cumin Seeds", "Red Chilli", "Salt"],
        instructions: "Saute cumin seeds, garlic cloves, green chillies, and chopped onions until soft.\nAdd ripe chopped tomatoes, red chilli powder, and salt; cook until mushy.\nCool completely and grind into a coarse, tangy chutney."
    },
    {
        id: 34, name: "Onion Pakoda", time: "20 mins", calories: "260 kcal", img: "Recipe_Images/onion_pakoda.jpeg",
        ingredients: ["Red Onion", "Wheat Flour", "Green Chillies", "Ginger", "Cumin Seeds", "Turmeric", "Red Chilli", "Salt"],
        instructions: "Thinly slice red onions and toss with salt so they release moisture.\nAdd finely chopped green chillies, ginger, cumin seeds, turmeric, red chilli, and flour to bind.\nDrop small clusters into hot oil and fry on medium heat until crisp and golden brown."
    },
    {
        id: 35, name: "Spinach Pakoda", time: "20 mins", calories: "245 kcal", img: "Recipe_Images/spinach_pakoda.jpeg",
        ingredients: ["Spinach (Palak)", "Red Onion", "Wheat Flour", "Green Chillies", "Cumin Seeds", "Turmeric", "Red Chilli", "Salt"],
        instructions: "Wash and roughly chop fresh spinach leaves.\nMix with sliced onions, green chillies, cumin seeds, turmeric, red chilli, salt, and flour.\nSprinkle a little water to form a thick batter and fry spoonfuls until crispy."
    },
    {
        id: 36, name: "Kadai Paneer", time: "30 mins", calories: "360 kcal", img: "Recipe_Images/kadai_paneer.jpeg",
        ingredients: ["Fresh Paneer", "Capsicum", "Red Onion", "Red Tomato", "Ginger", "Garlic", "Green Chillies", "Butter Block", "Cumin Seeds", "Turmeric", "Red Chilli", "Black Pepper", "Salt"],
        instructions: "Lightly toss cubed paneer, diced capsicum, and onion petals in butter for 2 minutes and set aside.\nIn the same kadai, crackle cumin seeds and saute ginger, garlic, and chopped onions.\nAdd tomato puree, turmeric, red chilli, crushed black pepper, and salt; cook until thick.\nFold in the sautéed paneer and capsicum and simmer for 3 minutes."
    },
    {
        id: 37, name: "Curd Rice", time: "15 mins", calories: "230 kcal", img: "Recipe_Images/curd_rice.jpeg",
        ingredients: ["Basmati Rice", "Curd (Dahi)", "Amul Taaza Milk", "Ginger", "Green Chillies", "Cumin Seeds", "Pomegranate", "Salt"],
        instructions: "Cook Basmati rice until soft and mash lightly while warm.\nMix in fresh curd, a splash of milk, and salt until creamy.\nTemper cumin seeds, finely chopped ginger, and green chillies in a little oil and pour over the rice.\nGarnish with fresh pomegranate pearls and serve cool."
    },
    {
        id: 38, name: "Khichdi", time: "20 mins", calories: "265 kcal", img: "Recipe_Images/khichdi.jpeg",
        ingredients: ["Basmati Rice", "Toor Dal", "Butter Block", "Cumin Seeds", "Ginger", "Turmeric", "Black Pepper", "Salt"],
        instructions: "Wash equal parts Basmati rice and Toor Dal together.\nHeat butter in a pressure cooker and crackle cumin seeds, black pepper, and grated ginger.\nAdd the rice-dal mixture, turmeric, salt, and 4 cups of water.\nPressure cook for 3 whistles until comforting and porridge-like, then top with melted butter."
    },
    {
        id: 39, name: "Butter Toast", time: "5 mins", calories: "170 kcal", img: "Recipe_Images/butter_toast.jpeg",
        ingredients: ["Brown Bread", "Butter Block"],
        instructions: "Heat a flat skillet or toaster over medium heat.\nToast slices of brown bread until crisp and golden brown on both sides.\nGenerously slather softened butter over the hot toast and serve immediately."
    },
    {
        id: 40, name: "Hot Coffee", time: "5 mins", calories: "130 kcal", img: "Recipe_Images/hot_coffee.jpeg",
        ingredients: ["Amul Taaza Milk", "Coffee Powder", "Sugar"],
        instructions: "Add coffee powder, sugar, and 1 tbsp hot water to a mug.\nBeat vigorously with a spoon for 2 minutes until pale and frothy.\nPour boiling hot milk from a height and stir gently to create a rich foam top."
    }
];

function getLocalPantry() {
    const saved = localStorage.getItem('smartRecipePantry');
    if (saved) return JSON.parse(saved);
    const defaultStock = [
        "Amul Taaza Milk", "Coffee Powder", "Sugar", "Tea Leaves", "Ginger",
        "Brown Bread", "Garlic", "Butter Block", "Black Pepper", "Salt",
        "Red Onion", "Red Tomato", "Green Chillies", "Turmeric", "Cumin Seeds",
        "Eggs", "Potatoes", "Wheat Flour", "Curd (Dahi)", "Basmati Rice"
    ];
    localStorage.setItem('smartRecipePantry', JSON.stringify(defaultStock));
    return defaultStock;
}

// --- FETCH RECIPES FROM JAVA BACKEND (OR LOCAL 40-RECIPE ENGINE) ---
async function fetchSmartRecipes() {
    const statusEl = document.getElementById('backend-status');
    try {
        const response = await fetch(`${API_BASE}/recipes/smart-match/${DEFAULT_USER_ID}`);
        if (response.ok) {
            const data = await response.json();
            // Ensure local Recipe_Images/*.jpeg paths are always applied
            recipesDB = data.map(r => ({ ...r, img: getRecipeImage(r) }));
            backendConnected = true;
            statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Connected to Java + MySQL (${recipesDB.length} Recipes)`;
            const pantryRes = await fetch(`${API_BASE}/pantry/${DEFAULT_USER_ID}`);
            if (pantryRes.ok) {
                const pantryList = await pantryRes.json();
                localStorage.setItem('smartRecipePantry', JSON.stringify(pantryList));
            }
            updatePantryCountUI();
            renderRecipes();
            return;
        }
    } catch (error) {
        backendConnected = false;
    }

    statusEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400"></span> 40 Recipes Loaded from Recipe_Images`;
    computeLocalSmartMatch();
    updatePantryCountUI();
    renderRecipes();
}

function computeLocalSmartMatch() {
    const pantry = getLocalPantry().map(i => i.toLowerCase());
    recipesDB = fallbackRecipesCatalog.map(r => {
        const missing = r.ingredients.filter(ing => !pantry.includes(ing.toLowerCase()));
        const haveCount = r.ingredients.length - missing.length;
        const totalCount = r.ingredients.length;
        const matchPercent = Math.round((haveCount / totalCount) * 100);
        return {
            ...r,
            img: getRecipeImage(r),
            haveCount,
            totalCount,
            matchPercent,
            ready: missing.length === 0,
            missingIngredients: missing
        };
    }).sort((a, b) => b.matchPercent - a.matchPercent);
}

// --- COOKING MODAL & YOUTUBE ROUTER ---
function openCookingModal(recipeId, mode) {
    const recipe = recipesDB.find(r => r.id === recipeId);
    if (!recipe) return;

    resetTimer();

    document.getElementById('modal-title').innerText = recipe.name;
    document.getElementById('modal-img').src = getRecipeImage(recipe);

    const badge = document.getElementById('modal-badge');
    if (mode === 'cook') {
        badge.innerText = "Cooking Mode";
        badge.className = "inline-block px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-2 shadow-lg";
    } else {
        badge.innerText = "Recipe Viewer";
        badge.className = "inline-block px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-bold uppercase tracking-widest mb-2 shadow-lg";
    }

    // Intelligent YouTube Router
    const recipeNameLower = recipe.name.toLowerCase();
    let videoUrl = recipe.videoUrl || `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(recipe.name + ' recipe Indian')}`;

    for (const key in recipeVideoMap) {
        if (recipeNameLower.includes(key)) {
            videoUrl = recipeVideoMap[key];
            break;
        }
    }
    document.getElementById('modal-video').src = videoUrl;

    // Ingredient Status Alert
    const alertBox = document.getElementById('modal-missing-alert');
    if (recipe.missingIngredients && recipe.missingIngredients.length > 0) {
        alertBox.innerHTML = `<span class="font-bold block mb-1"><i class="ph-bold ph-warning-circle"></i> Missing Ingredients</span> You need to buy: ${recipe.missingIngredients.join(', ')}.`;
        alertBox.className = 'mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300';
    } else {
        alertBox.innerHTML = `<span class="font-bold block mb-1"><i class="ph-bold ph-check-circle"></i> All Set!</span> You have all the ingredients needed for this recipe in your inventory.`;
        alertBox.className = 'mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400';
    }

    // Step-by-Step Instructions
    let instructionsHtml = '';
    if (recipe.instructions) {
        const steps = recipe.instructions.split('\n').filter(s => s.trim() !== '');
        steps.forEach((step, index) => {
            instructionsHtml += `
                <div class="flex gap-4 group cursor-pointer transition-all mb-4" onclick="this.classList.toggle('active-step')">
                    <div class="flex flex-col items-center">
                        <div class="step-num w-8 h-8 rounded-full bg-slate-800 text-gray-400 flex items-center justify-center font-bold text-sm border border-white/10 group-hover:bg-green-500 group-hover:text-white group-hover:border-green-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-300 shrink-0">
                            ${index + 1}
                        </div>
                        ${index !== steps.length - 1 ? `<div class="step-line w-[2px] h-full bg-white/5 mt-2 group-hover:bg-green-500/30 transition-colors duration-300 min-h-[30px]"></div>` : ''}
                    </div>
                    <div class="pt-1 flex-1">
                        <p class="step-text text-gray-400 text-sm leading-relaxed group-hover:text-gray-200 transition-colors">${step.trim()}</p>
                    </div>
                </div>
            `;
        });
    }
    document.getElementById('modal-instructions').innerHTML = instructionsHtml;

    // Modal Footer Buttons
    let footerHtml = '';
    if (mode === 'cook') {
        footerHtml = `<button onclick="closeCookingModal()" class="px-8 py-2.5 bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20 border border-green-500/50 rounded-xl text-sm font-bold transition-colors text-white">Finish & Close</button>`;
    } else if (recipe.ready) {
        footerHtml = `
            <button onclick="closeCookingModal()" class="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors text-gray-300">Cancel</button>
            <button onclick="openCookingModal(${recipe.id}, 'cook')" class="px-8 py-2.5 bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20 border border-green-500/50 rounded-xl text-sm font-bold transition-colors text-white">Start Cooking</button>
        `;
    } else {
        footerHtml = `
            <button onclick="closeCookingModal()" class="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors text-gray-300">Cancel</button>
            <button onclick="addMissingToCart(${recipe.id}); closeCookingModal();" class="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 border border-blue-500/50 rounded-xl text-sm font-bold transition-colors text-white"><i class="ph-bold ph-shopping-cart-plus"></i> Buy Missing Items</button>
        `;
    }
    document.getElementById('modal-footer-actions').innerHTML = footerHtml;
    document.getElementById('cookingModal').classList.add('active');
}

function closeCookingModal() {
    document.getElementById('cookingModal').classList.remove('active');
    setTimeout(() => { document.getElementById('modal-video').src = ''; }, 300);
    resetTimer();
}

// --- PANTRY MANAGER MODAL ---
function openPantryModal() {
    renderPantryGrid();
    document.getElementById('pantryModal').classList.add('active');
}

function closePantryModal() {
    document.getElementById('pantryModal').classList.remove('active');
    fetchSmartRecipes();
}

function renderPantryGrid() {
    const pantry = getLocalPantry();
    const grid = document.getElementById('pantry-grid');
    grid.innerHTML = '';

    dashboardItems.forEach(item => {
        const hasItem = pantry.some(p => p.toLowerCase() === item.name.toLowerCase());
        grid.innerHTML += `
            <button onclick="togglePantryIngredient('${item.name}')"
                class="p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    hasItem
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-lg shadow-emerald-500/5'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }">
                <div class="truncate pr-2">
                    <p class="text-xs font-bold truncate">${item.name}</p>
                    <p class="text-[10px] opacity-60 capitalize">${item.category} • ₹${item.price}</p>
                </div>
                <i class="ph-bold ${hasItem ? 'ph-check-circle text-emerald-400' : 'ph-circle text-gray-600'} text-lg shrink-0"></i>
            </button>
        `;
    });

    document.getElementById('pantry-summary').innerText = `${pantry.length} of ${dashboardItems.length} ingredients currently in stock`;
    updatePantryCountUI();
}

async function togglePantryIngredient(ingredientName) {
    let pantry = getLocalPantry();
    const idx = pantry.findIndex(p => p.toLowerCase() === ingredientName.toLowerCase());
    if (idx > -1) {
        pantry.splice(idx, 1);
    } else {
        pantry.push(ingredientName);
    }
    localStorage.setItem('smartRecipePantry', JSON.stringify(pantry));

    if (backendConnected) {
        try {
            await fetch(`${API_BASE}/pantry/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: DEFAULT_USER_ID, ingredient: ingredientName })
            });
        } catch (e) {
            console.log("Updated locally");
        }
    }
    renderPantryGrid();
}

function updatePantryCountUI() {
    const count = getLocalPantry().length;
    const badge = document.getElementById('sidebar-pantry-count');
    if (badge) badge.innerText = count;
}

// --- SHOPPING CART MODAL ---
function addMissingToCart(recipeId) {
    const recipe = recipesDB.find(r => r.id === recipeId);
    if (!recipe || !recipe.missingIngredients) return;

    let cart = JSON.parse(localStorage.getItem('kitchenCart')) || [];

    recipe.missingIngredients.forEach(missingName => {
        let trueProduct = dashboardItems.find(item => item.name.toLowerCase() === missingName.toLowerCase());
        let finalName = trueProduct ? trueProduct.name : missingName;
        let finalPrice = trueProduct ? trueProduct.price : 50;
        let finalWeight = trueProduct ? trueProduct.weight : '1 unit';

        let existingItem = cart.find(i => i.name.toLowerCase() === finalName.toLowerCase());
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({
                id: Math.floor(Math.random() * 10000),
                name: finalName,
                weight: finalWeight,
                price: finalPrice,
                qty: 1
            });
        }
    });

    localStorage.setItem('kitchenCart', JSON.stringify(cart));
    initCart();
    openCartModal();
}

function openCartModal() {
    renderCartModal();
    document.getElementById('cartModal').classList.add('active');
}

function closeCartModal() {
    document.getElementById('cartModal').classList.remove('active');
}

function renderCartModal() {
    const cart = JSON.parse(localStorage.getItem('kitchenCart')) || [];
    const list = document.getElementById('cart-items-list');
    const totalEl = document.getElementById('cart-total-price');

    if (cart.length === 0) {
        list.innerHTML = `<div class="text-center py-12 text-gray-500"><i class="ph-duotone ph-shopping-bag text-4xl mb-2 block"></i>Your shopping list is empty.</div>`;
        totalEl.innerText = '₹0';
        return;
    }

    let total = 0;
    list.innerHTML = '';
    cart.forEach(item => {
        total += item.price * item.qty;
        list.innerHTML += `
            <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                    <p class="text-sm font-bold text-white">${item.name}</p>
                    <p class="text-xs text-gray-400">${item.weight} • ₹${item.price}</p>
                </div>
                <span class="text-xs font-bold bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg">Qty: ${item.qty}</span>
            </div>
        `;
    });
    totalEl.innerText = `₹${total}`;
}

function clearCart() {
    localStorage.removeItem('kitchenCart');
    initCart();
    renderCartModal();
}

async function checkoutToPantry() {
    const cart = JSON.parse(localStorage.getItem('kitchenCart')) || [];
    if (cart.length === 0) return;

    let pantry = getLocalPantry();
    for (const item of cart) {
        if (!pantry.some(p => p.toLowerCase() === item.name.toLowerCase())) {
            pantry.push(item.name);
            if (backendConnected) {
                try {
                    await fetch(`${API_BASE}/pantry/toggle`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: DEFAULT_USER_ID, ingredient: item.name })
                    });
                } catch (e) {}
            }
        }
    }
    localStorage.setItem('smartRecipePantry', JSON.stringify(pantry));
    clearCart();
    closeCartModal();
    fetchSmartRecipes();
}

// --- FILTER & RENDER RECIPES GRID ---
function filterRecipes(type, btnElement) {
    activeFilter = type;
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b => b.className = 'filter-btn px-4 py-2 rounded-full text-xs font-medium bg-white/5 text-gray-400 hover:text-white border border-white/5 transition-all');
    if (btnElement) btnElement.className = 'filter-btn px-4 py-2 rounded-full text-xs font-medium bg-green-500 text-white shadow-lg shadow-green-500/20 transition-all';
    renderRecipes();
}

function renderRecipes() {
    const grid = document.getElementById('recipe-grid');
    const searchInput = document.getElementById('recipe-search');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    grid.innerHTML = '';

    recipesDB.forEach(recipe => {
        if (activeFilter === 'ready' && !recipe.ready) return;
        if (activeFilter === 'missing' && recipe.ready) return;
        const matchesName = recipe.name.toLowerCase().includes(search);
        const matchesIng = recipe.ingredients && recipe.ingredients.some(i => i.toLowerCase().includes(search));
        if (!matchesName && !matchesIng) return;

        const imgSrc = getRecipeImage(recipe);

        let statusBadge = '';
        let progressColor = 'bg-orange-500';

        if (recipe.ready) {
            statusBadge = `<span class="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg shadow-green-500/20 flex items-center gap-1"><i class="ph-bold ph-check"></i> Ready</span>`;
            progressColor = 'bg-green-500';
        } else if (recipe.matchPercent > 50) {
            statusBadge = `<span class="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg shadow-orange-500/20">Missing ${recipe.missingIngredients.length} Items</span>`;
        } else {
            statusBadge = `<span class="absolute top-3 right-3 bg-slate-700 text-gray-300 text-[10px] font-bold px-2 py-1 rounded-lg border border-white/10">Needs Shopping</span>`;
            progressColor = 'bg-red-500';
        }

        let cardActionsHtml = '';
        if (recipe.ready) {
            cardActionsHtml = `
                <button onclick="openCookingModal(${recipe.id}, 'cook')" class="w-full py-2.5 mb-2 rounded-xl bg-green-500 hover:bg-green-400 text-white text-xs font-bold transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"><i class="ph-bold ph-play"></i> Start Cooking</button>
                <button onclick="openCookingModal(${recipe.id}, 'view')" class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2"><i class="ph-bold ph-book-open"></i> See Recipe</button>
            `;
        } else {
            cardActionsHtml = `
                <button onclick="addMissingToCart(${recipe.id})" class="w-full py-2.5 mb-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"><i class="ph-bold ph-shopping-cart-plus"></i> Add Missing to Cart</button>
                <button onclick="openCookingModal(${recipe.id}, 'view')" class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2"><i class="ph-bold ph-book-open"></i> See Recipe</button>
            `;
        }

        grid.innerHTML += `
            <div class="recipe-card glass-panel rounded-2xl overflow-hidden flex flex-col h-full group relative">
                <div class="h-40 overflow-hidden relative">
                    <img src="${imgSrc}" onerror="this.src='km2.png'" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80"></div>
                    ${statusBadge}
                </div>

                <div class="p-5 flex-1 flex flex-col">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-bold text-white group-hover:text-green-400 transition-colors">${recipe.name}</h3>
                    </div>

                    <div class="flex items-center gap-4 text-[11px] text-gray-400 mb-4">
                        <span class="flex items-center gap-1"><i class="ph-fill ph-clock"></i> ${recipe.time}</span>
                        <span class="flex items-center gap-1"><i class="ph-fill ph-fire"></i> ${recipe.calories}</span>
                    </div>

                    <div class="mb-4">
                        <div class="flex justify-between text-[11px] mb-1.5">
                            <span class="text-gray-400">Inventory Match</span>
                            <span class="${recipe.ready ? 'text-green-400' : 'text-white'} font-medium">${recipe.haveCount}/${recipe.totalCount} items</span>
                        </div>
                        <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div class="h-full ${progressColor} rounded-full transition-all duration-500" style="width: ${recipe.matchPercent}%"></div>
                        </div>
                        ${recipe.missingIngredients && recipe.missingIngredients.length > 0 ? `
                            <div class="mt-2 text-[10px] text-red-300 bg-red-500/10 border border-red-500/20 p-2 rounded">
                                <span class="font-bold">Missing:</span> ${recipe.missingIngredients.slice(0, 3).join(", ")}${recipe.missingIngredients.length > 3 ? ` +${recipe.missingIngredients.length - 3} more` : ''}
                            </div>
                        ` : ''}
                    </div>

                    <div class="mt-auto pt-4 border-t border-white/5">
                        ${cardActionsHtml}
                    </div>
                </div>
            </div>
        `;
    });

    if (grid.innerHTML === '') {
        grid.innerHTML = `<div class="col-span-full py-20 text-center text-gray-500"><i class="ph-duotone ph-cookie text-4xl mb-4 block"></i>No recipes found.</div>`;
    }
}

function initCart() {
    const cart = JSON.parse(localStorage.getItem('kitchenCart')) || [];
    document.getElementById('cart-count').innerText = cart.reduce((acc, item) => acc + item.qty, 0);
}

// Initialize Application
fetchSmartRecipes();
initCart();