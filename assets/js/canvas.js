const canvas = document.querySelectorAll('.score-canvas');
let context;
let isDrawing = false;
let x = 0;
let y = 0;
let offsetX;
let offsetY;

const drawSettings = {
    color: 'black',
    lineWidth: '1'
}

function startup() {
    canvas.forEach((board) => {
        context = board.getContext('2d');
        board.addEventListener('touchstart', handleStart);
        board.addEventListener('touchend', handleEnd);
        board.addEventListener('touchcancel', handleCancel);
        board.addEventListener('touchmove', handleMove);
        board.addEventListener('mousedown', (e) => {
            x = e.offsetX;
            y = e.offsetY;
            isDrawing = true;
        });
    
        board.addEventListener('mousemove', (e) => {
            if (isDrawing) {
                drawLine(context, x, y, e.offsetX, e.offsetY);
                x = e.offsetX;
                y = e.offsetY; 
            }
        });
    
        board.addEventListener('mouseup', (e) => {
            if (isDrawing) {
                drawLine(context, x, y, e.offsetX, e.offsetY);
                x = 0;
                y = 0;
                isDrawing = false;
            }
        });
    
        board.addEventListener('mouseout', (e) => {
            isDrawing = false;
        });
    });
}

document.addEventListener('DOMContentLoaded', startup);

const ongoingTouches = [];

function handleStart(evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;

    offsetX = canvas.getBoundingClientRect().left;
    offsetY = canvas.getBoundingClientRect().top;

    for (let i = 0; i < touches.length; i++) {
        ongoingTouches.push(copyTouch(touches[i]));
    }
}
  
function handleMove(evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        const idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            context.beginPath();
            context.moveTo(ongoingTouches[idx].clientX - offsetX, ongoingTouches[idx].clientY - offsetY);
            context.lineTo(touches[i].clientX - offsetX, touches[i].clientY - offsetY);
            context.lineWidth = drawSettings.lineWidth;
            context.strokeStyle = drawSettings.color;
            context.lineJoin = 'round';
            context.closePath();
            context.stroke();
            ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
        }
    }
}
  
function handleEnd(evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        let idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {
            context.lineWidth = drawSettings.lineWidth;
            context.fillStyle = drawSettings.color;
            ongoingTouches.splice(idx, 1);  // remove it; we're done
        }
    }
}
  
function handleCancel(evt) {
    evt.preventDefault();
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        let idx = ongoingTouchIndexById(touches[i].identifier);
        ongoingTouches.splice(idx, 1);  // remove it; we're done
    }
}

function copyTouch({ identifier, clientX, clientY }) {
    return { identifier, clientX, clientY };
}
  
function ongoingTouchIndexById(idToFind) {
    for (let i = 0; i < ongoingTouches.length; i++) {
        const id = ongoingTouches[i].identifier;

        if (id === idToFind) {
            return i;
        }
    }

    return -1;  // not found
}
  
function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = drawSettings.color;
    context.lineWidth = drawSettings.lineWidth;
    context.lineJoin = 'round';
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.closePath();
    context.stroke();
}