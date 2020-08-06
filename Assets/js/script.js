//Tasks
// fix buttons losing state ID
//add 5 day forecast


const apiKey = "&appid=4e5d3cc57c8eb2f1baa615bd2033d24d";
const urlBase = "http://api.openweathermap.org/data/2.5/weather?q=";
const weatherDiv = $("#current-weather");
//thanks to mshafrir on github for making this list so I didn't have to type it
const states = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
}
console.log(states);
let cityForPrint;
let city;
let state;
let isHistory = false;
let mostRecentButton;
let queryURL;

//q={city name},{state code}&appid={your api key}
$("#submit").on("click", function(e){
    e.preventDefault();
    isHistory = false;
    search();
});

function search() {

    
    //set queryValue based on isHistory
    let queryValue;
    let searchTerm;

    if (isHistory) {
        queryValue = mostRecentButton;
    } else {
        queryValue = $("#query").val().trim();
    }


    //set searchTerm
    searchTerm = queryValue.split(",").map(item => item.trim());

    //remove identical buttons
    if ($(`#${queryValue.replace(' ', "-")}`)) {
        $(`#${queryValue.replace(' ', "-")}`).remove();
    }

    //assign city and (if state) state
    city = searchTerm[0];
    if (searchTerm[1]) {
        if (searchTerm[1].length === 2) {
            state = states[searchTerm[1].toUpperCase()];
        } else {
            state = searchTerm[1];
        }
    } else {
        state = null;
    }
    console.log(state);

    //prepend button for search history
    const lastCall = $("<button id='" + city.replace(' ', "-") + "' class='history'></button>");
    lastCall.text(queryValue);
    $("#search-history").prepend(lastCall);

    
    if (state) {
        queryURL = urlBase + city + "," + state + apiKey
    } else {
        queryURL = urlBase + city + apiKey
    }
    

    //ajax query
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(showResponse)
}

function showResponse(response){
    console.log(response);

    //set current weather data
    weatherDiv.empty();

    const currentHeader = $("<h3>");
    const iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
    currentHeader.html(`${response.name} (${moment().format("MM/DD/YYYY")})<img src=${iconURL} style="width:50px"/>`);
    weatherDiv.append(currentHeader);

    const tempInFarenheight = (parseInt(response.main.temp) -273.15) * 9/5 + 32; 
    const tempDiv = $(`<p>Temperature: ${tempInFarenheight.toFixed(1)} °F</p>`)
    weatherDiv.append(tempDiv);

    const humidityDiv = $(`<p>Humidity: ${response.main.humidity}%</p>`)
    weatherDiv.append(humidityDiv);

    const windDiv = $(`<p>Wind Speed: ${response.wind.speed} MPH</p>`)
    weatherDiv.append(windDiv);

    //find uv index
    let uv;
    const uvURL = `http://api.openweathermap.org/data/2.5/uvi?lat=${response.coord.lat}&lon=${response.coord.lon}&appid=4e5d3cc57c8eb2f1baa615bd2033d24d`
    $.ajax({
        url: uvURL,
        method: "GET"
    }).then(getUV);

    //set up 5 day forecast
}

//look for UV value once initial weather response is returned
function getUV(response){
    console.log(response);
    uv = response.value;
    console.log(uv);
    const uvDiv = $(`<p>UV Index: <span id="uv">${uv}</span></p>`);
    weatherDiv.append(uvDiv);

    if (parseInt(uv) < 3) {
        $("#uv").css("background-color", "green");
    } else if (parseInt(uv) < 6) {
        $("#uv").css("background-color", "yellow");
    } else if (parseInt(uv) < 8) {
        $("#uv").css("background-color", "orange");
    } else if (parseInt(uv) < 11) {
        $("#uv").css("background-color", "red");
    } else {
        $("#uv").css("background-color", "purple");
    }
    
    
}

//set click event on history buttons
$(document).on('click','.history',function(e){
    e.preventDefault();
    isHistory = true;
    mostRecentButton = $(this).attr("id").replace("-", " ");
    console.log(mostRecentButton);
    search();
});
