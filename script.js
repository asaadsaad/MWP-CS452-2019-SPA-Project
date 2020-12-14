"use strict";
let loginToken;
let outlet;
window.onload = function () {
  outlet = document.getElementById("outlet");

  outlet.innerHTML = `
  <h1>Please Login</h1>
  Username <input value = "mwp"><br>
  Password <input value = "123"><br>
  <button onclick="login()">Login</button
`;
};

async function login() {
  const response = await fetch(
    "https://cs445-project.herokuapp.com/api/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "map",

        password: "123456",
      }),
    }
  );

  const result = await response.json();
  loginToken = result;
  console.log(loginToken);
  outlet.innerHTML = `<h3>Welcome all from <span id="location"></span></h3>
 <textarea rows="10" cols="50"></textarea><br>

  <button onclick="refresh()">Refresh Animation</button>
  <button onclick="logout()">Logout</button>
  `;

  let geoKey = "hl5CFvCH0GGgkLuulKNPcQ5q1bPDGvYH";

  navigator.geolocation.getCurrentPosition(function (position) {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;
    let geoLink = `http://www.mapquestapi.com/geocoding/v1/reverse?key=${geoKey}&location=${lat},${long}&includeRoadMetadata=true&includeNearestIntersection=true`;

    fetch(geoLink)
      .then((r) => r.json())
      .then((data) => {
        let res = data.results[0].locations[0];
        console.log(`${res.adminArea5}, ${res.adminArea3} `);

        let place = document.getElementById("location");

        place.innerHTML = `${res.adminArea5}, ${res.adminArea3}, ${res.adminArea1} `;
      });
  });
}
