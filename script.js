/* =========================================================
   portfolio helper scripts
   =========================================================
    ✦ toggles light / dark theme
    ✦ random icon card hide and seek
    ✦ pops out each app window at a random vw / vh offset
    ✦ stagger pop in animation for trigger fingers
    ✦ brings most‑recent window to front
    ✦ makes app windows draggable (desktop only)
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
    let   isAnimating = false;    // true when a window is still opening


    /* -----------------------------
        helper – apply theme + icon
       ----------------------------- */
    function applyTheme(isDarkMode) {

    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');    // set data-theme on html

    themeToggleCheckbox.checked = isDarkMode;    // sync light/dark icon's with hidden ui checkbox

    // smoothly hide / show the random icon (allows for animations as opposed to display: none)
    randomIconWrapper.classList.toggle('off', !isDarkMode);  // .off class collapses the flex item (width/margin)

    if (!isDarkMode) randomIconCheckbox.checked = false;    // force close random window when dark theme toggled off
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

        // calculate device view dimensions
        const wvw  = (appWindow.offsetWidth  / window.innerWidth ) * 100;    // window width in vw
        const hvh  = (appWindow.offsetHeight / window.innerHeight) * 100;    // window height in vh

        // add 5 vw/vh padding
        const maxLeft = 95 - wvw;
        const maxTop  = 95 - hvh;

        // randomize window pop out coordinates (within range and add units for css)
        const left = (Math.random() * maxLeft + 5).toFixed(2) + 'vw';
        const top  = (Math.random() * maxTop  + 5).toFixed(2) + 'vh';

        // set coordinates to css variables for current window only
        appWindow.style.setProperty('--popout-left', left);
        appWindow.style.setProperty('--popout-top',  top);
    }


    /* ----------------------------
        helper – bring forward (z‑index)
    ----------------------------- */
    let zIndexCounter = 200;  // global counter in front of css (100)

    function bringToFront(appWindow) {
        appWindow.style.zIndex = ++zIndexCounter;    // most recent window is on top of older ones
    }


    /* ----------------------------
        helper – clamp values
    ----------------------------- */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }




    /* ----------------------------
        desktop drag (window-bar)
    ----------------------------- */
    function enableDesktopDrag(appWindow) {
        const bar = appWindow.querySelector('.window-bar');
        if (!bar) return;

        let startX, startY;
        let startLeftVW = 0, startTopVH = 0;
        let wvw = 0, hvh = 0;

        function onMouseDown(event) {
            if (window.innerWidth < 768) return;
            bringToFront(appWindow);
            appWindow.classList.add('is-dragging');
            document.body.classList.add('is-dragging');

            // read current css variable position (fallback to computed px if vars missing)
            const styles = getComputedStyle(appWindow);
            const leftVar = styles.getPropertyValue('--popout-left').trim();
            const topVar  = styles.getPropertyValue('--popout-top').trim();

            startLeftVW = leftVar.endsWith('vw')
                ? parseFloat(leftVar)
                : (appWindow.offsetLeft / window.innerWidth) * 100;

            startTopVH  = topVar.endsWith('vh')
                ? parseFloat(topVar)
                : (appWindow.offsetTop  / window.innerHeight) * 100;

            // window size in viewport units (for clamping)
            wvw = (appWindow.offsetWidth  / window.innerWidth ) * 100;
            hvh = (appWindow.offsetHeight / window.innerHeight) * 100;

            startX = event.clientX;
            startY = event.clientY;

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp, { once: true });
            event.preventDefault();
        }

        function onMouseMove(event) {
            const dxVW = ((event.clientX - startX) / window.innerWidth ) * 100;
            const dyVH = ((event.clientY - startY) / window.innerHeight) * 100;

            const maxLeft = 95 - wvw;
            const maxTop  = 95 - hvh;

            const newLeft = clamp(startLeftVW + dxVW, 5, maxLeft);
            const newTop  = clamp(startTopVH  + dyVH, 5, maxTop );

            appWindow.style.setProperty('--popout-left', newLeft.toFixed(2) + 'vw');
            appWindow.style.setProperty('--popout-top',  newTop.toFixed(2)  + 'vh');
        }

        function onMouseUp() {
            window.removeEventListener('mousemove', onMouseMove);
            appWindow.classList.remove('is-dragging');
            document.body.classList.remove('is-dragging');
        }

        bar.addEventListener('mousedown', onMouseDown);
    }




    /* ----------------------------
        stagger window open
    ----------------------------- */
    function enqueueWindow(appWindow) {
        openQueue.push(appWindow);    // add window to queue list
        processQueue();    // 
    }

    function processQueue() {
    if (isAnimating || openQueue.length === 0) return;    // exit when busy or nothing to do

        const nextWindow = openQueue.shift();
        isAnimating = true;

        // start popout
        randomizePosition(nextWindow);
        bringToFront(nextWindow);

        // add delay after the css app window transition
        const delay = window.innerWidth < 768 ? 500 : 250;   // slightly longer than css animation
        setTimeout(() => {
            isAnimating = false;    // ready for to open next window
            processQueue();    // handle queued windows
        }, delay);
    }


    /* ----------------------------
        add helpers to every window toggle
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

        enableDesktopDrag(windowSection);    // add drag feature to each window
    });




    // enable transitions only after initial layout is set (prevent flash on load/reload)
    document.body.classList.add('ready');

});
