const innings = document.querySelectorAll('.score-tbl tbody td:nth-child(n+4)');
const scoreBoxes = document.querySelectorAll('.score-box');

addEventListeners();

function addEventListeners() {
    innings.forEach((inning) => {
        inning.addEventListener('click', (evt) => {
            resetZoomedInnings();
            inning.classList.toggle('score-zoom');
            initCloseBtn(inning);
        });
    });

    scoreBoxes.forEach((box) => {
        box.addEventListener('dblclick', (evt) => {
            box.parentElement.classList.remove('score-zoom');
        });
    });
}

function initCloseBtn(el) {
    const btnClose = el.querySelector('.btn-close');

    btnClose.addEventListener('click', (evt) => {
        const zoomedCell = btnClose.closest('td');
        setTimeout(() => {
            zoomedCell.classList.remove('score-zoom');
        }, 25);
    });
}

function resetZoomedInnings() {
    innings.forEach((inning) => {
        inning.classList.remove('score-zoom');
    });    
}