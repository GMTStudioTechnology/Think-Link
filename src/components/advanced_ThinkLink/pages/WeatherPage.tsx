import React, { useState } from 'react';

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

const WeatherPage: React.FC = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  
  const fetchWeather = async () => {
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
          icon: `${weatherData.current_weather.weathercode}`, // You'll need to map their codes to icons
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Weather Forecast</h1>
      
      <div className="flex gap-4">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name..."
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40
                   focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
          onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
        />
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200"
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {weather && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
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
              <p className="text-2xl font-bold text-white">{Math.round(weather.main.temp)}°C</p>
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
    </div>
  );
};

export default WeatherPage; 