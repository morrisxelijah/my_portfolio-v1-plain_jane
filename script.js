/*
title / intro / script summrary goes here
*/



/* ----------------------------
   toggle themes
----------------------------- */

document.addEventListener('DOMContentLoaded', function () {    // wait until the html is fully loaded before running this function

    const toggle = document.getElementById('theme-toggle');    // get the theme toggle checkbox and set it to the variable

    /* helper – switch attribute on / off */
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);    // attribute is always set
        toggle.checked = (theme === 'dark');    // sync ui
    }

    /* click / tap */
    toggle.addEventListener('change', () => {
        setTheme(toggle.checked ? 'dark' : 'light');    // dark = checked
    });

    /* default load is light mode (no persistence for now) */
    setTheme('light');
});




/* ----------------------------
   dark mode only hide and seek
----------------------------- */

/* cache the needed elements at load */
const randomWrapper = document.getElementById('random-wrapper');    // the whole grid cell
const randomCheckbox = document.getElementById('toggle-random');    // checkbox (boolean)
const themeToggle   = document.getElementById('theme-toggle');    // dark/light switch

/* helper – switch the random icon on / off */
function showRandom(show) {
  /* make sure app window is closed */
  if (!show) randomCheckbox.checked = false;

  /* use inline style to override stylesheet */
  randomWrapper.style.display = show ? '' : 'none';
}

/* start hidden by default (light mode) */
showRandom(false);

/* runs every time the user changes the theme */
themeToggle.addEventListener('change', () => {
  const darkMode = themeToggle.checked;   // checked ⇒ dark
  showRandom(darkMode);
});