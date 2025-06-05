class HeysamaAI {
    constructor() {
        this.diceTypeSelect = document.getElementById('diceType');
        this.diceCountInput = document.getElementById('diceCount');
        this.rollButton = document.getElementById('rollButton');
        this.diceDisplay = document.getElementById('diceDisplay');
        this.face = document.getElementById('face');
        this.resultText = document.getElementById('resultText');
        this.resultsDisplay = document.getElementById('results');
        
        this.faceExpressions = {
            1: { emoji: '😭', text: 'とても悲しい', class: 'very-sad' },
            2: { emoji: '😢', text: '悲しい', class: 'sad' },
            3: { emoji: '😐', text: '普通', class: 'neutral' },
            4: { emoji: '😊', text: '嬉しい', class: 'happy' },
            5: { emoji: '😄', text: 'とても嬉しい', class: 'very-happy' }
        };
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        this.rollButton.addEventListener('click', () => this.rollDice());
        
        this.diceCountInput.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            if (value < 1) e.target.value = 1;
            if (value > 10) e.target.value = 10;
        });
    }
    
    biasedRoll(sides) {
        const weights = this.createBiasedWeights(sides);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return i + 1;
            }
        }
        
        return 1;
    }
    
    createBiasedWeights(sides) {
        const weights = [];
        const baseWeight = 1;
        
        for (let i = 1; i <= sides; i++) {
            const bias = Math.pow(sides - i + 1, 2);
            weights.push(baseWeight * bias);
        }
        
        return weights;
    }
    
    async rollDice() {
        const diceType = parseInt(this.diceTypeSelect.value);
        const diceCount = parseInt(this.diceCountInput.value);
        
        this.rollButton.disabled = true;
        this.resultsDisplay.classList.add('empty');
        
        await this.animateDiceRoll(diceCount);
        
        const results = [];
        for (let i = 0; i < diceCount; i++) {
            results.push(this.biasedRoll(diceType));
        }
        
        this.displayResults(results, diceType);
        this.updateFace(results, diceType);
        
        this.rollButton.disabled = false;
    }
    
    async animateDiceRoll(diceCount) {
        this.diceDisplay.innerHTML = '';
        
        for (let i = 0; i < diceCount; i++) {
            const diceContainer = document.createElement('div');
            diceContainer.className = 'dice-container';
            
            const dice = document.createElement('div');
            dice.className = 'dice rolling';
            dice.textContent = '?';
            
            diceContainer.appendChild(dice);
            this.diceDisplay.appendChild(diceContainer);
        }
        
        return new Promise(resolve => {
            setTimeout(() => {
                const rollingDice = document.querySelectorAll('.dice.rolling');
                rollingDice.forEach(dice => {
                    dice.classList.remove('rolling');
                });
                resolve();
            }, 1000);
        });
    }
    
    displayResults(results, diceType) {
        const diceElements = document.querySelectorAll('.dice');
        results.forEach((result, index) => {
            if (diceElements[index]) {
                diceElements[index].textContent = result;
            }
        });
        
        const total = results.reduce((sum, result) => sum + result, 0);
        const average = (total / results.length).toFixed(1);
        
        this.resultsDisplay.innerHTML = `
            <div>
                <strong>結果:</strong> ${results.join(', ')} <br>
                <strong>合計:</strong> ${total} | 
                <strong>平均:</strong> ${average} |
                <strong>ダイス:</strong> ${results.length}d${diceType}
            </div>
        `;
        this.resultsDisplay.classList.remove('empty');
    }
    
    updateFace(results, diceType) {
        const total = results.reduce((sum, result) => sum + result, 0);
        const maxPossible = results.length * diceType;
        const ratio = total / maxPossible;
        
        let level;
        if (ratio <= 0.2) level = 1;
        else if (ratio <= 0.4) level = 2;
        else if (ratio <= 0.6) level = 3;
        else if (ratio <= 0.8) level = 4;
        else level = 5;
        
        const expression = this.faceExpressions[level];
        
        this.face.className = `face ${expression.class}`;
        this.face.textContent = expression.emoji;
        this.resultText.textContent = expression.text;
        
        if (level <= 2) {
            this.resultText.textContent += ' - やっぱりへー様AIは不公平...';
        } else if (level >= 4) {
            this.resultText.textContent += ' - 今日は運がいいですね！';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HeysamaAI();
});