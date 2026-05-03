/* ============================================
   Map Page Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  // ── 1. Map Initialization ──
  const AGUACHICA_CENTER = [8.3084, -73.6078];
  
  const map = L.map('map', {
    zoomControl: false // We'll add it in a different position
  }).setView(AGUACHICA_CENTER, 14);

  L.control.zoom({
    position: 'topright'
  }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);

  const markers = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
      return L.divIcon({ 
        html: '<div><span>' + cluster.getChildCount() + '</span></div>', 
        className: 'marker-cluster-custom', 
        iconSize: L.point(40, 40) 
      });
    }
  });
  
  map.addLayer(markers);

  // ── 2. State & Filters ──
  let userLocation = AGUACHICA_CENTER; // Default to center
  let hasUserLocation = false;

  const filters = {
    lat: userLocation[0],
    lng: userLocation[1],
    radius: 5000,
    category: 'all',
    modality: 'all',
    barrio_id: 'all'
  };

  const filterDistance = document.getElementById('filterDistance');
  const distanceValue = document.getElementById('distanceValue');
  const filterCategory = document.getElementById('filterCategory');
  const filterModality = document.getElementById('filterModality');
  const filterBarrio = document.getElementById('filterBarrio');
  const btnLocation = document.getElementById('btnLocation');
  const jobCountIndicator = document.getElementById('jobCountIndicator');

  // Custom Pin Icon
  const customIcon = L.icon({
    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#007200" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>'),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // ── 3. Initialization ──
  async function init() {
    await loadCategories();
    await loadBarrios();
    await fetchAndRenderJobs();
  }

  async function loadCategories() {
    try {
      const res = await JobsService.getCategories();
      const categories = Array.isArray(res) ? res : (res.data || []);
      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.slug;
        option.textContent = cat.name;
        filterCategory.appendChild(option);
      });
    } catch (e) {
      console.error('Error loading categories', e);
    }
  }

  async function loadBarrios() {
    try {
      const res = await JobsService.getBarrios();
      const barrios = Array.isArray(res) ? res : (res.data || []);
      barrios.forEach(b => {
        const option = document.createElement('option');
        option.value = b.id;
        option.textContent = b.nombre;
        filterBarrio.appendChild(option);
      });
    } catch (e) {
      console.error('Error loading barrios', e);
    }
  }

  function formatCurrency(amount) {
    if (!amount) return '';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  }

  function getSalaryText(job) {
    if (job.salary_text) return job.salary_text;
    if (job.salary_min && job.salary_max) return `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`;
    if (job.salary_min) return `Desde ${formatCurrency(job.salary_min)}`;
    return 'Salario a convenir';
  }

  function createPopupHTML(job) {
    const logoHtml = job.company_logo_url 
      ? `<img src="${job.company_logo_url}" alt="${job.company_name}" class="map-popup-card__logo">`
      : `<div class="map-popup-card__logo-placeholder">${job.company_name.charAt(0).toUpperCase()}</div>`;

    return `
      <div class="map-popup-card">
        <div class="map-popup-card__header">
          ${logoHtml}
          <div>
            <h3 class="map-popup-card__title">${job.title}</h3>
            <p class="map-popup-card__company">${job.company_name}</p>
          </div>
        </div>
        <div class="map-popup-card__meta">
          <span class="map-popup-card__badge">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            ${job.barrio_nombre || job.location || 'Aguachica'}
          </span>
          <span class="map-popup-card__badge">
            ${job.modality}
          </span>
        </div>
        <div class="map-popup-card__salary">${getSalaryText(job)}</div>
        <a href="job-detail.html?id=${job.id}" class="btn btn--primary">Ver detalle</a>
      </div>
    `;
  }

  async function fetchAndRenderJobs() {
    try {
      jobCountIndicator.textContent = 'Cargando...';
      const res = await JobsService.getNearby(filters);
      const jobs = Array.isArray(res) ? res : (res.data || []);
      
      markers.clearLayers();

      jobs.forEach(job => {
        if (!job.location_lat || !job.location_lng) return;
        
        const marker = L.marker([job.location_lat, job.location_lng], { icon: customIcon });
        
        marker.bindPopup(createPopupHTML(job));
        
        // Tooltip for quick hover
        marker.bindTooltip(`<b>${job.barrio_nombre || job.location}</b><br>${job.title}`, {
          direction: 'top',
          offset: [0, -20]
        });

        markers.addLayer(marker);
      });

      jobCountIndicator.textContent = `${jobs.length} ofertas encontradas`;
    } catch (error) {
      console.error('Error fetching nearby jobs', error);
      jobCountIndicator.textContent = 'Error al cargar ofertas';
    }
  }

  // ── 4. Event Listeners ──

  filterDistance.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    distanceValue.textContent = val >= 1000 ? `${val/1000}km` : `${val}m`;
  });

  filterDistance.addEventListener('change', (e) => {
    filters.radius = parseInt(e.target.value);
    fetchAndRenderJobs();
  });

  filterCategory.addEventListener('change', (e) => {
    filters.category = e.target.value;
    fetchAndRenderJobs();
  });

  filterModality.addEventListener('change', (e) => {
    filters.modality = e.target.value;
    fetchAndRenderJobs();
  });

  filterBarrio.addEventListener('change', (e) => {
    filters.barrio_id = e.target.value;
    fetchAndRenderJobs();
  });

  btnLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
      App.showToast('Tu navegador no soporta geolocalización', 'error');
      return;
    }

    btnLocation.innerHTML = 'Buscando...';
    btnLocation.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        hasUserLocation = true;
        userLocation = [pos.coords.latitude, pos.coords.longitude];
        
        // Update filters
        filters.lat = userLocation[0];
        filters.lng = userLocation[1];
        
        // Pan map
        map.setView(userLocation, 15);
        
        // Show user marker
        L.circleMarker(userLocation, {
          radius: 8,
          fillColor: "#007BFF",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map).bindPopup("Tu ubicación actual").openPopup();

        fetchAndRenderJobs();
        
        btnLocation.innerHTML = 'Cerca de mí';
        btnLocation.disabled = false;
        App.showToast('Ubicación actualizada', 'success');
      },
      (err) => {
        console.error(err);
        btnLocation.innerHTML = 'Cerca de mí';
        btnLocation.disabled = false;
        App.showToast('No se pudo obtener la ubicación', 'error');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });

  init();
});
