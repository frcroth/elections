'use strict';

class Model {

    constructor() {
        this.MAX_NUMBER_CANDIDATES = 8
        this.voters = []
        this.candidates = []
    }

    generateRandomColor() {
        return '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6)
    }

    generateRandomPartyName() {
        let attributes = ["Green", "Socialist", "Conservative", "Liberal", "Reform", "Social", "Progressive", "Nationalist", "Popular", "Indigenous", "Constitutional", "Centrist", "Satirical", "Technocratic", "Marxist", "Leninist", "Trotzkyist", "Neo", "Democratic", "Orthodox", "Humanist", "Libertarian", "Fundamentalist", "Accelerationist", "Republican", "Imperialist", "Capitalist", "Populist", "Worker's", "Royalist", "Anarchist", "Law", "Order", "Spartacist", "People's", "Freedom", "Pirate", "Ecologic", "Free", "Animal's Rights", "Alternative", "Federal", "Whig", "Citizen's", "Farmer's", "Left", "Right", "Feminist", "Spiritual", "Labor", "Independent", "Young People's", "Old People's", "Unity", "Equality", "New", "Action", "Families", "Justice", "Peace", "Pacifist", "Prohibition", "Agrianist", "Ruralist"]
        let types = ["Party", "Alliance", "Block", "Front", "Party", "Party", "Party", "Party", "Union", "League", "Group", "Forum", "Revolution", "Federation", "Movement", "Action", "Party", "Party", "Party", "Party", "Party"]
        let attribute1 = attributes[Math.floor(Math.random() * attributes.length)];
        let attribute2 = attributes[Math.floor(Math.random() * attributes.length)];
        let type = types[Math.floor(Math.random() * types.length)];
        return attribute1 + " " + attribute2 + " " + type
    }

    addVoter(pos) {
        this.voters.push({
            id: this.voters.length,
            x: pos.x,
            y: pos.y
            // Maybe add name, history, ...
        })
    }

    addCandidate(pos) {
        if (this.candidates.length > this.MAX_NUMBER_CANDIDATES) {
            return undefined;
        }
        let candidate = {
            id: this.candidates.length,
            x: pos.x,
            y: pos.y,
            color: this.generateRandomColor(),
            party: this.generateRandomPartyName()
        }
        console.log(candidate.party)
        this.candidates.push(candidate)
        // Candidate is also voter
        this.addVoter(pos)
        return candidate
    }

    calculateDistance(pos1, pos2) {
        return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2)
    }

    getPreferences(voter) {
        let distances = []
        this.candidates.forEach((candidate) => {
            let dist = this.calculateDistance({ x: voter.x, y: voter.y }, { x: candidate.x, y: candidate.y })
            distances.push({ id: candidate.id, dist: dist })
        })
        distances.sort((a, b) => a.dist - b.dist)
        return distances.map((distance) => distance.id)
    }

    calculatePreferences() {
        let preferenceMap = {}
        this.voters.forEach((voter) => preferenceMap[voter.id] = this.getPreferences(voter))
        return preferenceMap
    }

}