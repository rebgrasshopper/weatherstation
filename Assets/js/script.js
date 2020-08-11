//Variables
const apiKey = "&appid=4e5d3cc57c8eb2f1baa615bd2033d24d";
const urlBase = "https://api.openweathermap.org/data/2.5/weather?q=";
const weatherDiv = $("#current-weather");
const currentDate = moment().format("MM/DD/YYYY");
const stateAbbreviations = [
    'AL','AK','AS','AZ','AR','CA','CO','CT','DE','DC','FM','FL','GA',
    'GU','HI','ID','IL','IN','IA','KS','KY','LA','ME','MH','MD','MA',
    'MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
    'MP','OH','OK','OR','PW','PA','PR','RI','SC','SD','TN','TX','UT',
    'VT','VI','VA','WA','WV','WI','WY'
   ]; //state abbreviations provided by github.com/bubblerun
let cityForPrint;
let city;
let state;
let isHistory = false;
let mostRecentButton;
let queryURL;





//Functions

function search() {
    
    //set queryValue based on isHistory
    let queryValue;

    if (isHistory) {
        queryValue = mostRecentButton;
    } else {
        queryValue = $("#query").val().trim();
        $("#query").val("");
    }

    //set searchTerm
    let searchTerm = queryValue.split(",").map(item => item.trim());
    //remove identical buttons
    if ($(`#${queryValue.replace(/,\s/g, "").replace(/\s/g, "")}`)) {
        $(`#${queryValue.replace(/,\s/g, "").replace(/\s/g, "")}`).remove();
    }

    //assign city and (if state) state
    city = searchTerm[0];
    if (searchTerm[1]) {
        if (stateAbbreviations.indexOf(searchTerm[1].toUpperCase())>-1) {
            state = "," + searchTerm[1] + ",us";
        } else {
            state = "," + searchTerm[1];
        }
    } else {
        state = null;
    }

    //prepend button for search history
    const lastCall = $("<button class='history'></button>");
    lastCall.data("location", queryValue);
    lastCall.attr("id", queryValue.replace(/,\s/g, "").replace(/\s/g, ""));
    lastCall.text(queryValue);
    $("#search-history").prepend(lastCall);

    //set up queryURL
    if (state) {
        queryURL = urlBase + city + state + apiKey
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
    currentHeader.html(`${response.name} (${currentDate})<img src=${iconURL} style="width:50px"/>`);
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
    const uvURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${response.coord.lat}&lon=${response.coord.lon}&appid=4e5d3cc57c8eb2f1baa615bd2033d24d`
    $.ajax({
        url: uvURL,
        method: "GET"
    }).then(getUV);

    //set up 5 day forecast
    const forecastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + response.id + apiKey;
    $.ajax({
        url: forecastURL,
        method: "GET"
    }).then(getForecast);
}

//look for UV value once initial weather response is returned
function getUV(response){
    console.log(response);
    uv = response.value;
    const uvDiv = $(`<p>UV Index: <span id="uv">${uv}</span></p>`);
    weatherDiv.append(uvDiv);

    //set color based on UV chart
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


//look for 5 day forecast once initial weather response returns
function getForecast(response) {
    console.log(response);
    const forecastDiv = $("#forecast");
    forecastDiv.empty();

    $("#forecast-title").css("display", "block");
    //populate 5 days out
    let index = 7;
    for (let i = 0; i < 5; i++) {
        const oneDay = $("<div class='day'></div>");
        
        const dateIconDiv = $("<div>");
        const date = moment().add(i+1, "days").format("MM/DD/YYYY");
        const title = $(`<h5>${date}</h5>`)
        dateIconDiv.append(title);

        const iconURL = "https://openweathermap.org/img/wn/" + response.list[index].weather[0].icon.replace("n", "d") + "@2x.png";
        console.log(response.list[index].weather[0].icon.replace("n", "d"));
        const iconImg = $(`<img src=${iconURL} style="width:30px"/>`);
        dateIconDiv.append(iconImg);
        oneDay.append(dateIconDiv);

        const textItemsDiv = $("<div>");
        const temp = (parseInt(response.list[index].main.temp) -273.15) * 9/5 + 32; 
        const tempDiv = $("<p class='one-day'></p>");
        tempDiv.html(`Temp: ${temp.toFixed(1)} °F`);
        textItemsDiv.append(tempDiv);

        const humidityDiv = $("<p class='one-day'></p>");
        humidityDiv.html(`Humidity: ${response.list[index].main.humidity}%`);
        textItemsDiv.append(humidityDiv);
        oneDay.append(textItemsDiv);

        //append finished day to forecast        
        forecastDiv.append(oneDay);
        index += 8;
    }
}


//set click even on search submit button
$("#submit").on("click", function(e){
    e.preventDefault();
    isHistory = false;
    search();
});


//set click event on history buttons
$(document).on('click','.history',function(e){
    e.preventDefault();
    isHistory = true;
    mostRecentButton = $(this).data("location");
    search();
});
