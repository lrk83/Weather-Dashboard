//Query selectors for general searches
var getGeoBaseLink = "https://api.openweathermap.org/geo/1.0/direct?q="
var getWeatherBaseLink = "https://api.openweathermap.org/data/2.5/onecall?lat=";
var apiKey="f7af6622eaa733e3567ea41a18855d67";
var units="imperial";

//Query selectors for city searches
var formEl = document.querySelector("#city-form");
var pastEl = document.querySelector("#past-searches");
var storageCities=[];

//Query selectors for current weather
var currentEl = document.querySelector("#currentWeather");
var cityName = document.querySelector("#cityName");
var weatherText = document.querySelector("#weatherText");
var iconEl = document.querySelector("#icon");

var saveCities = function(){
    localStorage.setItem("cities", JSON.stringify(storageCities));
}

var loadCities = function(){
    var savedCities = localStorage.getItem("cities");

    if (!savedCities) {
        storageCities=[];
        return false;
    };

    savedCities=JSON.parse(savedCities);

    for(x=0;x<savedCities.length;x++){
        addPast(savedCities[x]);
    }; 
};

var displayCurrentWeather=function(data,city){

    currentEl.setAttribute("style","border: 1px solid rgba(0,0,0,.125)");

    var date = moment().format("MM/DD/YYYY");
    cityName.textContent=city+" ("+date+")";

    iconEl.innerHTML="";
    var weatherIcon=document.createElement("img");
    weatherIcon.setAttribute("src","https://openweathermap.org/img/wn/"+data.current.weather[0].icon+".png");
    iconEl.appendChild(weatherIcon);

    weatherText.innerHTML="";
    var currentTemp=document.createElement("p");
    currentTemp.textContent="Temp: "+data.current.temp+"°F";
    currentTemp.setAttribute("class","card-text");
    weatherText.appendChild(currentTemp);

    var currentWind=document.createElement("p");
    currentWind.textContent="Wind: "+data.current.wind_speed+ " MPH";
    currentWind.setAttribute("class","card-text");
    weatherText.appendChild(currentWind);

    var currentHumidity=document.createElement("p");
    currentHumidity.textContent="Humidity: "+data.current.humidity+" %";
    currentHumidity.setAttribute("class","card-text");
    weatherText.appendChild(currentHumidity);

    var currentUVI=document.createElement("p");
    currentUVI.setAttribute("class","card-text");
    currentUVI.textContent="UV Index: ";

    //UV indicator
    uviValue=data.current.uvi;
    if (uviValue<3){
        conditions="good";
    }else if (uviValue<6){
        conditions="moderate";
    }else{
        conditions="bad";
    }

    var uviBox=document.createElement("span");
    uviBox.setAttribute("class",conditions);
    uviBox.textContent=uviValue;
    currentUVI.appendChild(uviBox);
    weatherText.appendChild(currentUVI);
};

var displayForecasetWeather = function(data){
    
    document.querySelector("#forecastSectionHeader").textContent="5 Day Forecast"

    for (x=0;x<5;x++){
        var forecastCard=document.querySelector('#forecastCard'+x);
        forecastCard.setAttribute("class","card forecastCard");

        var date = moment().add((x+1)*1,"day").format("MM/DD/YYYY");
        var dateEl = document.querySelector("#date"+x);
        dateEl.textContent=date;

        var forecastIconEl=document.querySelector("#icon"+x);
        forecastIconEl.innerHTML="";
        var forecastWeatherIcon=document.createElement("img");
        forecastWeatherIcon.setAttribute("src","https://openweathermap.org/img/wn/"+data.daily[x+1].weather[0].icon+".png");
        forecastIconEl.appendChild(forecastWeatherIcon);
    
        var forecastWeatherText = document.querySelector("#weatherText"+x);
        forecastWeatherText.innerHTML="";
        var futureTemp=document.createElement("p");
        console.log(data.daily[x]);
        futureTemp.textContent="Temp: "+data.daily[x+1].temp.day+"°F";
        futureTemp.setAttribute("class","card-text");
        forecastWeatherText.appendChild(futureTemp);

        var futureWind=document.createElement("p");
        futureWind.textContent="Wind: "+data.daily[x+1].wind_speed+" MPH";
        futureWind.setAttribute("class","card-text");
        forecastWeatherText.appendChild(futureWind);
    
        var futureHumidity=document.createElement("p");
        futureHumidity.textContent="Humidity: "+data.daily[x+1].humidity+" %";
        futureHumidity.setAttribute("class","card-text");
        forecastWeatherText.appendChild(futureHumidity);
    };
};

var getCurrentWeather = function(lat,lon,city){
    var getWeatherFullLink = getWeatherBaseLink+lat+"&lon="+lon+"&units="+units+"&appid="+apiKey;
    fetch(getWeatherFullLink).then(function(response){
        if (response.ok){
            response.json().then(function(data){
                displayCurrentWeather(data,city);
                displayForecasetWeather(data);
            });
        }else{
            window.alert("There was a problem with your request!");
        };
    });
};

var getGeo=function(city){
    var getGeoFullLink = getGeoBaseLink+city+"&limit=1&appid="+apiKey;
    fetch(getGeoFullLink).then(function(response){
        if (response.ok){
            response.json().then(function(data){
                if(!data[0]){
                    alert("Could not find a city with that name.");
                    return;
                }else{
                    getCurrentWeather(data[0].lat,data[0].lon,city);
                    addPast(city);
                };
            });
        }else{
            window.alert("There was a problem with your request!");
        };
    });
};

var addPast = function(city){
    var iAmStored=false;
    for (x=0;x<storageCities.length;x++){
        if (storageCities[x]===city){
            iAmStored=true;
        };
    };
    
    if(!iAmStored){
        storageCities.push(city);
        var pastCityEl = document.createElement("button");
        pastCityEl.textContent=city;
        pastCityEl.setAttribute("class","btn btn-outline-dark");
        pastEl.appendChild(pastCityEl);
        saveCities();
    };
};

var formHandler = function(event){
    event.preventDefault();
    var cityNameInput = document.querySelector("input[name='city-name']").value;

    // check if inputs are empty (validate)
    if (!cityNameInput) {
        alert("You need to enter a city!");
        return false;
    };

    // reset form fields for next city to be entered
    document.querySelector("input[name='city-name']").value = "";

    //Check weather
    getGeo(cityNameInput);
};

var clickHandler = function(event){
    var targetEl=event.target;
    if (targetEl.matches("button")){
        var text=targetEl.textContent;
        getGeo(text);
    };
};

formEl.addEventListener("submit",formHandler);

pastEl.addEventListener("click",clickHandler);

loadCities();