const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let deck = [];
let playerHand = [];
let dealerHand = [];
let dealerTurn = false;

/**
 * Creates a new deck of 52 cards.
 * @returns {Array} The deck as an array of card objects.
 */
function createDeck() {
    const deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
    return deck;
}

/**
 * Returns the numeric value of a card.
 * @param {Object} card - The card object.
 * @returns {number} The value of the card.
 */
function getCardValue(card) {
    if (card.value === 'A') {
        return 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
        return 10;
    } else {
        return parseInt(card.value, 10);
    }
}

/**
 * Calculates the total value of a hand.
 * @param {Array} hand - Array of card objects.
 * @returns {number} The total value of the hand.
 */
function getHandValue(hand) {
    let value = 0, aceCount = 0;
    for (let card of hand) {
        let cardValue = getCardValue(card);
        value += cardValue;
        if (card.value === 'A') aceCount++;
    }
    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }
    return value;
}

/**
 * Shuffles the deck in place.
 * @param {Array} deck - The deck to shuffle.
 */
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

/**
 * Draws a card from the deck and adds it to the given hand.
 * @param {Array} hand - The hand to add the card to.
 */
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

/**
 * Returns the image path for a given card.
 * @param {Object} card - The card object.
 * @returns {string} The image path for the card.
 */
function getCardImage(card) {
    const suitMap = {
        'spades': 'S',
        'hearts': 'H',
        'diamonds': 'D',
        'clubs': 'C'
    };
    return `/assets/img/cards/${card.value}${suitMap[card.suit]}.svg`;
}

/**
 * Returns HTML for a hand as a string of <img> tags.
 * @param {Array} hand - Array of card objects.
 * @param {boolean} [showDealerHoleCard=false] - If true, shows the dealer's second card face down.
 * @returns {string} HTML string for the hand.
 */
function handToHTML(hand, showDealerHoleCard = false) {
    return hand.map((card, idx) => {
        if (showDealerHoleCard && idx === 1) {
            return `<img src="/assets/img/cards/EmptyCard.svg" alt="Hidden card" style="height:150px;">`;
        }
        return `<img src="${getCardImage(card)}" alt="${card.value} ${card.suit}" style="height:150px;">`;
    }).join('');
}

/**
 * Updates the UI to reflect the current game state.
 */
function updateUI() {
    const dealerShowHole = !dealerTurn;
    document.getElementById('player-hand').innerHTML = handToHTML(playerHand);
    document.getElementById('player-value').textContent = getHandValue(playerHand);
    document.getElementById('dealer-hand').innerHTML = handToHTML(dealerHand, dealerShowHole);
    let dealerValue = getHandValue(dealerHand);
    if (dealerShowHole && dealerHand.length > 1) {
        dealerValue = getHandValue([dealerHand[0]]);
    }
    document.getElementById('dealer-value').textContent = dealerValue;
}

/**
 * Handles the stand action for the player.
 * Dealer draws cards according to Blackjack rules.
 */
async function stand() {
    dealerTurn = true;
    if (!dealerBlackJack()) {
        await drawCardForDealer();
        checkGameResult();
        document.getElementById('hit-btn').disabled = true;
        document.getElementById('stand-btn').disabled = true;
    }
}

/**
 * Checks if the dealer has Blackjack with the first two cards.
 * @returns {boolean} True if dealer has Blackjack, otherwise false.
 */
function dealerBlackJack() { 
    if (getHandValue(dealerHand) === 21 && dealerHand.length === 2) {
        updateUI();
        document.getElementById('message').textContent = 'Blackjack! Dealer gewinnt!';
        document.getElementById('hit-btn').disabled = true;
        document.getElementById('stand-btn').disabled = true;
        return true;
    } else {
        return false;
    }
}

/**
 * Dealer draws cards according to Blackjack rules.
 */
async function drawCardForDealer() {
    while ( getHandValue(dealerHand) < getHandValue(playerHand) && getHandValue(playerHand) <= 21) {
        drawCard(dealerHand);
    }
    while (getHandValue(dealerHand) < 17) {
        drawCard(dealerHand);
    }
}

/**
 * Checks the result of the game and updates the message.
 */
function checkGameResult() {
    const playerValue = getHandValue(playerHand);
    const dealerValue = getHandValue(dealerHand);
    let message = '';
    playerValue > 21 ? message = 'Du hast verloren! (Überkauft)':
    dealerValue > 21 ? message = 'Dealer überkauft! Du gewinnst!':
    playerValue > dealerValue ? message = 'Du gewinnst!':
    playerValue < dealerValue ? message = 'Dealer gewinnt!':
    message = 'Unentschieden!';
    updateUI();
    document.getElementById('message').textContent = message;
}

/**
 * Starts a new game and deals the initial cards.
 */
function startGame() {
    deck = createDeck();
    shuffleDeck(deck);
    distributeCards();
    document.getElementById('hit-btn').disabled = false;
    document.getElementById('stand-btn').disabled = false;
    document.getElementById('message').textContent = '';
    checkPlayerBlackJack();
}

/**
 * Deals two cards to both player and dealer and resets the game state.
 */
function distributeCards() {
    playerHand = [];
    dealerHand = [];
    dealerTurn = false;
    drawCard(playerHand);
    drawCard(playerHand);
    drawCard(dealerHand);
    drawCard(dealerHand);
    updateUI();
}

/**
 * Checks if the player has Blackjack after the initial deal.
 */
function checkPlayerBlackJack() {
    const playerValue = getHandValue(playerHand);
    if (playerValue === 21) {
        document.getElementById('message').textContent = 'Blackjack! Spieler gewinnt!';
        document.getElementById('hit-btn').disabled = true;
        document.getElementById('stand-btn').disabled = true;
    }
}

document.getElementById('stand-btn').addEventListener('click', stand);
document.getElementById('hit-btn').addEventListener('click', () => {
    drawCard(playerHand);
});