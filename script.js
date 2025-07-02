const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    const deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
    return deck;
}

let deck = [];

// Berechnet den Wert einer Karte
function getCardValue(card) {
    if (card.value === 'A') {
        return 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
        return 10;
    } else {
        return parseInt(card.value, 10);
    }
}

// Berechnet den Wert einer Hand (Array von Karten)
function getHandValue(hand) {
    let value = 0;
    let aceCount = 0;

    for (let card of hand) {
        let cardValue = getCardValue(card);
        value += cardValue;
        if (card.value === 'A') aceCount++;
    }

    // Passe Ass-Wert an, falls nötig (Ass kann auch 1 zählen)
    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }

    return value;
}

// Deck mischen
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Spieler- und Dealer-Hand
let playerHand = [];
let dealerHand = [];

// Karte ziehen
function drawCard(hand) {
    if (deck.length === 0) return;
    hand.push(deck.pop());
    updateUI();

    if (hand === playerHand && getHandValue(playerHand) > 21) {
        document.getElementById('message').textContent = 'Du hast verloren! (Überkauft)';
        document.getElementById('hit-btn').disabled = true;
        document.getElementById('stand-btn').disabled = true;
    }
}

// Gibt den Dateinamen für das Kartenbild zurück (z.B. "AS.png" für Ass Pik)
function getCardImage(card) {
    // Mapping für Farben und Werte zu Dateinamen
    const suitMap = {
        'spades': 'S',
        'hearts': 'H',
        'diamonds': 'D',
        'clubs': 'C'
    };
    // Beispiel: /assets/img/cards/AS.svg (Ass Pik), /assets/img/cards/10H.svg (10 Herz)
    return `/assets/img/cards/${card.value}${suitMap[card.suit]}.svg`;
}

// Gibt HTML für eine Hand zurück (Karten als <img>)
function handToHTML(hand) {
    return hand.map(card =>
        `<img src="${getCardImage(card)}" alt="${card.value} ${card.suit}" style="height:150px;">`
    ).join('');
}

// UI aktualisieren
function updateUI() {
    document.getElementById('player-hand').innerHTML = handToHTML(playerHand);
    document.getElementById('player-value').textContent = getHandValue(playerHand);
    document.getElementById('dealer-hand').innerHTML = handToHTML(dealerHand);
    document.getElementById('dealer-value').textContent = getHandValue(dealerHand);
}

// Event Listener für "Karte ziehen"
document.getElementById('hit-btn').addEventListener('click', function() {
    drawCard(playerHand);
});

// Funktion für "Passen" (Stand)
function stand() {
    // Dealer zieht Karten bis mindestens 17 Punkte
    while (getHandValue(dealerHand) < 17) {
        drawCard(dealerHand);
    }

    // Ergebnis anzeigen
    const playerValue = getHandValue(playerHand);
    const dealerValue = getHandValue(dealerHand);
    let message = '';

    if (playerValue > 21) {
        message = 'Du hast verloren! (Überkauft)';
    } else if (dealerValue > 21) {
        message = 'Dealer überkauft! Du gewinnst!';
    } else if (playerValue > dealerValue) {
        message = 'Du gewinnst!';
    } else if (playerValue < dealerValue) {
        message = 'Dealer gewinnt!';
    } else {
        message = 'Unentschieden!';
    }

    document.getElementById('message').textContent = message;

    // Buttons deaktivieren
    document.getElementById('hit-btn').disabled = true;
    document.getElementById('stand-btn').disabled = true;
}

// Event Listener für "Passen"
document.getElementById('stand-btn').addEventListener('click', stand);

// Spielstart initialisieren
function startGame() {
    deck = createDeck();
    shuffleDeck(deck);
    playerHand = [];
    dealerHand = [];
    drawCard(playerHand);
    drawCard(playerHand);
    drawCard(dealerHand);
    updateUI();

    document.getElementById('hit-btn').disabled = false;
    document.getElementById('stand-btn').disabled = false;
    document.getElementById('message').textContent = '';
}

startGame();