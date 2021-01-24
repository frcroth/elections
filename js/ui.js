'use strict';

class CoordinateSystem {

    constructor(canvasElementId) {
        this.canvas = document.getElementById(canvasElementId);
        this.context = this.canvas.getContext("2d");
        this.size = this.canvas.width;
        this.canvas.height = this.canvas.width;
        this.drawMode = 0;
        this.readyCanvas();
        this.model = document.model;


    }

    readyCanvas() {
        this.clearCanvas();
        this.drawLines();
        if (!this.eventListenerInitialized) {
            this.canvas.addEventListener('mousedown', this.handleMouseClick);
            this.eventListenerInitialized = true;
        }

    }

    handleMouseClick(event) {
        let pos = coordinateSystem.getCursorPosition(event);
        if (coordinateSystem.drawMode === 0) {
            coordinateSystem.addVoter(pos);
        }
        if (coordinateSystem.drawMode === 1) {
            coordinateSystem.addCandidate(pos);
        }
    }

    drawLines() {
        this.context.moveTo(this.size / 2, 0);
        this.context.lineTo(this.size / 2, this.size);
        this.context.stroke();
        this.context.moveTo(0, this.size / 2);
        this.context.lineTo(this.size, this.size / 2);
        this.context.stroke();
    }

    getCursorPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        let pos = { x: x / rect.width, y: y / rect.height };
        return pos;
    }

    drawPoint(pos, color) {
        let circle = new Path2D();
        circle.arc(pos.x * this.size, pos.y * this.size, this.size / 40, 0, 2 * Math.PI);
        this.context.fillStyle = color;
        this.context.fill(circle);
    }

    setDrawMode(mode) {
        this.drawMode = mode;
        activateDropdownMenu();
    }

    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawCandidatePoint(candidate) {
        this.drawPoint(candidate.pos, candidate.color);
    }

    addCandidate(pos) {
        let candidate = this.model.addCandidate(pos);
        if (candidate) {
            this.drawCandidatePoint(candidate);
            document.electionSimulation.updateCandidateList();
        }
        else {
            alert("Max number of candidates reached");
        }
        return candidate;
    }

    drawVoterPoint(voter) {
        this.drawPoint(voter.pos, 'grey');
    }

    addVoter(pos) {
        let voter = this.model.addVoter(pos);
        this.drawVoterPoint(voter);
    }

    generateRandomPoints() {
        if (this.drawMode === 0) {
            for (let i = 0; i < 10; i++) {
                this.addVoter({ x: Math.random(), y: Math.random() });
            }
        }
        if (this.drawMode === 1) {
            for (let i = 0; i < 4; i++) {
                let candidate = this.addCandidate({ x: Math.random(), y: Math.random() });
                if (!candidate) {
                    break;
                }
            }
        }
    }

    redrawFromModel() {
        this.readyCanvas();
        this.model.votersWithoutCandidates.forEach(voter => this.drawVoterPoint(voter));
        this.model.candidates.forEach(candidate => this.drawCandidatePoint(candidate));
    }

    onResize() {
        coordinateSystem.adjustToSize();
    }

    adjustToSize() {
        this.container = document.getElementById("coordinate-system-box");
        this.size = this.container.getBoundingClientRect().width;
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.redrawFromModel();
    }

}

document.model = new Model();

class ElectionSimulation {

    constructor() {
        this.centralColumn = document.getElementById('central-column')
        this.electionMode = "one-seat";
        this.build();
        this.initModeSelector();
        document.electionSimulation = this;
    }

    build() {
        this.centralColumn.innerHTML = "";

        this.headline = document.createElement('h4');
        this.centralColumn.appendChild(this.headline);

        this.candidateList = document.createElement('div');
        this.candidateList.id = "candidate-list";
        this.candidateList.classList.add("row");
        this.centralColumn.appendChild(this.candidateList);

        this.electionOptions = document.createElement('div');
        this.electionOptions.classList.add("card");
        this.centralColumn.appendChild(this.electionOptions);

        this.buildElectionOptions(this.electionOptions);
    }

    initModeSelector() {
        this.oneSeatRadio = document.getElementById("one-seat-radio");
        this.oneSeatRadio.onchange = () => this.setMode();

        this.multiSeatRadio = document.getElementById("multi-seat-radio");
        this.multiSeatRadio.onchange = () => this.setMode();
    }

    setMode() {
        if(this.multiSeatRadio.checked){
            this.electionMode = "multi-seat";
        }
        else {
            this.electionMode = "one-seat";
        }
        this.buildElectionOptions(this.electionOptions);
    }

    buildElectionOptions(node) {
        node.innerHTML = "";
        if (this.electionMode == "one-seat") {
            this.headline.innerHTML = "Candidates";
            this.buildOneSeatElectionOptions(node);
        }
        else {
            this.headline.innerHTML = "Parties";
            this.buildMultiSeatElectionOptions(node);
        }
    }

    buildOneSeatElectionOptions(node) {

        this.firstPastThePost = document.createElement("button");
        this.firstPastThePost.onclick = () => this.performFirstPastThePost();
        this.firstPastThePost.classList.add("btn", "btn-secondary");
        this.firstPastThePost.innerHTML = "Perform first past the post election";
        node.appendChild(this.firstPastThePost);

        this.instantRunoff = document.createElement("button");
        this.instantRunoff.onclick = () => this.performInstantRunoff();
        this.instantRunoff.classList.add("btn", "btn-secondary");
        this.instantRunoff.innerHTML = "Perform instant runoff election";
        node.appendChild(this.instantRunoff);

        this.bordaCount = document.createElement("button");
        this.bordaCount.onclick = () => this.performBordaCount();
        this.bordaCount.classList.add("btn", "btn-secondary");
        this.bordaCount.innerHTML = "Perform Borda count";
        node.appendChild(this.bordaCount);

        this.bucklinVote = document.createElement("button");
        this.bucklinVote.onclick = () => this.performBucklinVote();
        this.bucklinVote.classList.add("btn", "btn-secondary");
        this.bucklinVote.innerHTML = "Perform Bucklin vote";
        node.appendChild(this.bucklinVote);

        this.condorcetMethod = document.createElement("button");
        this.condorcetMethod.onclick = () => this.performCondorcet();
        this.condorcetMethod.classList.add("btn", "btn-secondary");
        this.condorcetMethod.innerHTML = "Perform pairwise condorcet";
        node.appendChild(this.condorcetMethod);
    }

    buildMultiSeatElectionOptions() {

    }

    performFirstPastThePost() {
        this.fptp = new FirstPastThePost();
        this.fptp.performElection();
    }

    performInstantRunoff() {
        this.ir = new InstantRunoff();
        this.ir.performElection();
    }

    performBordaCount() {
        this.bc = new BordaCount();
        this.bc.performElection();
    }

    performBucklinVote() {
        this.buc = new BucklinVote();
        this.buc.performElection();
    }

    performCondorcet() {
        this.cm = new CondorcetMethod();
        this.cm.performElection();
    }

    performRunOff() {
        this.fptp.performRunOffElection();
    }

    performInstantRunoffIteration() {
        this.ir.performIteration();
    }

    performBucklinIteration() {
        this.buc.performIteration();
    }

    updateCandidateList() {
        const list = this.candidateList;
        list.innerHTML = '';
        document.model.candidates.forEach((candidate) => {
            let listItemContainer = document.createElement("div");
            listItemContainer.classList.add("col-sm");
            listItemContainer.classList.add("party-container");
            listItemContainer.style["background-color"] = candidate.color;
            listItemContainer.style["color"] = getContrastYIQ(candidate.color);
            let listItem = document.createElement("p");
            listItem.innerHTML = candidate.party;
            listItemContainer.appendChild(listItem)
            list.appendChild(listItemContainer);
        })
    }
}


let coordinateSystem = new CoordinateSystem("coordinate-system");
$(window).on('resize', coordinateSystem.onResize);
coordinateSystem.adjustToSize();
let electionSimulation = new ElectionSimulation();

// https://stackoverflow.com/questions/11867545/change-text-color-based-on-brightness-of-the-covered-background-area
function getContrastYIQ(hexColor) {
    hexColor = hexColor.replace("#", "");
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

function activateDropdownMenu() {
    if (coordinateSystem.drawMode === 1) {
        document.getElementById("voters-menu-item").classList.remove("active");
        document.getElementById("candidates-menu-item").classList.add("active");
    } else {
        document.getElementById("voters-menu-item").classList.add("active");
        document.getElementById("candidates-menu-item").classList.remove("active");
    }
}
