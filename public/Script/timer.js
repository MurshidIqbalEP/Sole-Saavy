const seconds=60;

function updateTimer() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = seconds;

    if (seconds <= 0) {
        clearInterval(timerInterval);

    } else {
        seconds--;
    }
}

function startTimer() {
    updateTimer(); // Update the timer immediately

    // Set up a recurring timer that calls updateTimer every second
    timerInterval = setInterval(updateTimer, 1000);
}

module.exports=startTimer