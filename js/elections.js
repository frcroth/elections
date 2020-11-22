'use strict';

let result_container = document.getElementById("election-results");

class Election {

    constructor() {
        this.model = document.model
    }

    performElection() {
        // subclass responsibility
    }

    majority() {
        return Math.ceil(this.model.voters.length / 2)
    }

    drawDiagram(data, colors, labels) {
        document.barChart?.destroy()
        let canvas = document.getElementById("diagram-canvas");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [{
                    data: data,
                    label: "Results",
                    backgroundColor: colors
                }],
                labels: labels,


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
        let winner_index = this.results.indexOf(Math.max.apply(Math, this.results))
        return this.model.candidates[winner_index]
    }

    getWinnerVotes() {
        return Math.max.apply(Math, this.results)
    }

    getNumberOfVotes() {
        return this.results.reduce((a, b) => a + b, 0)
    }

    getWinnerPercentage() {
        return Math.round(this.getWinnerVotes() / this.getNumberOfVotes() * 100)
    }

    setAdditionalStats() {
        const text_container = document.getElementById("additional-results")
        text_container.innerHTML = ''
        const text = document.createElement("p")
        let content = "<h4>Additional stats</h4>"
        content += "<b>Dissatisfaction</b>: Median dissatisfaction " + Math.round(this.model.getMedianDissatisfaction(this.getWinner().id) * 100) + "%, Average dissatisfaction " + Math.round(this.model.getAverageDissatisfaction(this.getWinner().id) * 100) + "%. Each voter's dissatisfaction is calculated with the distance to the winner."

        text.innerHTML = content
        text_container.appendChild(text)
    }

}

class FirstPastThePost extends Election {

    constructor() {
        super()
    }

    performElection() {
        this.results = this.calculateResults()
        this.drawDiagram(this.results, document.model.candidates.map((value) => value.color),
            document.model.candidates.map((value) => value.party))
        this.setResultText()
        this.setAdditionalStats()
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

    getRunoffCandidates() {
        let candidate1 = this.getWinner()
        let candidate1Votes = this.getWinnerVotes()

        this.results[candidate1.id] = -Infinity;
        let candidate2 = this.getWinner();
        this.results[candidate1.id] = candidate1Votes;


        return [candidate1, candidate2]
    }

    calculateRunOffResults() {
        let candidate1Count = 0
        let candidate2Count = 0
        let preferences = this.model.calculatePreferences()

        for (let voter_preference in preferences) {
            if (preferences[voter_preference].indexOf(this.runOffCandidates[0].id) <
                preferences[voter_preference].indexOf(this.runOffCandidates[1].id)) {
                candidate1Count++;
            } else {
                candidate2Count++;
            }
        }

        return [candidate1Count, candidate2Count]
    }

    getRunOffWinner() {
        let winner_index = this.runOffResults.indexOf(Math.max.apply(Math, this.runOffResults))
        return this.runOffCandidates[winner_index]
    }

    getRunOffWinnerVotes() {
        return Math.max.apply(Math, this.runOffResults)
    }

    getRunOffWinnerPercentage() {
        return Math.round(this.getRunOffWinnerVotes() / this.model.voters.length * 100)
    }

    performRunOffElection() {
        this.runOffCandidates = this.getRunoffCandidates()
        this.runOffResults = this.calculateRunOffResults()

        this.drawDiagram(this.runOffResults, [this.runOffCandidates[0].color, this.runOffCandidates[1].color],
            [this.runOffCandidates[0].party, this.runOffCandidates[1].party])
        this.setRunOffResultText();
    }

    setRunOffResultText() {
        const text_container = document.getElementById("runoff-text")
        text_container.innerHTML = ''

        const text = document.createElement("p")
        let content = "In the runoff election, " + this.runOffCandidates[0].party + " and " + this.runOffCandidates[1].party + " competed. The " +
            this.getRunOffWinner().party + " won with " + this.getRunOffWinnerPercentage() + "% of the votes."

        text.innerHTML = content
        text_container.appendChild(text)

    }


    setResultText() {
        const text_container = document.getElementById("election-result-text")
        text_container.innerHTML = ''
        const text = document.createElement("div")
        let content = "<p>In a <i>first past the post</i> election, the candidate with the plurality of votes wins. When two candidates have the same number of votes, it may be decided by e.g. a runoff election or a coin toss."
        if (!this.resultClear()) {
            content += "</br> There has been no clear result.</p>"

        } else {
            content += "</br> The votes have been counted. The winner is the " + this.getWinner().party + ". Congratulations! </br> The winner has won with " + this.getWinnerPercentage() + "% of the vote.</p>"
        }
        let runOffButton = "<button onclick=\"performRunOff()\" class=\"btn btn-secondary\">Perform a runoff election</button>"

        content += runOffButton
        content += "<div id=\"runoff-text\"></div>"

        text.innerHTML = content
        text_container.appendChild(text)
    }

}

class InstantRunoff extends Election {

    constructor() {
        super()
    }

    performElection() {
        this.eliminatedCandidates = []
        this.results = this.calculateResults()
        this.drawDiagram(this.results, document.model.candidates.map((value) => value.color),
            document.model.candidates.map((value) => value.party))
        this.iteration = 0;
        this.setResultText();
    }

    performIteration() {
        if (!this.electionOver()) {
            this.eliminateCandidate(this.getLowestPerformingCandidate().id)
            this.results = this.calculateResults()
            this.drawDiagram(this.results, document.model.candidates.map((value) => value.color),
                document.model.candidates.map((value) => value.party))
            this.iteration++
            this.setResultText();
        }
    }

    eliminateCandidate(candidate_id) {
        this.eliminatedCandidates.push(candidate_id)
    }

    getLowestPerformingCandidate() {
        for (let i = 0; i < this.results.length; i++) {
            if (!this.stillPerforming(i)) {
                this.results[i] = Infinity
            }
        }
        let looser = this.model.candidates[this.results.indexOf(Math.min.apply(Math, this.results))]
        for (let i = 0; i < this.results.length; i++) {
            if (this.results[i] === Infinity) {
                this.results[i] = 0
            }
        }
        return looser
    }

    electionOver() {
        return this.getWinnerVotes() > this.majority()
    }

    stillPerforming(candidate_id) {
        return !this.eliminatedCandidates.includes(candidate_id)
    }

    calculateResults() {
        let preferences = this.model.calculatePreferences()

        let voteCount = new Array(this.model.candidates.length).fill(0)

        for (let voter_preference in preferences) {
            const voter = voter_preference
            for (let i = 0; i < preferences[voter].length; i++) {
                if (this.stillPerforming(preferences[voter][i])) {
                    voteCount[preferences[voter][i]]++
                    break
                }
            }
        }
        return voteCount
    }

    setResultText() {
        const text_container = document.getElementById("election-result-text")
        text_container.innerHTML = ''
        const text = document.createElement("div")
        let content = "<p>In an <i>instant runoff</i> election, a candidate wins with a majority of the votes. If no majority is achieved, the candidate with the fewest votes is eliminated and the votes go to the candidate that is preferred next."
        if (!this.electionOver()) {
            content += "</br> There is no winner yet. Iteration " + this.iteration + "</p>"
            let iterationButton = "<button onclick=\"instantRunoffIteration()\" class=\"btn btn-secondary\">Iterate instant runoff</button>"
            content += iterationButton
        } else {
            content += "</br> The votes have been counted. The winner is the " + this.getWinner().party + ". Congratulations! </br> The winner has won with " + this.getWinnerPercentage() + "% of the effective vote.</p>"
            this.setAdditionalStats()
        }

        text.innerHTML = content
        text_container.appendChild(text)
    }
}

class BordaCount extends Election {
    performElection() {
        this.results = this.calculateResults()
        this.drawDiagram(this.results, document.model.candidates.map((value) => value.color),
            document.model.candidates.map((value) => value.party))
        this.setResultText()
        this.setAdditionalStats()
    }

    calculateResults() {
        let preferences = this.model.calculatePreferences()

        let voteScore = new Array(this.model.candidates.length).fill(0)

        for (let voter_preference in preferences) {
            const voter = voter_preference
            for (let i = 0; i < preferences[voter].length; i++) {
                voteScore[preferences[voter][i]] += this.model.candidates.length - i
            }
        }
        return voteScore
    }

    setResultText() {
        const text_container = document.getElementById("election-result-text")
        text_container.innerHTML = ''
        const text = document.createElement("div")
        let content = "<p>In a <i>Borda count</i> election, voters rank candidates. The preferences are then converted into scores, which are summed. "
        content += "The " + this.getWinner().party + " won with a score of " + this.getWinnerVotes() + ", that's " + this.getWinnerPercentage() + "% of the score."

        text.innerHTML = content
        text_container.appendChild(text)
    }
}

let ir
let bc
let fptp

function firstPastThePost() {
    fptp = new FirstPastThePost()
    fptp.performElection()
}

function performRunOff() {
    fptp.performRunOffElection()
}

function instantRunoff() {
    ir = new InstantRunoff()
    ir.performElection()
}

function instantRunoffIteration() {
    ir.performIteration()
}

function bordaCount() {
    bc = new BordaCount()
    bc.performElection()
}