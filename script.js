/*

*/



/* ----------------------------
   TOGGLE THEMES
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