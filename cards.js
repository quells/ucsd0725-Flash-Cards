const fs = require("fs")

function fisherYatesShuffle(arr) {
    var copy = arr.slice(0)
    var tmp
    for (var i = copy.length-1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i+1))
        tmp = copy[i]
        copy[i] = copy[j]
        copy[j] = tmp
    }
    return copy
}

class Card {
    constructor(question, correctAnswer, answers) {
        this.question = question
        this.correctAnswer = correctAnswer
        this.answers = answers.concat(correctAnswer)
    }

    ShuffleAnswers() {
        this.answers = fisherYatesShuffle(this.answers)
    }
}

class Deck {
    constructor(title, cards) {
        this.title = title
        this.cards = cards
    }

    ShuffleCards() {
        this.cards = fisherYatesShuffle(this.cards)
    }
}

module.exports = {

}
