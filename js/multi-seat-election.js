"use strict;"

class MultiSeatElection {
    constructor(seatNumber) {
        this.model = document.model;
        this.seatNumber = seatNumber;
        this.resultContainer = document.getElementById("election-result-text");
    }

    getSeatsPerParty(results) {
        let partyResults = {};
        this.model.candidates.forEach(candidate => partyResults[candidate.id] = 0);
        results.forEach(party => {
            partyResults[party] += 1;
        });
        return partyResults;
    }

    performElection() {
        const preferences = this.model.getFirstPreferencePerCandidate();
        let resultText = "<p>In an election with " + this.seatNumber + " seats, the seats where distributed as follows:</p>";
        let results = this.getResults();
        resultText += '<table class="table">';
        let resultsPerParty = this.getSeatsPerParty(results);
        this.model.candidates.forEach((candidate) => {
            resultText += "<tr><td>" + candidate.party + "</td><td>" +
             resultsPerParty[candidate.id] + " Seats</td><td>" + preferences[candidate.id] + " Votes</td></tr>";
        })
        resultText += "</table>";
        this.resultContainer.innerHTML = '';


        this.drawDiagram(resultsPerParty);

        const textBox = document.createElement("div");
        textBox.innerHTML = resultText;
        textBox.classList.add("card");
        this.resultContainer.appendChild(textBox);
    }

    drawDiagram(data) {
        document.doughnut?.destroy();
        let canvas = document.getElementById("diagram-canvas");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let sorted_data = document.model.candidates.map(candidate => data[candidate.id]);
        document.doughnut = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: sorted_data,
                    label: "Results",
                    backgroundColor: document.model.candidates.map(candidate => candidate.color),
                }],
                labels: document.model.candidates.map(candidate => candidate.party)
            },
            options: {
                title: {
                    display: true,
                    text: 'Election results'
                },
                rotation: 1 * Math.PI,
                circumference: 1 * Math.PI
            }
        });

    }

    // Should return a ranked list of party ids
    getResults() {

    }
}

class SingleNonTransferableVote extends MultiSeatElection {

    getResults() {
        let firstPreferences = this.model.getFirstPreferencePerCandidate();
        let results = Object.entries(firstPreferences).sort((a, b) => a[1] - b[1]).reverse();
        results = results.slice(0, this.seatNumber);
        return results.map(element => { return parseInt(element[0]) });
    }
}

class SainteLaguëVote extends MultiSeatElection {
    getResults() {
        let result = []

        let firstPreferences = this.model.getFirstPreferencePerCandidate();
        let values = {}
        this.model.candidates.forEach(candidate => {
            values[candidate.id] = {
                votes: firstPreferences[candidate.id],
                allocated_seats: 0,
                quotient: 1,
                id: candidate.id
            };
            values[candidate.id].quotient = values[candidate.id].votes /
                (2 * values[candidate.id].allocated_seats + 1);
        })
        // For each seat, choose party with highest quotient
        // Recalculate quotient
        for (let i = 0; i < this.seatNumber; i++) {
            const sorted_parties = Object.values(values).sort((a,b) => (b.quotient - a.quotient))
            const next_seat = sorted_parties[0].id;
            result.push(next_seat);
            values[next_seat].allocated_seats++;
            values[next_seat].quotient = values[next_seat].votes /
            (2 * values[next_seat].allocated_seats + 1);
        }
        return result;
    }
}