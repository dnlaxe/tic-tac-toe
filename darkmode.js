// DARK LIGHT MODE TOGGLE
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');

    if (document.body.classList.contains('dark-theme')) {
        themeToggle.src = "icons/light.svg";
    } else {
        themeToggle.src = "icons/dark.svg";
    }
});