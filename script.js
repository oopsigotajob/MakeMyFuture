const icons = [
  { id: 'technik', emoji: '⚙️', label: 'Technik' },
  { id: 'kreativ', emoji: '🎨', label: 'Kreativ' },
  { id: 'kommunikation', emoji: '💬', label: 'Kommunikation' },
  { id: 'natur', emoji: '🌿', label: 'Natur' },
  { id: 'zahlen', emoji: '🔢', label: 'Zahlen' },
  { id: 'hilfe', emoji: '🤝', label: 'Hilfe' },
];

const berufe = [
  { name: 'Ingenieur', icons: ['technik', 'zahlen'] },
  { name: 'Grafikdesigner', icons: ['kreativ'] },
  { name: 'Journalist', icons: ['kommunikation'] },
  { name: 'Förster', icons: ['natur'] },
  { name: 'Buchhalter', icons: ['zahlen'] },
  { name: 'Sozialarbeiter', icons: ['hilfe'] },
  { name: 'Softwareentwickler', icons: ['technik', 'zahlen'] },
  { name: 'Lehrer', icons: ['kommunikation', 'hilfe'] },
];

let currentIndex = 0;
const likedIcons = new Set();
const dislikedIcons = new Set();

const swipeContainer = document.getElementById('swipe-container');
const likeBtn = document.getElementById('like-btn');
const dislikeBtn = document.getElementById('dislike-btn');
const resultContainer = document.getElementById('result-container');
const resultList = document.getElementById('result-list');

function createCard(icon) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = icon.id;
  card.innerHTML = `
    <div style="font-size: 4rem;">${icon.emoji}</div>
    <h2>${icon.label}</h2>
  `;
  return card;
}

function showNextCard() {
  swipeContainer.innerHTML = '';
  if (currentIndex >= icons.length) {
    showResults();
    return;
  }
  const card = createCard(icons[currentIndex]);
  swipeContainer.appendChild(card);
}

function showResults() {
  swipeContainer.style.display = 'none';
  likeBtn.style.display = 'none';
  dislikeBtn.style.display = 'none';
  resultContainer.style.display = 'block';

  // Matching: Zeige Berufe, die mindestens ein geliktes Icon enthalten
  const matchedBerufe = berufe.filter(beruf =>
    beruf.icons.some(iconId => likedIcons.has(iconId))
  );

  if (matchedBerufe.length === 0) {
    resultList.innerHTML = '<li>Keine passenden Berufe gefunden.</li>';
  } else {
    resultList.innerHTML = '';
    matchedBerufe.forEach(beruf => {
      const li = document.createElement('li');
      li.textContent = beruf.name;
      resultList.appendChild(li);
    });
  }
}

likeBtn.addEventListener('click', () => {
  if (currentIndex < icons.length) {
    likedIcons.add(icons[currentIndex].id);
    currentIndex++;
    showNextCard();
  }
});

dislikeBtn.addEventListener('click', () => {
  if (currentIndex < icons.length) {
    dislikedIcons.add(icons[currentIndex].id);
    currentIndex++;
    showNextCard();
  }
});

// Starte mit der ersten Karte
showNextCard();
