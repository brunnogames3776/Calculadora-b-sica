const OperatorsMap = {
    add: '+',
    subtract: '-',
    multiply: '*',
    divide: '/',
}

const NumbersMap = {
    zero: '0',
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eighth: '8',
    nine: '9',
}

const ActionsMap = {
    clear: 'C',
    parentesis: '()',
    decimal: '.',
    percentage: '%',
    negate: '+/-',
    back: '⌫',
}

const Parenthesis = {
    open: '(',
    close: ')',
}

let currentExpression = ''

let debounce = false
let warnCounter = 0
const warnLimit = 10
let warnDecayTimer = null
const warnDecayInterval = 2000

const errorLabel = document.getElementById('error')
const resultLabel = document.getElementById('result')
const measurementCanvas = document.createElement('canvas')
const measurementContext = measurementCanvas.getContext('2d')

function getLastCharacter() {
    return currentExpression.slice(-1)
}


function isOperator(value) {
    return Object.values(OperatorsMap).includes(value)
}

function isNumericCharacter(value) {
    return !isNaN(value) && value !== ''
}

function showError(message) {
    errorLabel.innerHTML = message
    setTimeout(() => {
        errorLabel.innerHTML = ''
    }, 2000)
}

function updateDisplay() {
    resultLabel.value = currentExpression
    adjustResultWidth()
}

function getResultWidth(text) {
    const fontStyle = window.getComputedStyle(resultLabel).font
    measurementContext.font = fontStyle
    return Math.ceil(measurementContext.measureText(text).width)
}

function adjustResultWidth() {
    const displayText = currentExpression || resultLabel.placeholder || ''
    const padding = 40
    const width = getResultWidth(displayText) + padding
    resultLabel.style.width = `${Math.max(215, Math.min(width, 520))}px`
}

function clearExpression() {
    currentExpression = ''
    updateDisplay()
}

function canAppendOperator() {
    const lastChar = getLastCharacter()
    return lastChar !== '' && !isOperator(lastChar) && lastChar !== Parenthesis.open
}

function getParenthesisToAdd() {
    const lastChar = getLastCharacter()
    const openCount = (currentExpression.match(/\(/g) || []).length
    const closeCount = (currentExpression.match(/\)/g) || []).length

    if (openCount > closeCount && lastChar !== Parenthesis.open) {
        return Parenthesis.close
    }else if (lastChar == Parenthesis.close || isNumericCharacter(lastChar)) {
        return "*" + Parenthesis.open
    }

    return Parenthesis.open
}

function appendOperator(operatorKey) {
    if (!canAppendOperator()) {
        showError('Invalid operator')
        return
    }

    currentExpression += OperatorsMap[operatorKey]
}

function appendNumber(numberKey) {
    currentExpression += NumbersMap[numberKey]
}

function appendParenthesis() {
    currentExpression += getParenthesisToAdd()
}

function appendDecimal() {
    const parts = currentExpression.split(/[+\-*/]/)
    const lastPart = parts[parts.length - 1]

    if (!lastPart.includes('.')) {
        currentExpression += lastPart === '' ? '0.' : '.'
    }
}

function applyPercentage() {
    if (!currentExpression) {
        showError('Empty expression')
        return
    }

    try {
        const value = Function('"use strict"; return (' + currentExpression + ')')()
        currentExpression = String(value / 100)
    } catch {
        showError('Invalid expression')
    }
}

function toggleNegate() {
    if (!currentExpression) {
        return
    }

    currentExpression = currentExpression.startsWith('-')
        ? currentExpression.slice(1)
        : '-' + currentExpression
}

function backspace() {
    if (!currentExpression) {
        return
    }

    currentExpression = currentExpression.slice(0, -1)
}

function evaluateExpression() {
    if (!currentExpression) {
        showError('Empty!')
        return
    }

    try {
        const result = eval(currentExpression)
        currentExpression = String(result)
    } catch {
        showError('Invalid Expression')
        currentExpression = ''
    }
}

function handleAction(actionKey) {
    if (actionKey in OperatorsMap) {
        appendOperator(actionKey)
        return
    }

    if (actionKey in NumbersMap) {
        appendNumber(actionKey)
        return
    }

    switch (actionKey) {
        case 'equals':
            evaluateExpression()
            break
        case 'clear':
            clearExpression()
            break
        case 'parentesis':
            appendParenthesis()
            break
        case 'decimal':
            appendDecimal()
            break
        case 'percentage':
            applyPercentage()
            break
        case 'negate':
            toggleNegate()
            break
        case 'back':
            backspace()
            break
        default:
            showError('Invalid action')
    }
}

function setDebounce() {
    debounce = true
    setTimeout(() => {
        debounce = false
    }, 50)
}

function showWarning(message) {
    warnCounter = Math.min(warnLimit, warnCounter + 1)
    console.warn(`Warning ${warnCounter}/${warnLimit}: ${message}`)

    if (!warnDecayTimer) {
        warnDecayTimer = setInterval(() => {
            if (warnCounter > 0) {
                warnCounter--
                console.warn(`Warning cooldown: ${warnCounter}/${warnLimit}`)
                if (warnCounter === 0) {
                    clearInterval(warnDecayTimer)
                    warnDecayTimer = null
                }
            } else {
                clearInterval(warnDecayTimer)
                warnDecayTimer = null
            }
        }, warnDecayInterval)
    }
}

function handleButtonClick(buttonId) {
    if (debounce) {
        showError('You are clicking too fast!')
        showWarning('User is clicking too fast.')
        if (warnCounter >= warnLimit) {
            window.alert('You have been warned multiple times. The page will reload to prevent abuse.')
            showError('Please slow down!')
            setTimeout(() => {
                window.location.reload()
            }, 500)
            warnCounter = 0
        }
        return
    }

    setDebounce()
    handleAction(buttonId)
    updateDisplay()
}

function initializeCalculator() {
    clearExpression()
    document.querySelectorAll('#calculator button').forEach(button => {
        button.addEventListener('click', () => {
            handleButtonClick(button.id)
        })
    })
}

showError("starting, plase wait")
setTimeout(()=>{
    initializeCalculator()
})
