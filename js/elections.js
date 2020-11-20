'use strict';

let result_container = document.getElementById("election-results");

function drawDiagram(results) {
    let canvas = document.getElementById("diagram-canvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            datasets: [{
                data: results,
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

function resultClear(results) {
    return results.indexOf(getWinnerVotes(results)) == results.lastIndexOf(getWinnerVotes(results))
}

function getWinner(results) {
    let winner_index = results.indexOf(Math.max.apply(Math, results))
    return document.model.candidates[winner_index]
}

function getWinnerVotes(results) {
    return Math.max.apply(Math, results)
}

function getWinnerPercentage(results) {
    return Math.round(getWinnerVotes(results) / document.model.voters.length * 100)
}

function setResultTextFPTP(results) {
    const text_container = document.getElementById("election-result-text")
    text_container.innerHTML = ''
    const text = document.createElement("p")
    let content = "In a <i>first past the post</i> election, the candidate with the plurality of votes wins. When two candidates have the same number of votes, it may be decided by e.g. a runoff election or a cointoss."
    if (!resultClear(results)) {
        content += "</br> There has been no clear result."
    } else {
        content += "</br> The votes have been counted. The winner is " + getWinner(results).party + ". Congratulations! </br> The winner has won with " + getWinnerPercentage(results) + "% of the vote."
    }

    text.innerHTML = content
    text_container.appendChild(text)
}


function firstPastThePost() {
    let results = document.model.performSimpleFPTPElection()
    drawDiagram(results)
    setResultTextFPTP(results);
}
