
class DiceObject extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('dice-object');
        const templateContent = template.content;
        this.appendChild(templateContent.cloneNode(true));
        let sides = this.getAttribute('sides');
        let svgId = `d${sides}`;
        let viewBox = '0 0 33 33';
        if (sides === '100') {
            viewBox = '0 0 33 33';
        } else if (sides === '3') {
            viewBox = '0 0 33 33';
        }
        this.innerHTML += `
            <div class="die">
                <div class="value">${sides}</div>
                <svg viewBox="${viewBox}">
                    <use xlink:href="#${svgId}"></use>
                </svg>
            </div>
        `;
    }
}

customElements.define('dice-object', DiceObject);


class DiceIcon extends HTMLElement {
    constructor() {
        super();
        const template = document.getElementById('dice-icon');
        const templateContent = template.content;
        this.appendChild(templateContent.cloneNode(true));
        let sides = this.getAttribute('sides');
        this.innerHTML += `
            <div class="icon">${sides}
                <svg viewBox="0 0 12 12">
                    <use xlink:href="#d${sides}-icon"></use>
                </svg>
            </div>
        `;
    }
    
    connectedCallback() {
        this.querySelector('.increment').addEventListener('click', function(e) {
            let sides = e.target.parentElement.getAttribute('sides');
            let dice = `<dice-object sides="${sides}"></dice-object>`;
            document.getElementById('table-top').insertAdjacentHTML('beforeend', dice);
            e.target.parentElement.querySelector('.decrement').removeAttribute('disabled');
            document.getElementById('roll').removeAttribute('disabled');
            document.getElementById('clear').removeAttribute('disabled');
        });
        
        this.querySelector('.decrement').addEventListener('click', function(e) {
            let sides = e.target.parentElement.getAttribute('sides');
            let correspondingDice = document.querySelectorAll(`dice-object[sides="${sides}"]`);
            if (correspondingDice.length > 0) {
                correspondingDice[0].remove();
            }
            if (correspondingDice.length === 1) {
                e.target.setAttribute('disabled', '');
            }
            let dice = document.querySelectorAll('dice-object');
            if (dice.length < 1) {
                document.getElementById('roll').setAttribute('disabled', '');
                document.getElementById('clear').setAttribute('disabled', '');
            }
        });
    }
}

customElements.define('dice-icon', DiceIcon);

document.getElementById('clear').addEventListener('click', function() {
    let diceObjects = document.querySelectorAll('dice-object');
    diceObjects.forEach(dice => {
        dice.remove();
    });
    document.getElementById('results').innerHTML = '';
    document.getElementById('roll').setAttribute('disabled', '');
    document.getElementById('clear').setAttribute('disabled', '');
});


document.getElementById('roll').addEventListener('click', function() {
    const rollSound = document.getElementById('roll-sound');
    rollSound.currentTime = 0;
    rollSound.play();

    let dice = document.querySelectorAll('dice-object');
    let buffValue = parseInt(document.getElementById('buff').value) || 0;
    document.getElementById('results').innerHTML = '';

    let totalSum = 0;
    const animationDuration = 1000;
    const interval = 50;

    let rolls = Array.from(dice).map(die => {
        let sides = parseInt(die.getAttribute('sides'));
        return { die, sides };
    });

    let animationTime = 0;
    let animationInterval = setInterval(() => {
        rolls.forEach(({ die, sides }) => {
            let randomRoll = Math.floor(Math.random() * sides + 1);
            die.querySelector('.value').innerText = randomRoll;
        });

        animationTime += interval;
        if (animationTime >= animationDuration) {
            clearInterval(animationInterval);
            rolls.forEach(({ die, sides }) => {
                let finalRoll = Math.floor(Math.random() * sides + 1);
                die.querySelector('.value').innerText = finalRoll;
                totalSum += finalRoll;
            });

            let messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            messageDiv.innerText = `Soma dos dados rolados: ${totalSum} + Bônus: ${buffValue} = Total: ${totalSum + buffValue}`;
            document.getElementById('results').appendChild(messageDiv);
        }
    }, interval);
});
