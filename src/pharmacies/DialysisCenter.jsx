import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Phone, Clock, Building, Map, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Import the JSON data from your file
import dialysisCentersData from './dyalise.json';
import '../assets/diyalise.css';

// Define constants for the map
const DEFAULT_CENTER = [31.7917, -7.0926]; // Center of Morocco
const DEFAULT_ZOOM = 6;

// City coordinates mapping for Morocco
const CITY_COORDINATES = {
  "Casablanca": [33.5731, -7.5898],
  "Rabat": [34.0209, -6.8416],
  "Marrakech": [31.6295, -7.9811],
  "Fès": [34.0181, -5.0078],
  "Tanger": [35.7595, -5.8340],
  "Agadir": [30.4278, -9.5981],
  "Oujda": [34.6805, -1.9112],
  "Tétouan": [35.5889, -5.3626],
  "Meknès": [33.8731, -5.5407],
  "Salé": [34.0531, -6.7986],
  "Kénitra": [34.2650, -6.5802],
  "Essaouira": [31.5125, -9.7700],
  "El Jadida": [33.2549, -8.5074],
  "Safi": [32.2994, -9.2372],
  "Nador": [35.1681, -2.9330],
  "Béni Mellal": [32.3373, -6.3498],
  "Mohammedia": [33.6842, -7.3830],
  "Khouribga": [32.8996, -6.9063],
  "Settat": [33.0006, -7.6173],
  "Berkane": [34.9200, -2.3193]
};

// Region mapping for broader geographical filtering
const REGIONS = {
  "Casablanca-Settat": ["Casablanca", "Mohammedia", "Settat", "El Jadida"],
  "Rabat-Salé-Kénitra": ["Rabat", "Salé", "Kénitra"],
  "Marrakech-Safi": ["Marrakech", "Safi", "Essaouira"],
  "Fès-Meknès": ["Fès", "Meknès"],
  "Tanger-Tétouan-Al Hoceïma": ["Tanger", "Tétouan"],
  "Souss-Massa": ["Agadir"],
  "Oriental": ["Oujda", "Nador", "Berkane"],
  "Béni Mellal-Khénifra": ["Béni Mellal", "Khouribga"]
};

// Setup Leaflet icon paths (needed because Leaflet looks for icons in specific paths)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom marker icons for different center types
const createMarkerIcon = (type) => {
  let color;
  switch(type) {
    case "Public":
      color = 'green';
      break;
    case "Private":
      color = 'blue';
      break;
   
    default:
      color = 'red';
  }
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const DialysisCenterFinder = () => {
  // States for data
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCapacity, setSelectedCapacity] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Map states
  const [showMap, setShowMap] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  
  // Function to get accurate center coordinates
  const getCenterCoordinates = (center) => {
    // Use actual coordinates if available
    if (center.latitude && center.longitude) {
      return [parseFloat(center.latitude), parseFloat(center.longitude)];
    }
    
    // Use city coordinates with small random offset to prevent marker stacking
    if (center.city && CITY_COORDINATES[center.city]) {
      const latOffset = (Math.random() - 0.5) * 0.005; // ~500m offset
      const lngOffset = (Math.random() - 0.5) * 0.005;
      
      return [
        CITY_COORDINATES[center.city][0] + latOffset,
        CITY_COORDINATES[center.city][1] + lngOffset
      ];
    }
    
    // Try to extract city from address
    if (center.address) {
      for (const city in CITY_COORDINATES) {
        if (center.address.includes(city)) {
          const latOffset = (Math.random() - 0.5) * 0.005;
          const lngOffset = (Math.random() - 0.5) * 0.005;
          
          return [
            CITY_COORDINATES[city][0] + latOffset,
            CITY_COORDINATES[city][1] + lngOffset
          ];
        }
      }
    }
    
    // Fallback to center of Morocco with small offset
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;
    return [DEFAULT_CENTER[0] + latOffset, DEFAULT_CENTER[1] + lngOffset];
  };
  
  // Find which region a city belongs to
  const getCityRegion = (city) => {
    for (const [region, cities] of Object.entries(REGIONS)) {
      if (cities.includes(city)) {
        return region;
      }
    }
    return "Other";
  };
  
  // Process center data to add coordinates and region
  const processCenterData = (center) => {
    const coordinates = getCenterCoordinates(center);
    const region = center.city ? getCityRegion(center.city) : "Unknown";
    
    return {
      ...center,
      coordinates,
      region
    };
  };
  
  useEffect(() => {
    // Process the data to add coordinates and regions
    const processedData = dialysisCentersData.map(processCenterData);
    setCenters(processedData);
    setLoading(false);
  }, []);
  
  // Get unique regions and cities for dropdowns
  const regions = ['all', ...new Set(centers.map(center => center.region))].filter(Boolean);
  
  // Get cities filtered by selected region
  const cities = ['all', ...new Set(
    centers
      .filter(center => selectedRegion === 'all' || center.region === selectedRegion)
      .map(center => center.city)
  )].filter(Boolean);
  
  // Get unique center types
  const centerTypes = ['all', ...new Set(centers.map(center => center.type))].filter(Boolean);
  
  // Capacity ranges for dropdown
  const capacityRanges = [
    { value: 'all', label: 'All Capacities' },
    { value: 'small', label: 'Small (1-10 stations)' },
    { value: 'medium', label: 'Medium (11-25 stations)' },
    { value: 'large', label: 'Large (26+ stations)' }
  ];
  
  // Filter function
  const filterCenters = () => {
    let results = centers;
    
    // Check if any filter is active
    const isFiltered = searchTerm || 
                       selectedRegion !== 'all' || 
                       selectedCity !== 'all' || 
                       selectedType !== 'all' ||
                       selectedCapacity !== 'all';
    
    setHasSearched(isFiltered);
    
    // If no filters are active and we don't want to show initial results, return empty array
    if (!isFiltered && !hasSearched) {
      setFilteredCenters([]);
      return;
    }
    
    // Filter by region
    if (selectedRegion !== 'all') {
      results = results.filter(center => center.region === selectedRegion);
    }
    
    // Filter by city
    if (selectedCity !== 'all') {
      results = results.filter(center => center.city === selectedCity);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        center => 
          (center.name && center.name.toLowerCase().includes(term)) ||
          (center.address && center.address.toLowerCase().includes(term)) ||
          (center.city && center.city.toLowerCase().includes(term)) ||
          (center.phone && center.phone.toLowerCase().includes(term))
      );
    }
    
    // Filter by center type
    if (selectedType !== 'all') {
      results = results.filter(center => center.type === selectedType);
    }
    
    // Filter by capacity
    if (selectedCapacity !== 'all') {
      switch (selectedCapacity) {
        case 'small':
          results = results.filter(center => center.capacity <= 10);
          break;
        case 'medium':
          results = results.filter(center => center.capacity > 10 && center.capacity <= 25);
          break;
        case 'large':
          results = results.filter(center => center.capacity > 25);
          break;
        default:
          break;
      }
    }
    
    setFilteredCenters(results);
  };
  
  // Apply filters whenever search criteria change
  useEffect(() => {
    filterCenters();
  }, [searchTerm, selectedRegion, selectedCity, selectedType, selectedCapacity, centers]);
  
  // Reset city when region changes
  useEffect(() => {
    setSelectedCity('all');
  }, [selectedRegion]);
  
  // Function to determine center type badge class
  const getTypeClass = (type) => {
    switch(type) {
      case "Public": return "type-badge public";
      case "Private": return "type-badge private";
      case "NGO": return "type-badge ngo";
      default: return "type-badge other";
    }
  };
  
  // Open map with selected center
  const openMap = (center) => {
    setSelectedCenter(center);
    if (center) {
      setMapCenter(center.coordinates);
      setMapZoom(15); // Zoom in when a specific center is selected
    } else {
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(DEFAULT_ZOOM);
    }
    setShowMap(true);
  };
  
  // Open map with all filtered centers
  const openMapWithAll = () => {
    setSelectedCenter(null);
    
    // If a city is selected, center the map on that city
    if (selectedCity !== 'all' && CITY_COORDINATES[selectedCity]) {
      setMapCenter(CITY_COORDINATES[selectedCity]);
      setMapZoom(13); // Slightly zoomed out to show whole city
    } 
    // If a region is selected but no city, use the first city in that region as center
    else if (selectedRegion !== 'all' && REGIONS[selectedRegion] && REGIONS[selectedRegion].length > 0) {
      const firstCity = REGIONS[selectedRegion][0];
      setMapCenter(CITY_COORDINATES[firstCity]);
      setMapZoom(9); // Zoomed out to show the region
    } 
    // Default to center of Morocco
    else {
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(DEFAULT_ZOOM);
    }
    
    setShowMap(true);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSearched(true);
    filterCenters();
  };
  
  // Initialize map when the map modal is shown
  useEffect(() => {
    if (showMap && !mapInstanceRef.current) {
      // Create map instance
      const map = L.map(mapRef.current).setView(mapCenter, mapZoom);
      mapInstanceRef.current = map;
      
      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Create a layer group for markers
      markersLayerRef.current = L.layerGroup().addTo(map);
      
      // Add markers for filtered centers
      updateMapMarkers();
    } else if (showMap && mapInstanceRef.current) {
      // Update view if map is already initialized
      mapInstanceRef.current.setView(mapCenter, mapZoom);
      updateMapMarkers();
    } else if (!showMap && mapInstanceRef.current) {
      // Clean up map when modal is closed
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    }
  }, [showMap, mapCenter, mapZoom]);
  
  // Update markers when selected center or filtered centers change
  const updateMapMarkers = () => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    
    // Clear existing markers
    markersLayerRef.current.clearLayers();
    
    // Add markers for all filtered centers
    const bounds = [];
    
    filteredCenters.forEach(center => {
      if (center.coordinates) {
        const isSelected = selectedCenter && selectedCenter.name === center.name;
        const marker = L.marker(center.coordinates, {
          icon: createMarkerIcon(center.type),
          zIndexOffset: isSelected ? 1000 : 0
        });
        
        // Create popup with center info
        const popupContent = `
          <div class="map-popup">
            <h3>${center.name}</h3>
            <div class="popup-type ${getTypeClass(center.type).split(' ')[1]}">${center.type}</div>
            <p><strong>City:</strong> ${center.city || "Not specified"}</p>
            <p><strong>Region:</strong> ${center.region || "Not specified"}</p>
            <p><strong>Address:</strong> ${center.address || "Not specified"}</p>
            ${center.phone ? `<p><strong>Phone:</strong> <a href="tel:${center.phone?.replace(/\s/g, '')}">${center.phone}</a></p>` : ''}
            <p><strong>Capacity:</strong> ${center.capacity} stations</p>
          </div>
        `;
        marker.bindPopup(popupContent);
        
        // Open popup for selected center
        if (isSelected) {
          marker.openPopup();
        }
        
        markersLayerRef.current.addLayer(marker);
        bounds.push(center.coordinates);
      }
    });
    
    // Fit map to bounds if we have more than one marker and no specific center is selected
    if (!selectedCenter && bounds.length > 1) {
      mapInstanceRef.current.fitBounds(bounds);
    } else if (!selectedCenter && bounds.length === 1) {
      mapInstanceRef.current.setView(bounds[0], 14);
    }
  };
  
  // Update markers when filtered centers or selected center changes
  useEffect(() => {
    updateMapMarkers();
  }, [filteredCenters, selectedCenter]);
  
  return (
    <div className="dialysis-search-container">
      <header>
        <h1>Dialysis Center Finder</h1>
        <p>Find dialysis centers across Morocco by location, type, and capacity</p>
      </header>
      
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-grid">
          {/* Search Input */}
          <div className="form-group">
            <label htmlFor="search">Search</label>
            <div className="relative">
              <Search className="form-icon h-5 w-5" />
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name, address, phone..."
                className="form-control"
              />
            </div>
          </div>
          
          {/* Region Filter */}
          <div className="form-group">
            <label htmlFor="region">Region</label>
            <div className="relative">
              <Map className="form-icon h-5 w-5" />
              <select 
                id="region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="form-control"
              >
                <option value="all">All regions</option>
                {regions.filter(region => region !== 'all').map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* City Filter */}
          <div className="form-group">
            <label htmlFor="city">City</label>
            <div className="relative">
              <Building className="form-icon h-5 w-5" />
              <select 
                id="city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="form-control"
              >
                <option value="all">All cities</option>
                {cities.filter(city => city !== 'all').map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Center Type Filter */}
          <div className="form-group">
            <label htmlFor="type">Center Type</label>
            <div className="relative">
              <Building className="form-icon h-5 w-5" />
              <select 
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-control"
              >
                <option value="all">All types</option>
                {centerTypes.filter(type => type !== 'all').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Capacity Filter */}
         
         
        </div>
        
        {/* Search button */}
        <div className="search-button-container">
          <button type="submit" className="search-button">
            <Search className="h-4 w-4 mr-2" />
            Search
          </button>
        </div>
      </form>
      
      {/* Welcome message when no search has been performed */}
      {!hasSearched && !loading && (
        <div className="welcome-message">
          <div className="welcome-icon">
            <Search className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="welcome-title">Welcome to Dialysis Center Finder</h3>
          <p className="welcome-text">
            Use the search form above to find dialysis centers across Morocco.
            Filter by region, city, center type, or capacity to narrow your results.
          </p>
        </div>
      )}
      
      {/* Results section - only show if hasSearched is true */}
      {hasSearched && (
        <>
          {/* Map Button for all centers */}
          {filteredCenters.length > 0 && (
            <div className="view-all-map">
              <button 
                onClick={openMapWithAll}
                className="view-map-button"
              >
                <MapPin className="button-icon h-4 w-4 mr-2" />
                View All Centers on Map
              </button>
            </div>
          )}
          
          {/* Results Count */}
          <div className="results-count">
            <div className="count-number">
              {filteredCenters.length} result{filteredCenters.length !== 1 ? 's' : ''} found
            </div>
            {filteredCenters.length > 0 && (
              <div className="info-text">
                Click on a center for more details
              </div>
            )}
          </div>
          
          {/* Results */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Loading centers...</p>
            </div>
          ) : (
            filteredCenters.length > 0 && (
              <div className="results-grid">
                {filteredCenters.map((center, index) => (
                  <div key={index} className="center-card fade-in">
                    <div className="card-header">
                      <div className="card-title">
                        <h2 className="center-name">{center.name}</h2>
                        <span className={getTypeClass(center.type)}>
                          {center.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="info-row">
                        <Map className="info-icon h-5 w-5" />
                        <div className="info-text font-medium">{center.region || "Region not specified"}</div>
                      </div>
                      
                      <div className="info-row">
                        <Building className="info-icon h-5 w-5" />
                        <div className="info-text font-medium">{center.city || "City not specified"}</div>
                      </div>
                      
                      <div className="info-row">
                        <MapPin className="info-icon h-5 w-5" />
                        <div className="info-text">{center.address}</div>
                      </div>
                      
                      {center.phone && (
                        <div className="info-row">
                          <Phone className="info-icon h-5 w-5" />
                          <a href={`tel:${center.phone.replace(/\s/g, '')}`} className="phone-link">
                            {center.phone}
                          </a>
                        </div>
                      )}
                      
                    
                    </div>
                    
                    <div className="card-footer">
                      <button 
                        className="map-button"
                        onClick={() => openMap(center)}
                      >
                        <MapPin className="button-icon h-4 w-4" />
                        View on Map
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          
          {/* No Results */}
          {!loading && hasSearched && filteredCenters.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">
                <Search className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="no-results-title">No centers found</h3>
              <p className="no-results-text">
                No dialysis centers match your search criteria.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRegion('all');
                  setSelectedCity('all');
                  setSelectedType('all');
                 
                  setHasSearched(false);
                }}
                className="reset-button"
              >
                Reset all filters
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Map Modal */}
      {showMap && (
        <div className="map-modal">
          <div className="map-container">
            <div className="map-header">
              <h2>
                {selectedCenter 
                  ? `${selectedCenter.name} - ${selectedCenter.city || "Location"}`
                  : "Dialysis Centers Map"
                }
              </h2>
              <button 
                className="close-map-button"
                onClick={() => setShowMap(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="map-content" ref={mapRef} style={{ height: '500px', width: '100%' }}></div>
            <div className="map-legend">
              <div className="legend-item">
                <div className="legend-color public"></div>
                <span>Public Centers</span>
              </div>
              <div className="legend-item">
                <div className="legend-color private"></div>
                <span>Private Centers</span>
              </div>
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DialysisCenterFinder;