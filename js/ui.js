'use strict';

let canvas = document.getElementById("political_compass");
document.model = new Model()
let drawMode = 0

function drawLines(canvas) {
    let ctx = canvas.getContext("2d");
    ctx.moveTo(200, 0);
    ctx.lineTo(200, 400);
    ctx.stroke();
    ctx.moveTo(0, 200);
    ctx.lineTo(400, 200);
    ctx.stroke();
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return { x: x, y: y }
}

function drawPoint(canvas, pos, color) {
    let circle = new Path2D();
    circle.arc(pos.x, pos.y, 10, 0, 2 * Math.PI);
    let ctx = canvas.getContext("2d")
    ctx.fillStyle = color;
    ctx.fill(circle);
}

function addVoter(canvas, pos) {
    drawPoint(canvas, pos, 'grey')
    document.model.addVoter(pos)
}

// https://stackoverflow.com/questions/11867545/change-text-color-based-on-brightness-of-the-covered-background-area
function getContrastYIQ(hexcolor) {
    hexcolor = hexcolor.replace("#", "")
    const r = parseInt(hexcolor.substr(0, 2), 16)
    const g = parseInt(hexcolor.substr(2, 2), 16)
    const b = parseInt(hexcolor.substr(4, 2), 16)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    return (yiq >= 128) ? '#000000' : '#FFFFFF'
}

function listCandidates() {
    const list = document.getElementById("candidate_list")
    list.innerHTML = ''
    document.model.candidates.forEach((candidate) => {
        let list_item = document.createElement("li")
        list_item.innerHTML = "<div class=\"party-container\" style=\"background-color: " + candidate.color + "; color: " + getContrastYIQ(candidate.color) + ";\">" + candidate.party + "</div>"
        list.appendChild(list_item)
    })
}

function addCandidate(canvas, pos) {
    let candidate = document.model.addCandidate(pos)
    if (candidate) {
        drawPoint(canvas, pos, candidate.color)
        listCandidates(candidate)
    }
    else {
        alert("Max number of candidates reached")
    }
    return candidate
}

function setDrawMode(mode) {
    drawMode = mode
}

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function generateRandomPoints() {
    if (drawMode === 0) {
        for (let i = 0; i < 10; i++) {
            addVoter(canvas, { x: getRandomInteger(0, 400), y: getRandomInteger(0, 400) })
        }
    }
    if (drawMode === 1) {
        for (let i = 0; i < 4; i++) {
            let candidate = addCandidate(canvas, { x: getRandomInteger(0, 400), y: getRandomInteger(0, 400) })
            if (!candidate) {
                break
            }
        }
    }
}

function readyCanvas() {
    drawLines(canvas)

    canvas.addEventListener('mousedown', function (e) {
        let pos = getCursorPosition(canvas, e)
        if (drawMode === 0) {
            addVoter(canvas, pos)
        }
        if (drawMode === 1) {
            addCandidate(canvas, pos)
        }

    })

}

readyCanvas()
