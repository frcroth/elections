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
        let resultText = "<p>In an election with " + this.seatNumber + " seats, the seats where distributed as follows:</p>";
        let results = this.getResults();
        resultText += '<table class="table">'; 
        let resultsPerParty = this.getSeatsPerParty(results);
        this.model.candidates.forEach((candidate) => {
            resultText += "<tr><td>" + candidate.party + "</td><td>" + resultsPerParty[candidate.id] + " Seats</td></tr>";
        })
        resultText += "</table>";
        this.resultContainer.innerHTML = '';
        const textBox = document.createElement("div");
        textBox.innerHTML = resultText;
        textBox.classList.add("card");
        this.resultContainer.appendChild(textBox);
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
        return results.map(element => {return parseInt(element[0])});
    }
}