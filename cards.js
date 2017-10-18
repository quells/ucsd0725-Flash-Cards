const fs = require("fs")
const path = require("path")

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

// class TriviaCard {
//     constructor(question, correctAnswer, otherAnswers) {
//         this.question = question
//         this.correctAnswer = correctAnswer
//         this.answers = otherAnswers.concat(correctAnswer)
//     }
//
//     ShuffleAnswers() {
//         this.answers = fisherYatesShuffle(this.answers)
//     }
// }

class FlashCard {
    constructor(front, back) {
        if (front instanceof Array && front.length === 2) {
            this.front = front[0]
            this.back = front[1]
        } else {
            this.front = front
            this.back = back
        }
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

function loadData(subject_dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(subject_dir, (err, files) => {
            if (err) {
                reject(err)
            } else {
                resolve(files)
            }
        })
    })
    .then(files => files.map(f => path.join(subject_dir, f)))
    .then(filepaths => {
        // do synchronously to maintain ordering
        var deck_texts = []
        var text = ""
        filepaths.forEach(f => {
            try {
                text = fs.readFileSync(f, "utf8")
                deck_texts.push(text)
            } catch (err) {
                throw err
            }
        })
        return deck_texts
    })
    .then(deck_texts => {
        var decks = []
        deck_texts.forEach(dt => {
            var cards = []
            var lines = dt.split("\n")
            var title = lines[0]
            card_texts = lines.slice(1).filter(l => l.length > 0) // filter out empty lines
            card_texts.forEach(ct => {
                var parts = ct.split(";")
                cards.push(new FlashCard(parts))
            })
            decks.push(new Deck(title, cards))
        })
        return decks
    })
}

// For trivia game
// function loadData(subject_dir) {
//     ...
//     .then(deck_texts => {
//         var decks = []
//         deck_texts.forEach(dt => {
//             var cards = []
//             var lines = dt.split("\n")
//             var title = lines[0]
//             card_texts = lines.slice(1).filter(l => l.length > 0) // filter out empty lines
//             card_texts.forEach(ct => {
//                 var parts = ct.split(";")
//                 var question = parts[0]
//                 var correct_answer = parts[1]
//                 var other_answers = parts.slice(2)
//                 cards.push(new TriviaCard(question, correct_answer, other_answers))
//             })
//             decks.push(new Deck(title, cards))
//         })
//         return decks
//     })
// }

module.exports = {
    Load: loadData,
    FlashCard: FlashCard,
    Deck: Deck,
}
