import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

interface WeatherData {
  name: string;
  sys: {
    country: string;
  };
  weather: Array<{
    icon: string;
    description: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
}

// Add this weather code to icon mapping
const getWeatherIcon = (code: number): string => {
  // Map Open-Meteo codes to OpenWeatherMap icon codes
  const iconMap: Record<number, string> = {
    0: '01d', // Clear sky
    1: '02d', // Mainly clear
    2: '03d', // Partly cloudy
    3: '04d', // Overcast
    45: '50d', // Foggy
    48: '50d', // Depositing rime fog
    51: '09d', // Light drizzle
    53: '09d', // Moderate drizzle
    55: '09d', // Dense drizzle
    61: '10d', // Slight rain
    63: '10d', // Moderate rain
    65: '10d', // Heavy rain
    71: '13d', // Slight snow fall
    73: '13d', // Moderate snow fall
    75: '13d', // Heavy snow fall
    80: '09d', // Slight rain showers
    81: '09d', // Moderate rain showers
    82: '09d', // Violent rain showers
    95: '11d', // Thunderstorm
  };
  return iconMap[code] || '03d'; // Default to partly cloudy if code not found
};

const WeatherPage: React.FC = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [debouncedCity] = useDebounce(city, 500);

  const fetchWeather = useCallback(async () => {
    if (!city) return;
    
    setLoading(true);
    setError('');
    
    try {
      // First get coordinates
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );
      
      if (!geoResponse.ok) {
        throw new Error('City not found');
      }
      
      const geoData = await geoResponse.json();
      if (!geoData.results?.length) {
        throw new Error('City not found');
      }

      const location = geoData.results[0];
      
      // Then get weather
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const weatherData = await weatherResponse.json();
      setWeather({
        name: location.name,
        sys: { country: location.country },
        weather: [{
          icon: getWeatherIcon(weatherData.current_weather.weathercode), // Use the new mapping function
          description: getWeatherDescription(weatherData.current_weather.weathercode)
        }],
        main: {
          temp: weatherData.current_weather.temperature,
          feels_like: weatherData.current_weather.temperature, // They don't provide feels_like
          humidity: weatherData.hourly.relativehumidity_2m[0]
        },
        wind: {
          speed: weatherData.current_weather.windspeed / 3.6 // Convert from km/h to m/s
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    if (debouncedCity) {
      fetchWeather();
    }
  }, [debouncedCity, fetchWeather]);

  const convertTemp = (temp: number): number => {
    return unit === 'F' ? (temp * 9/5) + 32 : temp;
  };

  // Helper function to convert weather codes to descriptions
  const getWeatherDescription = (code: number): string => {
    const weatherCodes: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      // Add more codes as needed
    };
    return weatherCodes[code] || 'Unknown';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 h-[calc(100vh-17rem)] md:h-[calc(100vh-17rem)] sm:h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Weather Forecast</h1>
        <button
          onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
        >
          °{unit}
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search for a city..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40
                   focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 pl-10"
        />
        <svg className="absolute left-3 top-3.5 h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {loading && (
        <div className="animate-pulse p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
          <div className="h-8 bg-white/10 rounded w-2/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="h-8 bg-white/10 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {weather && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4 hover:bg-white/10 transition-all">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">{weather.name}, {weather.sys.country}</h2>
            <img 
              src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="w-16 h-16"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-white/60">Temperature</p>
              <p className="text-3xl font-bold text-white">
                {Math.round(convertTemp(weather.main.temp))}°{unit}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-white/60">Feels Like</p>
              <p className="text-2xl font-bold text-white">{Math.round(weather.main.feels_like)}°C</p>
            </div>
            <div className="space-y-2">
              <p className="text-white/60">Humidity</p>
              <p className="text-2xl font-bold text-white">{weather.main.humidity}%</p>
            </div>
            <div className="space-y-2">
              <p className="text-white/60">Wind Speed</p>
              <p className="text-2xl font-bold text-white">{weather.wind.speed} m/s</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/80 capitalize">{weather.weather[0].description}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPage; 