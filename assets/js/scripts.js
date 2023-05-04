const scoreBoxes = document.querySelectorAll('.score-tbl tbody td:nth-child(n+4)');
const colDivs = document.querySelectorAll('.score-tbl tbody td:nth-child(-n+3) div');
const scoreDiamonds = document.querySelectorAll('.score-diamond');
const btnClose = document.querySelectorAll('.btn-close');
const btnReset = document.querySelectorAll('.btn-reset');
let zoomedCell;

addEventListeners();

function addEventListeners() {
    // Click listener to zoom in on score boxes
    scoreBoxes.forEach((box) => {
        box.addEventListener('click', (evt) => {
            resetZoomedInnings();
            box.classList.toggle('score-zoom');

            if (!box.classList.contains('canvas-active')) initCanvas(box);
        });
    });

    // Close zoomed in score box when clicked outside of it
    document.body.addEventListener('click', (evt) => {
        if (!evt.target.closest('.score-zoom')) {
            resetZoomedInnings();
        }
    });

    // Make first three columns of score card editable
    colDivs.forEach((el) => {
        el.addEventListener('dblclick', (evt) => {
            el.setAttribute('contenteditable', true);
            el.focus();
        });

        el.addEventListener('keypress', (evt) => {
            if (evt.which === 13) {
                evt.preventDefault(); // disable Enter key
            }
        });
    });

    // Fill in/clear diamond on double click
    scoreDiamonds.forEach((diamond) => {
        diamond.addEventListener('dblclick', (evt) => {
            if (diamond.classList.contains('diamond-fill')) {
                diamond.classList.remove('diamond-fill');
            }
            else {
                diamond.classList.add('diamond-fill');
            }
        });
    });

    // Close zoomed in score box
    btnClose.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
            setTimeout(() => {
                evt.target.closest('td').classList.remove('score-zoom');
                evt.target.closest('td').classList.remove('canvas-active');
            }, 25);
        });
    });

    // Reset all info from score box
    btnReset.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
            const box = evt.target.closest('.score-box');
        });
    });
}

function resetZoomedInnings() {
    scoreBoxes.forEach((box) => {
        box.classList.remove('score-zoom');
    });    
}

function initCanvas(el) {
    el.classList.add('canvas-active');
    const canvas = el.querySelector('canvas');
    const context = canvas.getContext('2d');

    let isDrawing = false;
    let x = 0;
    let y = 0;
    let offsetX;
    let offsetY;
    let diamond;

    diamond = el.querySelector('.score-diamond');

    const drawSettings = {
        color: 'black',
        lineWidth: '1'
    }

    canvas.addEventListener('touchstart', handleStart);
    canvas.addEventListener('touchend', handleEnd);
    canvas.addEventListener('touchcancel', handleCancel);
    canvas.addEventListener('touchmove', handleMove);
    canvas.addEventListener('mousedown', (e) => {
        x = e.offsetX;
        y = e.offsetY;
        isDrawing = true;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDrawing) {
            drawLine(context, x, y, e.offsetX, e.offsetY);
            x = e.offsetX;
            y = e.offsetY;
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (isDrawing) {
            drawLine(context, x, y, e.offsetX, e.offsetY);
            x = 0;
            y = 0;
            isDrawing = false;
        }
    });

    canvas.addEventListener('mouseout', (e) => {
        isDrawing = false;
    });

    canvas.addEventListener('dblclick', (e) => {
        diamond.classList.toggle('diamond-fill');
    });

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
}