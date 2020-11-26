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
            listCandidates(candidate);
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
let coordinateSystem = new CoordinateSystem("coordinate-system");
$(window).on('resize', coordinateSystem.onResize);
coordinateSystem.adjustToSize();

function listCandidates() {
    const list = document.getElementById("candidate_list");
    list.innerHTML = '';
    document.model.candidates.forEach((candidate) => {
        let list_item = document.createElement("li");
        list_item.innerHTML = "<div class=\"party-container\" style=\"background-color: " + candidate.color
            + "; color: " + getContrastYIQ(candidate.color) + ";\">" + candidate.party + "</div>";
        list.appendChild(list_item);
    })
}

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
