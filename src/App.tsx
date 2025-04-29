import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap, Marker, ZoomControl, Popup } from 'react-leaflet'
import { DivIcon } from 'leaflet'
import { Search, Moon, Sun, MapPin } from 'lucide-react'
import 'leaflet-routing-machine'
import { loadBusStops, BusStop } from './stops.tsx'
import { loadBusRoutes, BusRoute } from './searchbus.tsx'


const userLocationIcon = new DivIcon({
  className: 'custom-div-icon',
  html: `<img src="public/alfinete.png" alt="user Icon" style="width: 24px; height: 24px; ">`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
})

const busStopIcon = new DivIcon({
  className: 'bus-stop-icon',
  html:`<img src="public/busicon.png" alt="Bus Icon" style="width: 12px; height: 12px">`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
})

function LocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const map = useMap()

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition([e.latlng.lat, e.latlng.lng])
      map.setView(e.latlng, 18)
    })
  }, [map])

  return position ? <Marker position={position} icon={userLocationIcon} /> : null
}

function BusStops() {
  const [allStops, setAllStops] = useState<BusStop[]>([])
  const [visibleStops, setVisibleStops] = useState<BusStop[]>([])
  const map = useMap()


  useEffect(() => {
    async function fetchBusStops() {
      const stops = await loadBusStops()
      setAllStops(stops)
    }
    fetchBusStops()
  }, [])

  useEffect(() => {
    function updateVisibleStops() {
      const zoom = map.getZoom()
      if (zoom >= 17) {
        const bounds = map.getBounds()
        const visible = allStops.filter(stop => 
          bounds.contains([stop.stop_lat, stop.stop_lon])
        )
        setVisibleStops(visible)
        // console.log(visible)
      } else {
        setVisibleStops([])
      }
    }

    updateVisibleStops()
    map.on('moveend', updateVisibleStops)
    map.on('zoomend', updateVisibleStops)

    return () => {
      map.off('moveend', updateVisibleStops)
      map.off('zoomend', updateVisibleStops)
    }
  }, [map, allStops])

  return (
    <>
      {visibleStops.map(stop => (
        <Marker
          key={stop.stop_id}
          position={[stop.stop_lat, stop.stop_lon]}
          icon={busStopIcon}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-semibold mb-1">{stop.stop_name}</h3>
              <p>{stop.stop_desc}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}


function RecenterButton() {
  const map = useMap()

  const handleRecenter = () => {
    map.locate().on("locationfound", function (e) {
      map.flyTo(e.latlng, 18)
    })
  }

  return (
    <button
      onClick={handleRecenter}
      className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <MapPin className="w-6 h-6" />
    </button>
  )
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [routes, setRoutes] = useState<BusRoute[]>([])
  const [filteredRoutes, setFilteredRoutes] = useState<BusRoute[]>([])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])


  useEffect(() => {
    async function fetchRoutes() {
      const busRoutes = await loadBusRoutes()
      setRoutes(busRoutes)
    }
    fetchRoutes()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.trim() === '') {
      setFilteredRoutes([])
      return
    }

    const filtered = routes.filter(route => 
      route.route_short_name.toLowerCase().includes(query.toLowerCase()) ||
      route.route_long_name.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredRoutes(filtered)
  }

  return (
    <div className="h-screen w-screen relative">
      <header className="absolute top-0 left-0 right-0 z-[1000] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#4e1bab]">BusJP</h1>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button className="px-4 py-2 rounded-lg bg-[#4e1bab] text-white hover:bg-[#3d1589] transition-colors">
            Login
          </button>
        </div>
      </header>

      {isSearchExpanded && (
        <div className="absolute top-[72px] left-0 right-0 z-[1000] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Buscar onibus..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4e1bab] transition-all"
              autoFocus
            />
            {filteredRoutes.length > 0 && (
              <div className="absolute w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {filteredRoutes.map(route => (
                  <div
                    key={route.route_id}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0 dark:border-gray-700"
                  >
                    <div className="font-semibold">{route.route_short_name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{route.route_long_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <MapContainer
        center={[-23.5505, -46.6333]}
        zoom={18}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution={darkMode 
            ? '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CartoDB</a>'
          }
          url={darkMode 
            ? `https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=YIVYhwhvcxD0DgZkYMyintyeVIGDxb99QiSpeJvnM5D0WTOSBB9IWqZauPlIvjhI`
            : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          }
        />
        <LocationMarker />
        <BusStops />
        <RecenterButton />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  )
}

export default App