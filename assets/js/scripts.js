const innings = document.querySelectorAll('.score-tbl tbody td:nth-child(n+4)');
const scoreBoxes = document.querySelectorAll('.score-box');

addEventListeners();

function addEventListeners() {
    innings.forEach((inning) => {
        inning.addEventListener('click', (evt) => {
            resetZoomedInnings();
            inning.classList.toggle('score-zoom');
        });
    });

    scoreBoxes.forEach((box) => {
        box.addEventListener('dblclick', (evt) => {
            box.parentElement.classList.remove('score-zoom');
        });
    });
}

function resetZoomedInnings() {
    innings.forEach((inning) => {
        inning.classList.remove('score-zoom');
    });    
}