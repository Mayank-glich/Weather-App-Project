const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector(".search-Btn");
const WeatherInfoSection = document.querySelector(".Weather-info");
const notFoundSection = document.querySelector(".not-found");
const searchCitySection = document.querySelector(".search-city");

const apikey = '6acd1510ee6c5fb40c8780a75d49226e';


const countryTxt = document.querySelector('.country-text');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');
const forecastItems = document.querySelectorAll('.forecast-item');


let map = L.map('map').setView([20.5937, 78.9629], 5); // India default

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

let userMarker; 



function detectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by your browser");
    }
}


function showPosition(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;

   
    map.setView([lat, lon], 12);

  
    if (userMarker) {
        map.removeLayer(userMarker);
    }

   
    userMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup("You are here")
        .openPopup();

   
    getWeatherByCoordinates(lat, lon);
}


function showError(error) {
    alert("Location access denied or unavailable.");
}


async function getWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
        showDisplaySection(notFoundSection);
        return;
    }


    const {
        name,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed },
        dt
    } = data;

    countryTxt.textContent = name;
    tempTxt.textContent = Math.round(temp) + " °C";
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = humidity + "%";
    windValueTxt.textContent = speed + " M/S";
    currentDateTxt.textContent = new Date(dt * 1000).toLocaleDateString(
        'en-US',
        { weekday: 'short', month: 'short', day: 'numeric' }
    );


    const iconMap = {
        200: 'thunderstorm.svg',
        300: 'drizzle.svg',
        500: 'rain.svg',
        600: 'snow.svg',
        700: 'atmosphere.svg',
        800: 'clear.svg',
        801: 'few-clouds.svg',
        802: 'scattered-clouds.svg',
        803: 'broken-clouds.svg',
        804: 'overcast-clouds.svg'
    };
    const iconCode = Math.floor(id / 100) * 100;
    weatherSummaryImg.src = `./weather/${iconMap[iconCode] || 'clouds.svg'}`;

    showDisplaySection(WeatherInfoSection);
}

searchBtn.addEventListener("click", () => {
    if (cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener("keydown", (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value);
        cityInput.value = '';
        cityInput.blur();
    }
});


async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apikey}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}


async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);

    if (weatherData.cod !== 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed },
        dt
    } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = Math.round(temp) + ' °C';
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = humidity + '%';
    windValueTxt.textContent = speed + ' M/S';
    currentDateTxt.textContent = new Date(dt * 1000).toLocaleDateString(
        'en-US',
        { weekday: 'short', month: 'short', day: 'numeric' }
    );


    const iconMap = {
        200: 'thunderstorm.svg',
        300: 'drizzle.svg',
        500: 'rain.svg',
        600: 'snow.svg',
        700: 'atmosphere.svg',
        800: 'clear.svg',
        801: 'few-clouds.svg',
        802: 'scattered-clouds.svg',
        803: 'broken-clouds.svg',
        804: 'overcast-clouds.svg'
    };
    const iconCode = Math.floor(id / 100) * 100;
    weatherSummaryImg.src = `./weather/${iconMap[iconCode] || 'clouds.svg'}`;


    const forecastData = await getFetchData('forecast', city);

    if (forecastData.cod !== '200') {
        console.error('Forecast not available');
        showDisplaySection(WeatherInfoSection);
        return;
    }

    const dailyForecasts = {};
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item;
        }
    });

    const forecastList = Object.values(dailyForecasts).slice(0, 4);

    forecastItems.forEach((item, index) => {
        if (forecastList[index]) {
            const { dt, main: { temp }, weather: [{ id }] } = forecastList[index];
            const date = new Date(dt * 1000).toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric' }
            );

            item.querySelector('.forecast-item-date').textContent = date;
            item.querySelector('.forecast-item-temp').textContent = Math.round(temp) + " °C";

            const forecastIcon = `./weather/${iconMap[Math.floor(id / 100) * 100] || 'clouds.svg'}`;
            item.querySelector('.forecast-item-img').src = forecastIcon;
        }
    });

    showDisplaySection(WeatherInfoSection);
}


function showDisplaySection(section) {
    [WeatherInfoSection, searchCitySection, notFoundSection]
        .forEach(sec => sec.style.display = 'none');
    section.style.display = 'block';
}
