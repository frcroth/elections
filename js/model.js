export class Model {

    constructor() {
        this.MAX_NUMBER_CANDIDATES = 10;
        this.voters = [];
        this.candidates = [];
    }

    generateRandomColor() {
        return "#" + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
    }

    generateRandomPartyName() {
        const attributes = ["Green", "Socialist", "Conservative", "Liberal", "Reform", "Social", "Progressive", "Nationalist", "Popular", "Indigenous", "Constitutional", "Centrist", "Satirical", "Technocratic", "Marxist", "Leninist", "Trotzkyist", "Democratic", "Orthodox", "Humanist", "Libertarian", "Fundamentalist", "Accelerationist", "Republican", "Imperialist", "Capitalist", "Populist", "Worker's", "Royalist", "Anarchist", "Law", "Order", "Spartacist", "People's", "Freedom", "Pirate", "Ecologic", "Free", "Animal's Rights", "Alternative", "Federal", "Whig", "Citizen's", "Farmer's", "Left", "Right", "Feminist", "Spiritual", "Labor", "Independent", "Young People's", "Old People's", "Unity", "Equality", "New", "Action", "Families", "Justice", "Peace", "Pacifist", "Prohibition", "Agrianist", "Ruralist", "First", "Animal", "Secular", "United", "Patriot", "Change", "Modern", "Prosperity"];
        const types = ["Party", "Alliance", "Block", "Front", "Party", "Party", "Party", "Party", "Union", "League", "Group", "Forum", "Revolution", "Federation", "Movement", "Action", "Party", "Party", "Party", "Party", "Party", "Rally", "Coalition", "Congress", "Party", "Party", "Party", "Party"];
        let attribute1 = attributes[Math.floor(Math.random() * attributes.length)];
        let attribute2 = Math.random() < 0.7 ? attributes[Math.floor(Math.random() * attributes.length)] : "";
        let type = types[Math.floor(Math.random() * types.length)];
        return attribute1 + " " + attribute2 + " " + type;
    }

    addVoter(pos) {
        let voter = {
            id: this.voters.length,
            pos: pos
            // Maybe add name, history, ...
        };
        this.voters.push(voter);
        return voter;
    }

    addCandidate(pos) {
        if (this.candidates.length > this.MAX_NUMBER_CANDIDATES) {
            return undefined;
        }
        let candidate = {
            id: this.candidates.length,
            pos: pos,
            color: this.generateRandomColor(),
            party: this.generateRandomPartyName()
        };
        this.candidates.push(candidate);
        // Candidate is also voter
        let voter = this.addVoter(pos);
        voter.isCandidate = true;

        return candidate;
    }

    calculateDistance(pos1, pos2) {
        return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
    }

    getPreferences(voter) {
        let distances = [];
        this.candidates.forEach(candidate => {
            let dist = this.calculateDistance(voter.pos, candidate.pos);
            distances.push({ id: candidate.id, dist: dist });
        });
        distances.sort((a, b) => a.dist - b.dist);
        return distances.map((distance) => distance.id);
    }

    calculatePreferences() {
        let preferenceMap = {};
        this.voters.forEach(voter => preferenceMap[voter.id] = this.getPreferences(voter));
        return preferenceMap;
    }

    getFirstPreferences() {
        let preferenceMap = {};
        this.voters.forEach(voter => preferenceMap[voter.id] = this.getPreferences(voter)[0]);
        return preferenceMap;
    }

    getFirstPreferencePerCandidate() {
        const voteCounts = {};
        this.candidates.forEach(candidate => voteCounts[candidate.id] = 0);

        const firstPreferences = this.getFirstPreferences();
        Object.entries(firstPreferences).forEach(voterCandidatePair =>
            voteCounts[voterCandidatePair[1]] = voteCounts[voterCandidatePair[1]] + 1);
        return voteCounts;
    }

    calculatePreferenceMatrix() {
        const matrix = new Array(this.candidates.length).fill(0).map(() => new Array(this.candidates.length).fill(0));
        let preferences = this.calculatePreferences();
        this.voters.forEach((voter) => {
            // This runtime is horrendous
            for (let i = 0; i < this.candidates.length; i++) {
                for (let j = 0; j < this.candidates.length; j++) {
                    if (preferences[voter.id].indexOf(i) < preferences[voter.id].indexOf(j)) {
                        matrix[i][j]++;
                    }
                }
            }
        });
        return matrix;
    }

    getDissatisfactionList(winner_id) {
        const dissatisfactionMap = this.calculateDissatisfaction(winner_id);
        const dissatisfactions = [];
        for (let key in dissatisfactionMap) {
            dissatisfactions.push(dissatisfactionMap[key]);
        }

        return dissatisfactions;
    }

    getAverageDissatisfaction(winner_id) {
        let dissatisfactions = this.getDissatisfactionList(winner_id);
        return dissatisfactions.reduce((a, b) => (a + b)) / dissatisfactions.length;
    }

    getMedianDissatisfaction(winner_id) {
        let dissatisfactions = this.getDissatisfactionList(winner_id);
        const mid = Math.floor(dissatisfactions.length / 2);
        dissatisfactions.sort();
        return dissatisfactions.length % 2 !== 0 ?
            dissatisfactions[mid] :
            (dissatisfactions[mid - 1] + dissatisfactions[mid]) / 2;
    }

    getDiagonalLength() {
        return Math.sqrt(2);
    }

    calculateDissatisfaction(winner_id) {
        let dissatisfactionMap = {};
        let winner = this.candidates[winner_id];
        this.voters.forEach((voter) => dissatisfactionMap[voter.id] = this.calculateDistance(voter.pos, winner.pos) /
      this.getDiagonalLength());
        return dissatisfactionMap;
    }

    get votersWithoutCandidates() {
        return this.voters.filter((voter) => !voter.isCandidate);
    }

}
