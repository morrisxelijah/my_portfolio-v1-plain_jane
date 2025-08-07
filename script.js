/* =========================================================
   portfolio helper scripts
   =========================================================
    ✦ toggles light / dark theme
    ✦ random icon card hide and seek
    ✦ pops out each app window at a random vw / vh offset
    ✦ stagger pop in animation for trigger fingers
    ✦ brings most‑recent window to front
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */



/* ----------------------------
    only run after DOM loads
   ---------------------------- */
document.addEventListener('DOMContentLoaded', () => {

    // cache target elements
    const themeToggleCheckbox = document.getElementById('theme-toggle');
    const randomIconWrapper = document.getElementById('random-wrapper');
    const randomIconCheckbox = document.getElementById('toggle-random');
    const allWindowToggles = document.querySelectorAll('.window-toggle');

    const openQueue = [];  // track window queue (windows waiting for staggered open)
    let   isAnimating = false;    // flag so we know when a window is sliding in


    /* -----------------------------
        helper – apply theme + icon
       ----------------------------- */
    function applyTheme(isDarkMode) {

    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');    // set data-theme attribute

    themeToggleCheckbox.checked = isDarkMode;    // sync with ui checkbox

    // smoothly hide / show the random icon (allows for animations as opposed to display: none)
    randomIconWrapper.classList.toggle('off', !isDarkMode);  // .off class collapses the flex item

    if (!isDarkMode) randomIconCheckbox.checked = false;    // force‑close the random window if we leave dark‑mode
    }

    // default to light theme on first load
    applyTheme(false);

    // click / tap on the sun‑moon icon
    themeToggleCheckbox.addEventListener('change', () => applyTheme(themeToggleCheckbox.checked));


    /* ---------------------------------
        helper – random vw / vh pop‑out
       --------------------------------- */
    function randomizePosition(appWindow) {
    // skip on mobile (bottom sheets)
    if (window.innerWidth < 768) return;

        const wvw  = (appWindow.offsetWidth  / window.innerWidth ) * 100;
        const hvh  = (appWindow.offsetHeight / window.innerHeight) * 100;

        const maxLeft = 95 - wvw;
        const maxTop  = 95 - hvh;

        const left = (Math.random() * maxLeft + 5).toFixed(2) + 'vw';
        const top  = (Math.random() * maxTop  + 5).toFixed(2) + 'vh';

        appWindow.style.setProperty('--popout-left', left);
        appWindow.style.setProperty('--popout-top',  top);
    }


    /* ----------------------------
        helper – raise z‑index
    ----------------------------- */
    let zIndexCounter = 200;  // start in front of css (100)

    function bringToFront(appWindow) {
        appWindow.style.zIndex = ++zIndexCounter;
    }


    /* ----------------------------
        stagger window open
    ----------------------------- */
    function enqueueWindow(appWindow) {
        openQueue.push(appWindow);
        processQueue();
    }

    function processQueue() {
    if (isAnimating || openQueue.length === 0) return;   // either busy or nothing to do

        const nextWindow = openQueue.shift();
        isAnimating = true;

        // kick off popout
        randomizePosition(nextWindow);
        bringToFront(nextWindow);

        // add delay after the css app window transition
        const delay = window.innerWidth < 768 ? 500 : 250;   // a hair longer than css anim
        setTimeout(() => {
            isAnimating = false;    // ready for to open next window
            processQueue();         // handle queued windows
        }, delay);
    }


    /* ----------------------------
        wire up every window toggle
    ----------------------------- */
    allWindowToggles.forEach(toggle => {
        const windowSection = toggle.nextElementSibling.nextElementSibling;  // label ➜ section

        // when a window opens
        toggle.addEventListener('change', () => {
            if (toggle.checked) {
            enqueueWindow(windowSection);   // stagger window entrance
            }
        });

        // clicking anywhere inside an open window also lifts it
        windowSection.addEventListener('mousedown', () => bringToFront(windowSection));
    });

    // enable transitions only after initial layout is set (prevent flash on load/reload)
    document.body.classList.add('ready');

});
