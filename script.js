class DiceRoller {
    constructor() {
        this.history = [];
        this.isRolling = false;
        this.soundEnabled = true;
    }

    static getInstance() {
        if (!DiceRoller.instance) {
            DiceRoller.instance = new DiceRoller();
        }
        return DiceRoller.instance;
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
    }

    async rollDice(dice, buffValue = 0) {
        if (this.isRolling) return;
        this.isRolling = true;

        const rollSound = document.getElementById('roll-sound');
        if (this.soundEnabled) {
            try {
                rollSound.currentTime = 0;
                await rollSound.play();
            } catch (error) {
                console.warn('Sound playback failed:', error);
            }
        }

        const rolls = Array.from(dice).map(die => ({
            die,
            sides: parseInt(die.getAttribute('sides')),
            finalRoll: Math.floor(Math.random() * parseInt(die.getAttribute('sides')) + 1)
        }));

        await this.animateRolls(rolls);
        this.displayResults(rolls, buffValue);
        this.isRolling = false;
    }

    async animateRolls(rolls) {
        const animationDuration = 1500;
        const interval = 50;
        const iterations = animationDuration / interval;
        let currentIteration = 0;

        return new Promise(resolve => {
            const animate = () => {
                rolls.forEach(({ die, sides }) => {
                    const randomRoll = Math.floor(Math.random() * sides + 1);
                    const value = die.querySelector('.value');
                    if (value) {
                        value.innerText = randomRoll;
                        const progress = currentIteration / iterations;
                        const rotateX = Math.sin(progress * Math.PI * 4) * 180;
                        const rotateY = Math.cos(progress * Math.PI * 4) * 180;
                        const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
                        die.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
                    }
                });

                currentIteration++;
                if (currentIteration < iterations) {
                    requestAnimationFrame(animate);
                } else {
                    rolls.forEach(({ die, finalRoll }) => {
                        const value = die.querySelector('.value');
                        if (value) {
                            value.innerText = finalRoll;
                            die.style.transform = 'scale(1.1)';
                            setTimeout(() => {
                                die.style.transform = 'scale(1)';
                            }, 150);
                        }
                    });
                    resolve();
                }
            };
            animate();
        });

    }

    displayResults(rolls, buffValue) {
        const resultsContainer = document.getElementById('results');
        const totalRoll = rolls.reduce((sum, { finalRoll }) => sum + finalRoll, 0);
        const total = totalRoll + buffValue;
        const langManager = LanguageManager.getInstance();

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        
        const rollDetails = rolls.map(({ die, finalRoll }) => 
            `d${die.getAttribute('sides')}: ${finalRoll}`
        ).join(', ');

        messageDiv.innerHTML = `
            <div><strong>${langManager.getText('rolls')}:</strong> ${rollDetails}</div>
            <div><strong>${langManager.getText('diceTotal')}:</strong> ${totalRoll}</div>
            ${buffValue ? `<div><strong>${langManager.getText('bonus_label')}:</strong> +${buffValue}</div>` : ''}
            <div><strong>${langManager.getText('finalTotal')}:</strong> ${total}</div>
        `;

        resultsContainer.insertAdjacentElement('afterbegin', messageDiv);
        this.history.push({ rolls, buffValue, total, timestamp: new Date() });
    }
}

class DiceObject extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('dice-object');
        const templateContent = template.content;
        this.appendChild(templateContent.cloneNode(true));
        const sides = this.getAttribute('sides');
        this.innerHTML += `
            <div class="die">
                <div class="value">${sides}</div>
                <svg viewBox="0 0 33 33">
                    <use xlink:href="#d${sides}"></use>
                </svg>
            </div>
        `;
    }
}

class DiceIcon extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('dice-icon');
        const templateContent = template.content;
        this.appendChild(templateContent.cloneNode(true));
        const sides = this.getAttribute('sides');
        this.innerHTML += `
            <div class="icon">${sides}
                <svg viewBox="0 0 12 12">
                    <use xlink:href="#d${sides}-icon"></use>
                </svg>
            </div>
        `;
    }

    connectedCallback() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const increment = this.querySelector('.increment');
        const decrement = this.querySelector('.decrement');

        increment?.addEventListener('click', this.handleIncrement.bind(this));
        decrement?.addEventListener('click', this.handleDecrement.bind(this));
    }

    handleIncrement(e) {
        const sides = this.getAttribute('sides');
        const dice = `<dice-object sides="${sides}"></dice-object>`;
        document.getElementById('table-top')?.insertAdjacentHTML('beforeend', dice);
        this.querySelector('.decrement')?.removeAttribute('disabled');
        document.getElementById('roll')?.removeAttribute('disabled');
        document.getElementById('clear')?.removeAttribute('disabled');
    }

    handleDecrement(e) {
        const sides = this.getAttribute('sides');
        const correspondingDice = document.querySelectorAll(`dice-object[sides="${sides}"]`);
        correspondingDice[0]?.remove();

        if (correspondingDice.length === 1) {
            e.target.setAttribute('disabled', '');
        }

        const remainingDice = document.querySelectorAll('dice-object');
        if (remainingDice.length < 1) {
            document.getElementById('roll')?.setAttribute('disabled', '');
            document.getElementById('clear')?.setAttribute('disabled', '');
        }
    }
}

customElements.define('dice-object', DiceObject);
customElements.define('dice-icon', DiceIcon);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const diceRoller = DiceRoller.getInstance();

    document.getElementById('clear')?.addEventListener('click', () => {
        document.querySelectorAll('dice-object').forEach(dice => dice.remove());
        document.getElementById('results').innerHTML = '';
        document.getElementById('roll')?.setAttribute('disabled', '');
        document.getElementById('clear')?.setAttribute('disabled', '');
        document.querySelectorAll('dice-icon .decrement').forEach(btn => 
            btn.setAttribute('disabled', '')
        );
    });

    document.getElementById('roll')?.addEventListener('click', () => {
        const dice = document.querySelectorAll('dice-object');
        const buffValue = parseInt(document.getElementById('buff')?.value) || 0;
        diceRoller.rollDice(dice, buffValue);
    });
});
