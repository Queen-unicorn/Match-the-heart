const THEMES = { dark: 'dark', light: 'light' }
const heartsArray = ['💜','🧡','💚','🤎','💛','🤍','💙','🖤','💔','💌','💟','💓','💗','💖','💕','💘','💞','💝'];

const args = {
    width: '600px',
    height: '500px',
    columns: 5,
    rows: 4,
    secondsLimit: 120,
    theme: THEMES.light, 
};

// Html elements
const main = document.getElementById("main");
const header = document.getElementById("header");
const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const timerElement = document.getElementById("timer");
const configForm = document.getElementById("config");
const gameContainer = document.getElementById("game-container");
const themeSelect = document.getElementById("theme-select");

// Classes
class Timer {
    constructor(secondsLimit, action) {
        this.setSeconds(secondsLimit);
        this.action = action;
    }

    runTimer() {
        this.secondsLeft--;
        timerElement.innerHTML = this.secondsLeft;
        if(this.secondsLeft === 0) {
            this.stopTimer();
            this.action();
        }
    }

    startTimer(seconds) {
        this.setSeconds(seconds);
        this.interval = window.setInterval(() => this.runTimer(),1000);
    }

    pauseTimer() {
        window.clearInterval(this.interval);    
    }

    stopTimer() {
        this.pauseTimer();
        this.setSeconds(this.secondsLimit);
        timerElement.innerHTML = '--';
    }

    setSeconds(seconds) {
        if(seconds < 0) {
            alert('Seconds must be > 0');
            stopTimer();
            return;
        }
        this.secondsLimit = seconds;
        this.secondsLeft = seconds;
        timerElement.innerHTML = this.secondsLeft;
    }
};

class Card {
    constructor(emoji, row, column, htmlElement) {
        this.emoji = emoji;
        this.row = row;
        this.column = column;
        this.htmlElement = htmlElement;
    }

    open(){
        this.htmlElement.setAttribute('class', 'card card-opened');
        this.htmlElement.innerHTML = this.emoji;
    }

    close(){
        this.htmlElement.setAttribute('class', 'card card-closed');
        this.htmlElement.innerHTML = '';
    }
}

// Game class
class MatchGrid {
    constructor(gameConfig) {
        this.width = gameConfig.width;
        this.height = gameConfig.height;
        this.columns = gameConfig.columns;
        this.rows = gameConfig.rows;
        this.secondsLimit = gameConfig.secondsLimit;
        this.theme = gameConfig.theme;
        this.cards = [];
        this.firstOpenedCard = null;
        this.isPlaying = false;

        this.timer = new Timer(this.secondsLimit, () => this.stopGame());

        startButton.addEventListener('click', (event) => {
            this.timer.stopTimer();
            event.preventDefault();

            this.width = configForm.width.value;
            this.height = configForm.height.value;
            this.columns = configForm.columns.value;
            this.rows = configForm.rows.value;
            this.secondsLimit = configForm.seconds.value;
            this.theme = configForm.theme.value; 

            this.timer.startTimer(this.secondsLimit);
            this.isPlaying = true;
            this.setConfigFormVisibility(false);

            this.createCards();
            this.updateStyles();
            startButton.disabled = true;
            stopButton.disabled = false;
        });

        stopButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.stopGame();
        });

        themeSelect.addEventListener('change', (event) => this.updateTheme(event.target.value));

        document.addEventListener("visibilitychange", function () {
            if(document.hidden) this.timer.pauseTimer();
        });

        stopButton.disabled = true;
        this.createCards();
        this.updateStyles();
        this.addAnimation();
    }

    createCards() {
        gameContainer.innerHTML='';

        let  emojis = [];
        for(let i = 0; i < (this.columns*this.rows)/2; i++) {
            emojis.push({ id: i, emoji: heartsArray[i] });
            emojis.push({ id: i, emoji: heartsArray[i] });
        }
        emojis = this.shuffleArray(emojis);

        console.log(emojis);///////////////////////////////////////////////
        let cardsLeft = emojis.length;

        for(let i = 0; i < this.columns; i++) {
            for(let j = 0; j < this.rows; j++){
                const el = `
                    <div
                        class="card card-closed"
                        id="${i} ${j}"
                        style="grid-column-start: ${i+1}; grid-row-start: ${j+1}; grid-column-end: ${i+1}; grid-row-end: ${j+1};"
                    ></div>
                `;
                gameContainer.insertAdjacentHTML('beforeend', el);
                const currentElement =  document.getElementById(i + ' ' + j);
                let card = new Card(emojis[this.columns*j+i].emoji, j, i, currentElement);

                currentElement.addEventListener('click', async () => {
                    if(currentElement.classList.contains('card-opened') || !this.isPlaying) return;
                    card.open();

                    if(this.firstOpenedCard === null) this.firstOpenedCard = card;
                    else {
                        if(card.emoji !== this.firstOpenedCard.emoji) {
                            // Opened different cards
                            await new Promise(r => setTimeout(r, 500));
                            this.firstOpenedCard.close();
                            card.close();
                        } else {
                            // Opened same cards
                            cardsLeft-=2;
                            if(cardsLeft < 2) {
                                // win
                                this.stopGame()
                                alert("You win!");
                            }
                        }
                        this.firstOpenedCard = null;
                    }
                });
            }
        }
    }

    updateStyles() {
        let cards = document.getElementsByClassName('card');
        for(let i = 0; i < cards.length; i++) {
            cards[i].style.width = this.width/this.columns-(10*this.columns-1) + 'px';
            cards[i].style.height = this.height/this.rows-(10*this.rows-1) + 'px';
        }

        this.updateTheme(this.theme);
    }

    stopGame() {
        this.timer.stopTimer();
        this.isPlaying = false;
        this.setConfigFormVisibility(true);
        startButton.disabled = false;
        stopButton.disabled = true;
    }

    updateTheme(theme) {
        if (theme.toLowerCase() === THEMES.dark) {
            startButton.setAttribute('class', 'light');
            stopButton.setAttribute('class', 'light');
            main.setAttribute('class', 'dark');
            header.setAttribute('class', 'light');
            document.getElementById("form-label").setAttribute('class', 'light-font');
            document.getElementById("config").setAttribute('class', 'light-font');
            document.getElementById("timer-container").setAttribute('class', 'light-font');
            
            let inputs = document.getElementsByClassName('input');
            for(let i = 0; i < inputs.length; i++) {
                inputs[i].style.color = 'rgb(255, 240, 240)';
            }
        } else {
            startButton.setAttribute('class', 'dark');
            stopButton.setAttribute('class', 'dark');
            main.setAttribute('class', 'light');
            header.setAttribute('class', 'dark');
            document.getElementById("form-label").setAttribute('class', 'dark-font');
            document.getElementById("config").setAttribute('class', 'dark-font');
            document.getElementById("timer-container").setAttribute('class', 'dark-font');

            let inputs = document.getElementsByClassName('input');
            for(let i = 0; i < inputs.length; i++) {
                inputs[i].style.color = 'rgb(175, 18, 18)';
            }
        }
    }

    shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    addAnimation() {
        let textWrapper = document.getElementById('header-title');
        textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

        anime.timeline({loop: true})
        .add({
            targets: '#header-title .letter',
            opacity: [0,1],
            easing: "easeInOutQuad",
            duration: 2000,
            delay: (el, i) => 150 * (i+1)
        }).add({
            targets: '#header-title',
            opacity: 0,
            duration: 1000,
            easing: "easeOutExpo",
            delay: 1000
        });
    }

    setConfigFormVisibility(isVisible) {
        document.getElementById('config-form').hidden = !isVisible;
        document.getElementById('form-label').hidden = !isVisible;
    }
};

new MatchGrid(args);