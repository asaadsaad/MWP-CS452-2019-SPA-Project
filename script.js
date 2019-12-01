'use strict';

window.onload = () => {
    let animationArea, lat, long, userLocation, token, animationFrames = [], animationInterval, i = 0, state, frameId = 0;

    const OUTLET = getElement('#outlet');
    const QUEST_API_URL = 'http://www.mapquestapi.com/geocoding/v1/reverse';
    const QUEST_API_KEY = 'Y0ROZGOJZ8PxsijeatYiupEeXX4y2G4Z';
    const TOKEN_URL = `http://www.mumstudents.org/api/login`;
    const ANIMATION_URL = `http://www.mumstudents.org/api/animation`;
    const VIEWS = {
        loginView: `
        <div id="loginView">
            <h1>Please Login</h1>
            <label for="username">UserName: </label>
            <input type="text" id="username" value="mwp"><br>
            <label for="password">Password: </label> 
            <input type="password" value="123"><br>
            <button id="login">Login</button>
        </div>
        `,
        animationView: `
        <div id="animationView">
            <h2 id="location">Your location</h2>
            <textarea id="animationArea" cols="100" rows="30"></textarea><br>
            <button id="refresh">Refresh Animation</button>
            <button id="logout">Logout</button>
        </div>
        `
    }
    const ROUTES = {
        '/': VIEWS.loginView,
        '/login': VIEWS.loginView,
        '/animation': VIEWS.animationView
    };

    window.addEventListener('popstate', popstateHandler);

    /**
     * Self invoking arrow function to load the initial view
     */
    (() => {
        getLatLong();
        state = { frames: null, path: '/', userLocation: userLocation };
        history.replaceState(state, null, '/login');
        render(state);
    })();

    /**
     * Function to render the state
     * @param {Object} state state to the current view
     */
    function render(state) {
        OUTLET.innerHTML = ROUTES[state.path];
        let btns = document.querySelectorAll('button');

        if (btns) {
            btns.forEach((btn) => {
                if (btn.id === 'refresh') {
                    btn.addEventListener('click', refreshAsync);
                } else if (btn.id === 'logout') {
                    btn.addEventListener('click', logOut);
                } else {
                    btn.addEventListener('click', logInAsync);
                }
            });
        }
        let location = getElement('#location');
        if (location) {
            location.innerHTML = `Wellcome all from ${state.userLocation}`;
        }
        animate(state.frames);
    }

    /**
     * Function to handle popstate event
     * @param {Event} event 
     */
    function popstateHandler(event) {
        if (event.state) {
            state = event.state;
            render(state);
        }
    }

    /**
     * Function to get the current user latitude and longitude
     */
    function getLatLong() {
        navigator.geolocation.getCurrentPosition((position) => {
            lat = position.coords.latitude;
            long = position.coords.longitude;
            console.log(`lat: ${lat}, long: ${long}`);
        });
    }

    /**
   * Function to get user location asynchronously
   */
    async function getLocationAsync() {
        let mapQuestApiUrl = `${QUEST_API_URL}?key=${QUEST_API_KEY}&location=${lat},${long}`;

        let response = await fetch(mapQuestApiUrl);
        return response.json();
    }

    /**
     * Function to login and load animation asynchronously
     */
    async function logInAsync() {
        OUTLET.innerHTML = `<img src="loading.gif" alt="Loading gif">`;

        let address = await getLocationAsync();
        address = address.results[0].locations[0];
        userLocation = `${address.adminArea5}, ${address.adminArea3}, ${address.adminArea1}`;

        await fetchFrameAsync();

        state.frames = animationFrames;
        state.path = '/animation';
        state.userLocation = userLocation;
        history.pushState(state, null, `/animation?${frameId++}`);
        render(state);
    }

    /**
     * Function to fetch token asynchronously
     */
    async function getTokenAsync() {
        let response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                "username": "mwp",
                "password": "123"
            })
        });

        response = await response.json();
        token = response.token;
    }

    /**
     * Function to fetch animation frames asynchronously
     */
    async function fetchFrameAsync() {
        if (!token) {
            await getTokenAsync();
        }
        let response = await fetch(ANIMATION_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        let frames = await response.text();
        animationFrames = frames.split('=====');
    }

    /**
     * Function to display animation frames
     */
    function animate(frames) {
        if (!frames) {
            return;
        }
        clearInterval(animationInterval);
        animationArea = getElement('#animationArea');

        if (frames.length > 0) {
            animationInterval = setInterval(() => {
                if (i < frames.length) {
                    animationArea.value = frames[i++];
                } else {
                    i = 0;
                }
            }, 200);
        }
    }

    /**
     * Function to refresh the animation view asynchronously
     */
    async function refreshAsync() {
        OUTLET.innerHTML = `<img src="loading.gif" alt="Loading gif">`;
        i = 0;
        await fetchFrameAsync();

        state.frames = animationFrames;
        state.path = '/animation';
        state.userLocation = userLocation;
        history.pushState(state, null, `/animation?${frameId++}`);
        render(state);
    }

    /**
     * Function to logout and redirect to the login view
     */
    function logOut() {
        clearInterval(animationInterval);
        i = 0;
        animationFrames = [];
        state.frames = animationFrames;
        state.path = '/';
        history.pushState(state, null, `/login`);
        render(state);
    }

    /**
     * Function to get an element using css selector
     * @param {String} selector CSS selector of an HTML element
     */
    function getElement(selector) {
        return document.querySelector(selector);
    }
}
