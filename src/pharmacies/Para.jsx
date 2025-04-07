import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Phone, Clock, Building, Map, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Import the JSON data directly since it's in the same folder
import pharmaciesData from './pharma.json';
import '../assets/pharma.css'; // Import the CSS file

// Define constants for the map
const DEFAULT_CENTER = [31.7917, -7.0926]; // Center of Morocco
const DEFAULT_ZOOM = 6;

// City coordinates mapping
const CITY_COORDINATES = {
  "Essaouira": [31.5125, -9.7700],
  "Marrakech": [31.6295, -7.9811],
  "Agadir": [30.4278, -9.5981],
  "Casablanca": [33.5731, -7.5898],
  "Rabat": [34.0209, -6.8416],
  "Tangier": [35.7595, -5.8340],
  "Fez": [34.0181, -5.0078],
  "Meknes": [33.8731, -5.5407],
  "Oujda": [34.6805, -1.9112],
  "Tetouan": [35.5889, -5.3626],
  "Safi": [32.2994, -9.2372],
  "El Jadida": [33.2549, -8.5074],
  // Add more cities as needed
};

// Setup Leaflet icon paths (needed because Leaflet looks for icons in specific paths)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom marker icons
const createMarkerIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const Para = () => {
  // States for data
  const [pharmacies, setPharmacies] = useState([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedQuartier, setSelectedQuartier] = useState('all');
  const [openStatus, setOpenStatus] = useState('all');
  const [hasSearched, setHasSearched] = useState(false); // New state to track if user has searched
  
  // Map states
  const [showMap, setShowMap] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  
  // Improved function to get pharmacy coordinates based on multiple methods
  const getPharmacyCoordinates = (pharmacy) => {
    // Case 1: Pharmacy already has coordinates in the data
    if (pharmacy.latitude && pharmacy.longitude) {
      return [pharmacy.latitude, pharmacy.longitude];
    }
    
    // Case 2: We have city coordinates for this pharmacy's city
    if (pharmacy.city && CITY_COORDINATES[pharmacy.city]) {
      // Add a small random offset to prevent markers from stacking exactly on top of each other
      // Use a smaller offset value (0.005 is roughly 500m) to keep pharmacies in the same general area
      const latOffset = (Math.random() - 0.5) * 0.005;
      const lngOffset = (Math.random() - 0.5) * 0.005;
      
      return [
        CITY_COORDINATES[pharmacy.city][0] + latOffset,
        CITY_COORDINATES[pharmacy.city][1] + lngOffset
      ];
    }
    
    // Case 3: Try to extract city from address if pharmacy.city is not available
    if (pharmacy.adresse) {
      // Split address by spaces and commas and check each part against our city list
      const addressParts = pharmacy.adresse.split(/[\s,]+/);
      
      for (const part of addressParts) {
        const normalizedPart = part.trim();
        // Check if this address part matches any city in our coordinates list
        for (const city in CITY_COORDINATES) {
          if (normalizedPart.toLowerCase() === city.toLowerCase()) {
            // Found a city match in the address
            const latOffset = (Math.random() - 0.5) * 0.005;
            const lngOffset = (Math.random() - 0.5) * 0.005;
            
            return [
              CITY_COORDINATES[city][0] + latOffset,
              CITY_COORDINATES[city][1] + lngOffset
            ];
          }
        }
      }
    }
    
    // Case 4: Use quartier-based mapping if available
    // Some quartiers might be uniquely associated with specific cities
    const quartierToCityMap = {
      "Medina": "Essaouira",
      "Geliz": "Marrakech",
      // Add more quartier-to-city mappings as needed
    };
    
    if (pharmacy.quartier && quartierToCityMap[pharmacy.quartier]) {
      const city = quartierToCityMap[pharmacy.quartier];
      const latOffset = (Math.random() - 0.5) * 0.005;
      const lngOffset = (Math.random() - 0.5) * 0.005;
      
      return [
        CITY_COORDINATES[city][0] + latOffset,
        CITY_COORDINATES[city][1] + lngOffset
      ];
    }
    
    // Case 5: Fallback to center of Morocco if we can't determine location
    console.warn(`Could not determine accurate location for pharmacy: ${pharmacy.pharmacie}`);
    return [31.7917, -7.0926]; // Center of Morocco as fallback
  };
  
  // Enhanced function to extract city and add coordinates
  const extractCityFromAddress = (pharmacy) => {
    if (!pharmacy.adresse || pharmacy.adresse.trim() === '') return pharmacy;
    
    // Try to extract city from address if not already specified
    if (!pharmacy.city) {
      const addressParts = pharmacy.adresse.trim().split(' ');
      const lastWord = addressParts[addressParts.length - 1];
      
      // Check if the last word is actually a city we know
      if (CITY_COORDINATES[lastWord]) {
        pharmacy.city = lastWord;
      }
      // Otherwise, just use the last word as a placeholder city name
      else {
        pharmacy.city = lastWord;
      }
    }
    
    // Get coordinates using our improved function
    const coordinates = getPharmacyCoordinates(pharmacy);
    
    return {
      ...pharmacy,
      coordinates: coordinates
    };
  };
  
  // Function to update coordinates when user selects a pharmacy 
  const updatePharmacyCoordinates = (pharmacy, cityOverride) => {
    // If user has explicitly selected a city, override the coordinates
    if (cityOverride && CITY_COORDINATES[cityOverride]) {
      const latOffset = (Math.random() - 0.5) * 0.005;
      const lngOffset = (Math.random() - 0.5) * 0.005;
      
      return [
        CITY_COORDINATES[cityOverride][0] + latOffset,
        CITY_COORDINATES[cityOverride][1] + lngOffset
      ];
    }
    
    // Otherwise use the standard coordinates logic
    return getPharmacyCoordinates(pharmacy);
  };
  
  // Function to initialize pharmacy data
  const initializePharmacyData = (data) => {
    return data.map(pharmacy => {
      // Check if pharmacy already has coordinates
      if (pharmacy.coordinates) {
        return pharmacy;
      }
      
      // Process the pharmacy to add city and coordinates
      return extractCityFromAddress(pharmacy);
    });
  };
  
  useEffect(() => {
    // Process the data with our new improved functions
    const processedData = initializePharmacyData(pharmaciesData);
    setPharmacies(processedData);
    setLoading(false);
  }, []);
  
  // Get unique cities for dropdown
  const cities = ['all', ...new Set(pharmacies.map(pharmacy => pharmacy.city || ''))].filter(Boolean);
  
  // Get unique quartiers for dropdown (filtered by selected city if applicable)
  const quartiers = ['all', ...new Set(
    pharmacies
      .filter(pharmacy => selectedCity === 'all' || pharmacy.city === selectedCity)
      .map(pharmacy => pharmacy.quartier)
  )].filter(Boolean);
  
  // Filter function
  const filterPharmacies = () => {
    let results = pharmacies;
    
    // Check if any filter is active
    const isFiltered = searchTerm || 
                       selectedCity !== 'all' || 
                       selectedQuartier !== 'all' || 
                       openStatus !== 'all';
    
    // Set hasSearched to true if any filter is active
    setHasSearched(isFiltered);
    
    // If no filters are active and we don't want to show initial results, return empty array
    if (!isFiltered && !hasSearched) {
      setFilteredPharmacies([]);
      return;
    }
    
    if (selectedCity !== 'all') {
      results = results.filter(pharmacy => pharmacy.city === selectedCity);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        pharmacy => 
          pharmacy.pharmacie.toLowerCase().includes(term) ||
          pharmacy.adresse.toLowerCase().includes(term) ||
          pharmacy.quartier.toLowerCase().includes(term) ||
          (pharmacy.telephone && pharmacy.telephone.toLowerCase().includes(term))
      );
    }
    
    // Filter by quartier
    if (selectedQuartier !== 'all') {
      results = results.filter(pharmacy => pharmacy.quartier === selectedQuartier);
    }
    
    // Filter by open status
    if (openStatus === 'jour') {
      results = results.filter(pharmacy => pharmacy.etat.includes('Jour'));
    } else if (openStatus === 'nuit') {
      results = results.filter(pharmacy => pharmacy.etat.includes('Nuit'));
    } else if (openStatus === '24h') {
      results = results.filter(pharmacy => pharmacy.etat === 'Jour et Nuit');
    }
    
    setFilteredPharmacies(results);
  };
  
  // Apply filters whenever search criteria change
  useEffect(() => {
    filterPharmacies();
  }, [searchTerm, selectedCity, selectedQuartier, openStatus, pharmacies]);
  
  // Reset quartier when city changes
  useEffect(() => {
    setSelectedQuartier('all');
  }, [selectedCity]);
  
  // Function to determine status badge class
  const getStatusClass = (status) => {
    if (status === "Jour et Nuit") return "status-badge day-night";
    if (status.includes("Nuit")) return "status-badge night";
    return "status-badge day";
  };
  
  // Function to get marker icon based on pharmacy status
  const getMarkerColor = (status) => {
    if (status === "Jour et Nuit") return 'green';
    if (status.includes("Nuit")) return 'blue';
    return 'red';
  };
  
  // Open map with selected pharmacy with optional city override
  const openMap = (pharmacy, cityOverride = null) => {
    setSelectedPharmacy(pharmacy);
    if (pharmacy) {
      // If cityOverride is provided, use it to get more accurate coordinates
      const coordinates = cityOverride ? 
        updatePharmacyCoordinates(pharmacy, cityOverride) : 
        pharmacy.coordinates;
      
      setMapCenter(coordinates);
      setMapZoom(15); // Zoom in when a specific pharmacy is selected
    } else {
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(DEFAULT_ZOOM);
    }
    setShowMap(true);
  };
  
  // Open map with all filtered pharmacies
  const openMapWithAll = () => {
    setSelectedPharmacy(null);
    // If a city is selected, center the map on that city
    if (selectedCity !== 'all' && CITY_COORDINATES[selectedCity]) {
      setMapCenter(CITY_COORDINATES[selectedCity]);
      setMapZoom(13); // Slightly zoomed out to show whole city
    } else {
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(DEFAULT_ZOOM);
    }
    setShowMap(true);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setHasSearched(true);
    filterPharmacies();
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
      
      // Add markers for filtered pharmacies
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
  
  // Update markers when selected pharmacy or filtered pharmacies change
  const updateMapMarkers = () => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;
    
    // Clear existing markers
    markersLayerRef.current.clearLayers();
    
    // Add markers for all filtered pharmacies
    filteredPharmacies.forEach(pharmacy => {
      if (pharmacy.coordinates) {
        const isSelected = selectedPharmacy && selectedPharmacy.pharmacie === pharmacy.pharmacie;
        const markerColor = getMarkerColor(pharmacy.etat);
        const marker = L.marker(pharmacy.coordinates, {
          icon: createMarkerIcon(markerColor),
          // Make selected marker larger or bounce
          zIndexOffset: isSelected ? 1000 : 0
        });
        
        // Create popup with pharmacy info
        const popupContent = `
          <div class="map-popup">
            <h3>${pharmacy.pharmacie}</h3>
            <div class="popup-status ${getStatusClass(pharmacy.etat).split(' ')[1]}">${pharmacy.etat}</div>
            <p><strong>Quartier:</strong> ${pharmacy.quartier}</p>
            <p><strong>Adresse:</strong> ${pharmacy.adresse}</p>
            <p><strong>Téléphone:</strong> <a href="tel:${pharmacy.telephone?.replace(/\s/g, '')}">${pharmacy.telephone}</a></p>
          </div>
        `;
        marker.bindPopup(popupContent);
        
        // Open popup for selected pharmacy
        if (isSelected) {
          marker.openPopup();
        }
        
        markersLayerRef.current.addLayer(marker);
      }
    });
  };
  
  // Update markers when filtered pharmacies or selected pharmacy changes
  useEffect(() => {
    updateMapMarkers();
  }, [filteredPharmacies, selectedPharmacy]);
  
  return (
    <div className="pharmacy-search-container">
      <header>
        <h1 className='recherche'>Search for Pharmacies</h1>
        <p>Find available pharmacies near you easily and quickly.</p>
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
                placeholder="Nom, adresse, téléphone..."
                className="form-control"
              />
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
          
          {/* Quartier Filter */}
          <div className="form-group">
            <label htmlFor="quartier">Borough</label>
            <div className="relative">
              <Map className="form-icon h-5 w-5" />
              <select 
                id="quartier"
                value={selectedQuartier}
                onChange={(e) => setSelectedQuartier(e.target.value)}
                className="form-control"
              >
                <option value="all">All boroughs</option>
                {quartiers.filter(q => q !== 'all').map(quartier => (
                  <option key={quartier} value={quartier}>{quartier}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Open Status Filter */}
          <div className="form-group">
            <label htmlFor="status">time</label>
            <div className="relative">
              <Clock className="form-icon h-5 w-5" />
              <select 
                id="status"
                value={openStatus}
                onChange={(e) => setOpenStatus(e.target.value)}
                className="form-control"
              >
                <option value="all">The whole Time</option>
                <option value="jour">Open during the day.</option>
                <option value="nuit">Open during the night</option>
                <option value="24h">Open 24h/24</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Add a search button */}
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
            <Search className="h-10 w-10 text-green-500" />
          </div>
          <h3 className="welcome-title">Welcome to Pharmacy Finder</h3>
          <p className="welcome-text">
            Use the search form above to find pharmacies in your area.
          </p>
        </div>
      )}
      
      {/* Results section - only show if hasSearched is true */}
      {hasSearched && (
        <>
          {/* Map Button for all pharmacies */}
          {filteredPharmacies.length > 0 && (
            <div className="view-all-map">
              <button 
                onClick={openMapWithAll}
                className="viewbutton"
              >
                <MapPin className="button-icon h-4 w-4 mr-2" />
                see the Pharma on Map
              </button>
            </div>
          )}
          
          {/* Results Count */}
          <div className="results-count">
            <div className="count-number">
              {filteredPharmacies.length} result{filteredPharmacies.length !== 1 ? 's' : ''} find{filteredPharmacies.length !== 1 ? 's' : ''}
            </div>
            {filteredPharmacies.length > 0 && (
              <div className="info-text">
                click in pharmacies for more details
              </div>
            )}
          </div>
          
          {/* Results */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">loading...</p>
            </div>
          ) : (
            filteredPharmacies.length > 0 && (
              <div className="results-grid">
                {filteredPharmacies.map((pharmacy, index) => (
                  <div key={index} className="pharmacy-card fade-in">
                    <div className="card-header">
                      <div className="card-title">
                        <h2 className="pharmacy-name">{pharmacy.pharmacie}</h2>
                        <span className={getStatusClass(pharmacy.etat)}>
                          {pharmacy.etat}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="info-row">
                        <Building className="info-icon h-5 w-5" />
                        <div className="info-text font-medium">{pharmacy.city || "Non spécifiée"}</div>
                      </div>
                      
                      <div className="info-row">
                        <Map className="info-icon h-5 w-5" />
                        <div className="info-text">{pharmacy.quartier}</div>
                      </div>
                      
                      <div className="info-row">
                        <MapPin className="info-icon h-5 w-5" />
                        <div className="info-text">{pharmacy.adresse}</div>
                      </div>
                      
                      <div className="info-row">
                        <Phone className="info-icon h-5 w-5" />
                        <a href={`tel:${pharmacy.telephone?.replace(/\s/g, '')}`} className="phone-link">
                          {pharmacy.telephone}
                        </a>
                      </div>
                    </div>
                    
                    <div className="card-footer">
                      <button 
                        className="map-button"
                        onClick={() => openMap(pharmacy, selectedCity !== 'all' ? selectedCity : null)}
                      >
                        <MapPin className="button-icon h-4 w-4" />
                        See on the Map
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          
          {/* No Results */}
          {!loading && hasSearched && filteredPharmacies.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">
                <Search className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="no-results-title">Nothing</h3>
              <p className="no-results-text">
                No pharmacy found.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCity('all');
                  setSelectedQuartier('all');
                  setOpenStatus('all');
                  setHasSearched(false);
                }}
                className="reset-button"
              >
                Réinitialiser les filtres
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
              <h2>Map</h2>
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
                <div className="legend-color day"></div>
                <span>Open during the morning</span>
              </div>
              <div className="legend-item">
                <div className="legend-color night"></div>
                <span>Open during the night</span>
              </div>
              <div className="legend-item">
                <div className="legend-color day-night"></div>
                <span>Open 24h/24</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Para;