import parliamentSVG from "parliament-svg";
import { toHtml as toSvg } from "hast-util-to-html";

export class MultiSeatElection {
    constructor(seatNumber, electionThreshold) {
        this.electionThreshold = electionThreshold;
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
        let results = this.getResults();
        let resultText = `<p>In an election with ${this.seatNumber} seats and ${this.model.voters.length} valid ballots, ${results.length} seats where distributed as follows:</p>`;
        resultText += "<table class=\"table\">";
        let resultsPerParty = this.getSeatsPerParty(results);
        this.model.candidates.forEach((candidate) => {
            resultText += `<tr><td>${candidate.party}</td><td>${resultsPerParty[candidate.id]} Seats</td>
            <td>${preferences[candidate.id]} Votes</td><td>${Math.round((preferences[candidate.id] / this.model.voters.length) * 100)}%</td></tr>`;
        });
        resultText += "</table>";
        this.resultContainer.innerHTML = "";


        this.drawDiagram(resultsPerParty);

        const textBox = document.createElement("div");
        textBox.innerHTML = resultText;
        textBox.classList.add("card");
        this.resultContainer.appendChild(textBox);
    }

    drawDiagram(data) {
        document.doughnut?.destroy();
        document.barChart?.destroy();
        let canvas = document.getElementById("diagram-canvas");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let resultObj = {};
        document.model.candidates.forEach(candidate =>
        { 
            resultObj[candidate.party] = {
                "seats" : data[candidate.id],
                "colour" : candidate.color
            };
        });
        const virtualSvg = parliamentSVG(resultObj, [null]);
        const svg = toSvg(virtualSvg);
        document.getElementById("election-results-parliament").innerHTML = svg;

    }

    getFirstPreferences() {
        //Filter out votes that are below the election threshold
        if(this.electionThreshold===0){
            return this.model.getFirstPreferencePerCandidate();
        }
        const requiredVotes = this.model.voters.length * (this.electionThreshold/100);
        const firstPreferences = this.model.getFirstPreferencePerCandidate();
        let result = {};
        this.countedBallots = 0;
        this.model.candidates.forEach(party => {
            if(firstPreferences[party.id] >= requiredVotes){
                result[party.id] = firstPreferences[party.id];
                this.countedBallots += firstPreferences[party.id];
            } else {
                result[party.id] = 0;
            }
        });
        return result;
    }

    /**
     * Number of ballots that are counted (and not discarded because of threshold)
     */
    getCountedBallots() {
        if("countedBallots" in this){
            return this.countedBallots;
        }
        return this.model.voters.length;
    }

    // Should return a ranked list of party ids
    getResults() {

    }
}

export class SingleNonTransferableVote extends MultiSeatElection {

    getResults() {
        let firstPreferences = this.getFirstPreferences();
        let results = Object.entries(firstPreferences).sort((a, b) => a[1] - b[1]).reverse();
        results = results.slice(0, this.seatNumber);
        return results.map(element => { return parseInt(element[0]); });
    }
}

export class SainteLaguëVote extends MultiSeatElection {
    getResults() {
        let result = [];

        let firstPreferences = this.getFirstPreferences();
        let values = {};
        this.model.candidates.forEach(candidate => {
            values[candidate.id] = {
                votes: firstPreferences[candidate.id],
                allocated_seats: 0,
                quotient: 1,
                id: candidate.id
            };
            values[candidate.id].quotient = values[candidate.id].votes /
                (2 * values[candidate.id].allocated_seats + 1);
        });
        // For each seat, choose party with highest quotient
        // Recalculate quotient
        for (let i = 0; i < this.seatNumber; i++) {
            const sorted_parties = Object.values(values).sort((a, b) => (b.quotient - a.quotient));
            const next_seat = sorted_parties[0].id;
            result.push(next_seat);
            values[next_seat].allocated_seats++;
            values[next_seat].quotient = values[next_seat].votes /
                (2 * values[next_seat].allocated_seats + 1);
        }
        return result;
    }
}

export class LargestRemainder extends MultiSeatElection {

    constructor(seatNumber, electionThreshold, quotaName) {
        super(seatNumber, electionThreshold);
        this.quotaName = quotaName;
    }

    getQuota(quota) {
        if (quota == "hare") {
            return (votes, seats) => (votes / seats);
        }
        if (quota == "droop") {
            return (votes, seats) => (1 + Math.floor(votes / (1 + seats)));
        }
        if (quota == "hb") {
            return (votes, seats) => (votes / (1 + seats));
        }
        if (quota == "imperiali") {
            return (votes, seats) => (votes / (2 + seats));
        }
    }

    getResults() {
        let firstPreferences = this.getFirstPreferences();
        let remainders = {};
        let result = [];
        let quota = (this.getQuota(this.quotaName))(this.getCountedBallots(), this.seatNumber);
        this.model.candidates.forEach(candidate => {
            let votesPerQuota = firstPreferences[candidate.id] / quota;
            let guaranteedSeats = Array(Math.floor(votesPerQuota)).fill(candidate.id);
            result.push(...guaranteedSeats);
            remainders[candidate.id] = votesPerQuota - Math.floor(votesPerQuota);
        });
        let sortedRemainders = Object.entries(remainders).sort((a, b) => b[1] - a[1]);
        sortedRemainders.forEach(remainderPair => {
            result.push(parseInt(remainderPair[0]));
        });
        return result.slice(0, this.seatNumber);
    }
}

export class Dhondt extends MultiSeatElection {

    calculateQuotient(party) {
        party.quotient = party.votes / (party.seats + 1);
    }

    getResults() {
        let firstPreferences = this.getFirstPreferences();

        let partyObjects = this.model.candidates.map(candidate => {
            return {
                votes: firstPreferences[candidate.id],
                seats: 0,
                id: candidate.id
            };
        });
        partyObjects.forEach(party => this.calculateQuotient(party));
        let result = [];
        for (let i = 0; i < this.seatNumber; i++) {
            partyObjects.sort((a, b) => b.quotient - a.quotient);
            partyObjects[0].seats++;
            result.push(partyObjects[0].id);
            partyObjects.forEach(party => this.calculateQuotient(party));
        }

        return result;
    }
}

export class MacaneseDhondt extends Dhondt {
    calculateQuotient(party) {
        party.quotient = party.votes / Math.pow(2, party.seats);
    }
}

export class HuntingtonHill extends MultiSeatElection {

    getResults() {
        let totalVotes = this.getCountedBallots();
        let qualificationValue = totalVotes / this.seatNumber;
        let firstPreferences = this.getFirstPreferences();

        let parties = this.model.candidates.map(candidate => {
            return {
                id: candidate.id,
                votes: firstPreferences[candidate.id],
                seats: 1,
                isQualified: firstPreferences[candidate.id] > qualificationValue,
            };
        });

        let results = [];
        parties = parties.filter(party => party.isQualified);

        if (parties.length === 0) {
            return []; // No eligible parties
        }

        // Assign one seat per eligible party
        results = parties.map(party => party.id);
        let eligibleCount = results.length;
        // Assign remaining seats
        for (let i = 0; i < this.seatNumber - eligibleCount; i++) {
            parties.forEach(party => {
                party.priority = party.votes / Math.sqrt(party.seats * (party.seats + 1));
            });
            parties.sort((a, b) => b.priority - a.priority);
            let winner = parties[0];
            winner.seats++;
            results.push(winner.id);
        }

        return results;


    }

}
