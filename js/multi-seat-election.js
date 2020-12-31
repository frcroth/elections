"use strict;"

class MultiSeatElection {
    constructor(seatNumber) {
        this.model = document.model;
        this.seatNumber = seatNumber;
    }
}

class SingleNonTransferableVote extends MultiSeatElection {
    getResults() {
        let firstPreferences = this.model.getFirstPreferencePerCandidate();
        let results = Object.entries(firstPreferences).sort((a, b) => a[1] - b[1]).reverse();
        return results.slice(0, this.seatNumber);
    }
}
