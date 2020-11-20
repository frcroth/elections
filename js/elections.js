'use strict';

let result_container = document.getElementById("election-results");

class Election {

    constructor() {
        this.model = document.model
    }

    performElection() {
        // subclass responsibility
    }

    drawDiagram() {
        let canvas = document.getElementById("diagram-canvas");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let myBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [{
                    data: this.results,
                    label: "Results",
                    backgroundColor: document.model.candidates.map((value) => value.color)
                }],
                labels: document.model.candidates.map((value) => value.party),


            },
            options: {
                responsive: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                        }
                    }],
                    xAxes: [{
                        gridLines: {
                            offsetGridLines: true
                        }
                    }]
                },
                fullWidth: false,
                title: {
                    display: true,
                    text: 'Election results'
                }

            }
        });

    }

    setResultText() {
        // subclass responsibility
    }

    getWinner() {
        // subclass responsibility
    }

}

class FirstPastThePost extends Election {

    constructor() {
        super()
    }

    performElection() {
        this.results = this.calculateResults()
        this.drawDiagram()
        this.setResultText();
    }

    calculateResults() {
        let preferences = this.model.calculatePreferences()

        let voteCount = new Array(this.model.candidates.length).fill(0)

        for (let voter_preference in preferences) {
            const voter = voter_preference
            let first_preference = preferences[voter_preference][0]
            voteCount[first_preference]++
        }
        return voteCount
    }

    resultClear() {
        return this.results.indexOf(this.getWinnerVotes()) === this.results.lastIndexOf(this.getWinnerVotes())
    }

    getWinner() {
        let winner_index = this.results.indexOf(Math.max.apply(Math, this.results))
        return document.model.candidates[winner_index]
    }

    getWinnerVotes() {
        return Math.max.apply(Math, this.results)
    }

    getWinnerPercentage() {
        return Math.round(this.getWinnerVotes() / document.model.voters.length * 100)
    }

    setResultText() {
        const text_container = document.getElementById("election-result-text")
        text_container.innerHTML = ''
        const text = document.createElement("p")
        let content = "In a <i>first past the post</i> election, the candidate with the plurality of votes wins. When two candidates have the same number of votes, it may be decided by e.g. a runoff election or a cointoss."
        if (!this.resultClear()) {
            content += "</br> There has been no clear result."
            
        } else {
            content += "</br> The votes have been counted. The winner is the " + this.getWinner().party + ". Congratulations! </br> The winner has won with " + this.getWinnerPercentage() + "% of the vote."
        }

        text.innerHTML = content
        text_container.appendChild(text)
    }

}

function firstPastThePost() {
    new FirstPastThePost().performElection()
}