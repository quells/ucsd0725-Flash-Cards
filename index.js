const inq = require("inquirer")
const cards = require("./cards.js")

// var score = 0
// var questionCount = 0
// var playedDecks = {}
//
// function printScore() {
//     var perc = 0
//     if (questionCount > 0) {
//         perc = score / questionCount
//     }
//     perc = Math.round(perc * 100)
//     console.log(`Your current score is ${score} / ${questionCount} (${perc}%).\nYou have attempted ${Object.keys(playedDecks).length} subjects.`)
// }

function displayDecks() {
    cards.Load("subjects")
    .then(decks => {
        var deckTitles = decks.map(d => d.title)
        inq.prompt([{
            type: "list",
            name: "deckChoice",
            message: "Which subject would you like to try?",
            choices: deckTitles.concat("Quit")
        }])
        .then(answers => {
            switch (answers.deckChoice) {
                case "Quit":
                    return
                default:
                    for (var i = 0; i < decks.length; i++) {
                        var d = decks[i]
                        if (d.title === answers.deckChoice) {
                            playDeck(d)
                            break
                        }
                    }
            }
        })
    })
    .catch(console.error)
}

function playDeck(deck) {
    deck.ShuffleCards()
    inq.prompt([{
        type: "list",
        name: "frontOrBack",
        message: "Would you like to show the fronts or backs of cards?",
        choices: ["Fronts", "Backs"]
    }])
    .then(answers => {
        var showFront = (answers.frontOrBack === "Fronts")
        var p = Promise.resolve()
        deck.cards.forEach(c => {
            p = p.then(() => playCard(c, showFront))
            .then(result => {
                return new Promise((resolve, reject) => {
                    switch (result) {
                        case "exit":
                            reject("exit")
                            break
                        case "skip":
                            resolve()
                            break
                        case "flip":
                            resolve()
                            break
                        default:
                            if (result.result === true) {
                                console.log("Correct!")
                                resolve()
                            } else {
                                console.log(`Incorrect: ${result.correct}`)
                                resolve()
                            }
                    }
                })
            })
        })
        p = p.catch(err => {
            if (err === "exit") {
                displayDecks()
            }
        })
        return p
    })
}

function playCard(card, showFront) {
    var question = showFront ? card.front : card.back
    var correctAnswer = showFront ? card.back : card.front
    return inq.prompt([{
        type: "list",
        name: "action",
        message: question,
        choices: ["Answer", "Flip", "Skip", "Exit"]
    }])
    .then(answers => {
        switch (answers.action) {
            case "Exit":
                return "exit"
            case "Skip":
                return "skip"
            case "Flip":
                console.log(correctAnswer)
                return "flip"
            case "Answer":
                return inq.prompt([{
                    type: "input",
                    name: "userAnswer",
                    message: question
                }])
                .then(answers => {
                    return {
                        result: answers.userAnswer === correctAnswer,
                        correct: correctAnswer
                    }
                })
        }
    })
}

console.log("Welcom to the Trivia Game!")
displayDecks()
