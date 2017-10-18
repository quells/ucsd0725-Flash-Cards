const inq = require("inquirer")
const cards = require("./cards.js")

function displayDecks(decks) {
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

var needToPractice = new cards.Deck("", [])
function playDeck(deck) {
    var deck = new cards.Deck(deck.title, deck.cards)
    needToPractice.title = deck.title
    needToPractice.cards = []

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
                    switch (result.code) {
                        case "exit":
                            reject("exit")
                            break
                        case "skip":
                            needToPractice.cards.push(result.card)
                            resolve()
                            break
                        case "flip":
                            needToPractice.cards.push(result.card)
                            resolve()
                            break
                        default:
                            if (result.code === true) {
                                console.log("Correct!")
                                resolve()
                            } else {
                                needToPractice.cards.push(result.card)
                                console.log(`Incorrect: ${result.correct}`)
                                resolve()
                            }
                    }
                })
            })
        })
        p = p.then(() => {
            if (needToPractice.cards.length > 0) {
                inq.prompt([{
                    type: "confirm",
                    name: "practice",
                    message: "Would you like to practice the cards you missed?"
                }])
                .then(answer => {
                    if (answer.practice) {
                        playDeck(needToPractice)
                    } else {
                        displayDecks()
                    }
                })
            } else {
                displayDecks()
            }
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
                return {
                    code: "exit"
                }
            case "Skip":
                return {
                    code: "skip",
                    card: card
                }
            case "Flip":
                console.log(correctAnswer)
                return {
                    code: "flip",
                    card: card
                }
            case "Answer":
                return inq.prompt([{
                    type: "input",
                    name: "userAnswer",
                    message: question
                }])
                .then(answers => {
                    return {
                        code: answers.userAnswer === correctAnswer,
                        correct: correctAnswer,
                        card: card
                    }
                })
        }
    })
}

module.exports = {
    Start: displayDecks
}
