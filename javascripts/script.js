/* Function to convert timestamp using moment.js*/
function convertTime(timestamp) {
    return moment.unix(timestamp).format("MMMM D, Y<br>LT");
};
/* Function to display weather text and store info */
function getDisplayText(weatherJSON) {
    $("#description").html(weatherJSON.weather[0].description);
    $("#description").attr("data_code", weatherJSON.weather[0].id);
    var tempf = Math.floor(weatherJSON.main.temp);
    var tempc = Math.floor((tempf - 32) * (5 / 9));
    $("#temperature").attr({
        data_unit: "°F",
        data_f: tempf,
        data_c: tempc
    });
    $("#temperature").html($("#temperature").attr("data_f") + "<small>" + $("#temperature").attr("data_unit") + "</small>");
    $("#temp-unit").html($("#temperature").attr("data_f"));
    $("#position").html(weatherJSON.name);
    $("#time").html(convertTime(weatherJSON.dt));
};
/* Filter out "none" in images */
function filterOutNone(val) {
    if (val !== "none") {
        return true;
    } else if (val == "none") {
        return false;
    }
};
/* Convert keywords to pngs */
function getPusheenImages(weatherCodeConditions) {
    $.getJSON("javascripts/weatherPNGJSON.js", function (pusheenImages) {
        var imageList = {};
        var keysArray = Object.keys(weatherCodeConditions);
        keysArray.forEach(function (element) {
            imageList[element] = weatherCodeConditions[element].map(function (val) {
                return " url(\"" + pusheenImages[val] + "\")";
            });
            imageList[element] = imageList[element].toString();
        });

        console.log(imageList);
        showPusheenImages(imageList);
    })
};
/* Function to show Pusheen images*/
function showPusheenImages(imageList) {
    $(".weather-background").css({
        "background-image": imageList["background"],
        "background-repeat": "no-repeat"
    });
    $(".pusheen").append("<div class=\"pusheen-accessories center-block\"></div>");
    $(".pusheen-accessories").css({
        "background-image": imageList["accessories"],
        "background-repeat": "no-repeat",
        "position": "absolute",
        "top": "0px",
        "bottom": "0px",
        "width": "261px",
        "height": "372px",
        "z-index": "2"
    })
    $(".ground-background").css({
        "background-image": imageList["ground"],
        "background-repeat": "no-repeat"
    });

}

/* Function to convert weather data to imagery */
function displayWeatherImages(weatherJSON) {
    $.getJSON("javascripts/weatherCodeRefJSON.js", function (data) {
        var weatherCodeConditions = data[$("#description").attr("data_code")];
        if (weatherJSON.dt > weatherJSON.sys.sunrise && weatherJSON.dt < weatherJSON.sys.sunset) {
            $("#time").attr("data_daynight", "day")
        } else {
            $("#time").attr("data_daynight", "night")
        };

        for (i = 3; i < 8; i++) {
            if (weatherCodeConditions["background"][i] !== "none" && i !== 5) {
                weatherCodeConditions["background"][i] = weatherCodeConditions["background"][i] + $("#time").attr("data_daynight");
            };
        };
        if (weatherCodeConditions["accessories"][0] !== "none" && $("#temperature").attr("data_f") > 59 && $("#time").attr("data_daynight") == "day" && weatherJSON.wind.speed > 4 && weatherJSON.wind.speed < 12) {
            weatherCodeConditions["accessories"][0] = "kite";
        } else {
            weatherCodeConditions["accessories"][0] = "none";
        };
        if ($("#time").attr("data_daynight") == "night") {
            weatherCodeConditions["accessories"][2] = "none";
        }
        if ($("#temperature").attr("data_f") < 50) {
            weatherCodeConditions["accessories"][4] = "coat";
        };
        if ($("#temperature").attr("data_f") < 35) {
            weatherCodeConditions["accessories"][3] = "hat"
        };
        if ($("#temperature").attr("data_f") < 20) {
            weatherCodeConditions["accessories"][5] = "scarf"
        };
        weatherCodeConditions["background"] = weatherCodeConditions["background"].filter(filterOutNone);
        weatherCodeConditions["accessories"] = weatherCodeConditions["accessories"].filter(filterOutNone);
        getPusheenImages(weatherCodeConditions);
    })
};

/* Function to show weather */
function showWeather(weatherURL) {
    $.getJSON(weatherURL, function (weatherJSON) {
        getDisplayText(weatherJSON);
        displayWeatherImages(weatherJSON);
    });
};

/* Function to show weather from browser geolocation */
function browserSuccess(pos) {
    var weatherFromGeolocationURL = "http://api.openweathermap.org/data/2.5/weather?lat=" + pos.coords.latitude + "&lon=" + pos.coords.longitude + "&units=imperial&appid=05848becfd609da39aaf8d8da59363cd";
    showWeather(weatherFromGeolocationURL);
}
/* Error function for failures of browser geolocation */
function error() {
    window.alert("Professor WeatherCat could not find your position from your browser. Please enter a location manually.");
};
/* Get coord from browser upon load */
$(document).ready(function () {
    navigator.geolocation.getCurrentPosition(browserSuccess);
});

/* Temperature button - convert C/F */
$("#temperature").click(function () {
    if ($("#temperature").attr("data_unit") == "°F") {
        $("#temperature").attr("data_unit", "°C");
        $("#temperature").html($("#temperature").attr("data_c") + "<small>" + $("#temperature").attr("data_unit") + "</small>");
    } else if ($("#temperature").attr("data_unit") == "°C") {
        $("#temperature").attr("data_unit", "°F");
        $("#temperature").html($("#temperature").attr("data_f") + "<small>" + $("#temperature").attr("data_unit") + "</small>");
    }
});
/* Current Position Button */
$("#currentposition").click(function () {
    navigator.geolocation.getCurrentPosition(browserSuccess, error);
});
/* Function to show weather from google API search */
function getCoord() {
    var place = autocomplete.getPlace();
    var weatherFromGoogleURL = "http://api.openweathermap.org/data/2.5/weather?lat=" + place.geometry.location.lat() + "&lon=" + place.geometry.location.lng() + "&units=imperial&appid=05848becfd609da39aaf8d8da59363cd";
    $("#autocomplete").val("");
    showWeather(weatherFromGoogleURL);
}
/* Fuction to search for locations using Google Places autocomplete */
function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete((document.getElementById("autocomplete")), {
        types: ["(regions)"]
    });
    autocomplete.addListener("place_changed", getCoord);

}
$("#autocomplete").focus(initAutocomplete());
