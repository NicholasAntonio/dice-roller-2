const translations = {
    'pt': {
        'title': 'Nexus Dice Roller',
        'bonus': 'Bônus',
        'roll': 'Rolar',
        'clear': 'Limpar',
        'rolls': 'Rolagens',
        'diceTotal': 'Total dos Dados',
        'bonus_label': 'Bônus',
        'finalTotal': 'Total Final'
    },
    'en': {
        'title': 'Nexus Dice Roller',
        'bonus': 'Bonus',
        'roll': 'Roll',
        'clear': 'Clear',
        'rolls': 'Rolls',
        'diceTotal': 'Dice Total',
        'bonus_label': 'Bonus',
        'finalTotal': 'Final Total'
    },
    'es': {
        'title': 'Nexus Dice Roller',
        'bonus': 'Bonificación',
        'roll': 'Lanzar',
        'clear': 'Limpiar',
        'rolls': 'Tiradas',
        'diceTotal': 'Total de Dados',
        'bonus_label': 'Bonificación',
        'finalTotal': 'Total Final'
    }
};

class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('preferredLanguage') || 'pt';
    }

    static getInstance() {
        if (!LanguageManager.instance) {
            LanguageManager.instance = new LanguageManager();
        }
        return LanguageManager.instance;
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('preferredLanguage', lang);
            this.updateUI();
        }
    }

    getText(key) {
        return translations[this.currentLang][key] || key;
    }

    updateUI() {
        document.getElementById('buff').placeholder = this.getText('bonus');
        document.getElementById('roll').textContent = this.getText('roll');
        document.getElementById('clear').textContent = this.getText('clear');
        
        // Update existing results
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            const rollsText = message.querySelector('strong:nth-child(1)');
            const diceTotalText = message.querySelector('strong:nth-child(2)');
            const bonusText = message.querySelector('strong:nth-child(3)');
            const finalTotalText = message.querySelector('strong:nth-child(4)');
            
            if (rollsText) rollsText.textContent = this.getText('rolls') + ':';
            if (diceTotalText) diceTotalText.textContent = this.getText('diceTotal') + ':';
            if (bonusText) bonusText.textContent = this.getText('bonus_label') + ':';
            if (finalTotalText) finalTotalText.textContent = this.getText('finalTotal') + ':';
        });
    }
}

window.LanguageManager = LanguageManager;