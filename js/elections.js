'use strict';

let result_container = document.getElementById("election-results");

class Election {

    constructor() {
        this.model = document.model
    }

    performElection() {
        // subclass responsibility
    }

    drawDiagram(data, colors, labels) {
        let canvas = document.getElementById("diagram-canvas");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let myBarChart = new Chart(ctx, {
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
        // subclass responsibility
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
        return this.model.candidates[winner_index]
    }

    getWinnerVotes() {
        return Math.max.apply(Math, this.results)
    }

    getWinnerPercentage() {
        return Math.round(this.getWinnerVotes() / this.model.voters.length * 100)
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

let fptp

function firstPastThePost() {
    fptp = new FirstPastThePost()
    fptp.performElection()
}

function performRunOff() {
    fptp.performRunOffElection()
}
