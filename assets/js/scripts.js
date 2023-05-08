const scoreBoxes = document.querySelectorAll('.score-tbl tbody td:nth-child(n+4)');
const colDivs = document.querySelectorAll('.score-tbl tbody td:nth-child(-n+3) div');
const gridCols = document.querySelectorAll('.grid-col');
const pitchersTblCells = document.querySelectorAll('.pitchers-tbl tbody td');
const editableDivs = document.querySelectorAll('[contenteditable="true"]');
const scoreCallBoxes = document.querySelectorAll('.score-call-box');
const baseBtns = document.querySelectorAll('.base-btns button');
const btnClose = document.querySelectorAll('.btn-close');
const btnReset = document.querySelectorAll('.btn-reset');
const btnZoom = document.querySelectorAll('.btn-zoom');
let zoomedCell;

addEventListeners();

function addEventListeners() {
    // Click listener to zoom in on score boxes
    btnZoom.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
            const parentCell = btn.closest('td');
            deactivateZoomedInnings();
            parentCell.classList.toggle('score-zoom');

            if (parentCell.getAttribute('canvas-active')) return;

            initCanvas(parentCell);
        });
    });

    // Close zoomed in score box when clicked outside of it
    document.body.addEventListener('click', (evt) => {
        if (!evt.target.closest('.score-zoom')) {
            deactivateZoomedInnings();
        }
    });

    // Make all grid col divs editable 
    gridCols.forEach((col) => {
        initEditable(col);

        col.addEventListener('click', (evt) => {
            const range = document.createRange();
            const selection = window.getSelection();
        
            range.selectNodeContents(col);          
            selection.removeAllRanges();
            selection.addRange(range);
        });
    });   

    // Make first three columns of score card editable
    colDivs.forEach((el) => {
        el.addEventListener('click', (evt) => initEditable(el));

        el.addEventListener('keypress', (evt) => {
            if (evt.which === 13) {
                evt.preventDefault(); // disable Enter key
            }
        });
    });

    // Make pitchers table cells editable on click
    pitchersTblCells.forEach((el) => {
        el.addEventListener('click', (evt) => initEditable(el));

        el.addEventListener('keypress', (evt) => {
            if (evt.which === 13) {
                evt.preventDefault(); // disable Enter key
            }
        });
    });   

    // Highlight text in content editable divs
    editableDivs.forEach((el) => {
        el.addEventListener('click', (evt) => {
            const range = document.createRange();
            const selection = window.getSelection();
        
            range.selectNodeContents(el);          
            selection.removeAllRanges();
            selection.addRange(range);
        });
    });

    // Close zoomed in score box
    btnClose.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
            setTimeout(() => {
                evt.target.closest('td').classList.remove('score-zoom');
          //      evt.target.closest('td').classList.remove('canvas-active');
            }, 25);
        });
    });

    // Toggle active state on base buttons (1B, 2B, 3B)
    baseBtns.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
            btn.classList.toggle('base-active');
        });
    });

    // Reset all info from score box
    btnReset.forEach((btn) => {
        btn.addEventListener('click', (evt) => {
            const zoomed = btn.closest('.score-zoom');
            const diamond = zoomed.querySelector('.score-diamond');
            const btnAdd = zoomed.querySelector('.btn-add');
            const btnRemove = zoomed.querySelector('.btn-remove');
            const canvas = zoomed.querySelector('canvas');
            const context = canvas.getContext('2d');
            diamond.classList.remove('diamond-fill');
            btnAdd.classList.remove('d-none');
            btnRemove.classList.add('d-none');
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            zoomed.removeAttribute('canvas-active');
            resetScoreCallBoxes(zoomed);
            resetBaseBtns(zoomed);
        });
    });

    // Balls and strikes boxes listener
    scoreCallBoxes.forEach((box) => {
        box.addEventListener('click', (evt) => {
            box.classList.toggle('box-filled');
        });
    });

}

// Zoom out of active box score
function deactivateZoomedInnings() {
    scoreBoxes.forEach((box) => {
        box.classList.remove('score-zoom');
        box.classList.remove('canvas-active');
    });    
}

// Clear out filled balls and strikes
function resetScoreCallBoxes(el) {
    const callBoxes = el.querySelectorAll('.score-call-box');
    callBoxes.forEach((box) => {
        box.classList.remove('box-filled');
    });                                  
}

// Initialize content editable attribute on element
function initEditable(el) {
    const range = document.createRange();
    const selection = window.getSelection();

    el.setAttribute('contenteditable', true);
    el.focus();

    range.selectNodeContents(el);          
    selection.removeAllRanges();
    selection.addRange(range);
}

// Reset state of base buttons
function resetBaseBtns(el) {
    const btns = el.querySelectorAll('.base-btns button');
    btns.forEach((btn) => {
        btn.classList.remove('base-active');
    });

    el.classList.remove('oneb','twob','threeb');
}

// Initialize the canvas for free drawing
function initCanvas(el) {
    console.log('init canvas');
    const canvas = el.querySelector('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 134;
    canvas.height = 104;

    let isDrawing = false;
    let x = 0;
    let y = 0;
    let offsetX;
    let offsetY;
    let diamond, 
        btnAdd, 
        btnRemove,
        btn1B,
        btn2B,
        btn3B;

    diamond = el.querySelector('.score-diamond');
    btnAdd = el.querySelector('.btn-add');
    btnRemove = el.querySelector('.btn-remove');
    btn1B = el.querySelector('.btn-1b');
    btn2B = el.querySelector('.btn-2b');
    btn3B = el.querySelector('.btn-3b');

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

    btnAdd.addEventListener('click', (evt) => {
        diamond.classList.add('diamond-fill');
        btnAdd.classList.add('d-none');
        btnRemove.classList.remove('d-none');
        resetBaseBtns(el);
    });

    btnRemove.addEventListener('click', (evt) => {
        diamond.classList.remove('diamond-fill');
        btnRemove.classList.add('d-none');
        btnAdd.classList.remove('d-none');
    });

    btn1B.addEventListener('click', (evt) => {
        el.classList.toggle('oneb');
    });

    btn2B.addEventListener('click', (evt) => {
        el.classList.toggle('twob');
    });

    btn3B.addEventListener('click', (evt) => {
        el.classList.toggle('threeb');
    });

    const ongoingTouches = [];

    function handleStart(evt) {
        if (evt.cancelable) evt.preventDefault();
        const touches = evt.changedTouches;
        offsetX = canvas.getBoundingClientRect().left;
        offsetY = canvas.getBoundingClientRect().top;
    
        for (let i = 0; i < touches.length; i++) {
            ongoingTouches.push(copyTouch(touches[i]));
        }
    }
      
    function handleMove(evt) {
        if (evt.cancelable) evt.preventDefault();
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

        el.setAttribute('canvas-active', true);
    }
      
    function handleEnd(evt) {
        if (evt.cancelable) evt.preventDefault();
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
        if (evt.cancelable) evt.preventDefault();
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

        el.setAttribute('canvas-active', true);
    }
}