<template>
  <div class="map-layout">
    <aside class="map-filters">
      <div class="map-filters__header">
        <h2>Mapa de Empleos</h2>
        <button class="btn btn--secondary btn--sm" title="Buscar cerca de mí" @click="getUserLocation">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:16px;height:16px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
          Cerca de mí
        </button>
      </div>

      <div class="form-group">
        <label class="form-label">Distancia: <span>{{ (filterDistance/1000).toFixed(1) }}km</span></label>
        <input type="range" v-model.number="filterDistance" min="500" max="15000" step="500" class="form-range" @change="applyFilters">
      </div>

      <div class="form-group">
        <label class="form-label">Barrio / Zona</label>
        <select v-model="filterBarrio" class="form-input" @change="applyFilters">
          <option value="all">Todos los barrios</option>
          <option v-for="b in barrios" :key="b.id" :value="b.id">{{ b.nombre }}</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Categoría</label>
        <select v-model="filterCategory" class="form-input" @change="applyFilters">
          <option value="all">Todas las categorías</option>
          <option v-for="c in categories" :key="c.slug" :value="c.slug">{{ c.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Modalidad</label>
        <select v-model="filterModality" class="form-input" @change="applyFilters">
          <option value="all">Cualquier modalidad</option>
          <option value="Presencial">Presencial</option>
          <option value="Híbrido">Híbrido</option>
          <option value="Remoto">Remoto</option>
        </select>
      </div>
      
      <div class="map-filters__footer">
        {{ filteredJobsCount }} ofertas encontradas
      </div>
    </aside>

    <div class="map-container">
      <div id="map" ref="mapElement" style="width:100%; height:100%; z-index:1;"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import JobsService from '@/assets/js/services/jobs.service.js'
import { showToast } from '@/assets/js/utils/helpers.js'

const router = useRouter()
const mapElement = ref(null)
let map = null
let markerCluster = null
let allJobs = []
let userMarker = null
let userCircle = null

const filterDistance = ref(5000)
const filterBarrio = ref('all')
const filterCategory = ref('all')
const filterModality = ref('all')

const barrios = ref([])
const categories = ref([])
const filteredJobsCount = ref(0)
const userLocation = ref(null)

// Aguachica coords
const DEFAULT_CENTER = [8.3114, -73.6128]
const DEFAULT_ZOOM = 14

onMounted(async () => {
  document.body.classList.add('map-body')
  initMap()
  await Promise.all([
    loadFilters(),
    loadJobs()
  ])
})

onUnmounted(() => {
  document.body.classList.remove('map-body')
  if (map) {
    map.remove()
  }
})

const initMap = () => {
  map = L.map(mapElement.value, {
    zoomControl: false
  }).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map)

  markerCluster = L.markerClusterGroup({
    maxClusterRadius: 40,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  })

  map.addLayer(markerCluster)
}

const loadFilters = async () => {
  try {
    const cats = await JobsService.getCategories()
    categories.value = Array.isArray(cats) ? cats : (cats.data || [])
    const barrs = await JobsService.getBarrios()
    barrios.value = Array.isArray(barrs) ? barrs : (barrs.data || [])
  } catch (e) {
    console.error('Error load filters', e)
  }
}

const loadJobs = async () => {
  try {
    const filters = {
      lat: userLocation.value ? userLocation.value[0] : DEFAULT_CENTER[0],
      lng: userLocation.value ? userLocation.value[1] : DEFAULT_CENTER[1],
      radius: filterDistance.value,
      category: filterCategory.value,
      modality: filterModality.value,
      barrio_id: filterBarrio.value
    }
    const res = await JobsService.getNearby(filters)
    const jobs = Array.isArray(res) ? res : (res.data || [])
    filteredJobsCount.value = jobs.length
    renderMarkers(jobs)
  } catch (e) {
    console.error('Error load jobs map', e)
  }
}

const getUserLocation = () => {
  if (!navigator.geolocation) {
    showToast('Tu navegador no soporta geolocalización', 'error')
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation.value = [pos.coords.latitude, pos.coords.longitude]
      updateUserMarker()
      map.setView(userLocation.value, 15)
      loadJobs()
      showToast('Ubicación actualizada', 'success')
    },
    (err) => {
      showToast('No se pudo obtener la ubicación. Permite el acceso e intenta de nuevo.', 'error')
    }
  )
}

const updateUserMarker = () => {
  if (userMarker) map.removeLayer(userMarker)
  if (userCircle) map.removeLayer(userCircle)

  if (!userLocation.value) return

  userMarker = L.marker(userLocation.value, {
    icon: L.divIcon({
      className: 'user-marker-icon',
      html: '<div style="width:16px;height:16px;background:#007BFF;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  }).addTo(map)

  userCircle = L.circle(userLocation.value, {
    radius: filterDistance.value,
    color: '#007BFF',
    fillColor: '#007BFF',
    fillOpacity: 0.1,
    weight: 1
  }).addTo(map)
}

const applyFilters = () => {
  if (userLocation.value) updateUserMarker()
  loadJobs()
}

const renderMarkers = (jobs) => {
  markerCluster.clearLayers()
  const markers = []

  const customIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:32px;height:32px;color:#007200;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>`,
    className: 'custom-pin-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })

  jobs.forEach(job => {
    // en map.js legacy se usaba location_lat y location_lng (y también puede venir lat/lng)
    const lat = job.location_lat || job.lat
    const lng = job.location_lng || job.lng
    if (!lat || !lng) return

    const marker = L.marker([lat, lng], { icon: customIcon })

    const logoHtml = job.company_logo_url 
      ? `<img src="${job.company_logo_url}" alt="${job.company_name}" class="map-popup-card__logo">`
      : `<div class="map-popup-card__logo-placeholder">${job.company_name ? job.company_name.charAt(0).toUpperCase() : 'LW'}</div>`

    // modal icon map (to maintain visual identity from map.js legacy)
    const getModalityIcon = (m) => {
      if(m==='Presencial') return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:12px;height:12px;"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>`
      if(m==='Remoto') return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:12px;height:12px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>`
      if(m==='Híbrido') return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:12px;height:12px;"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>`
      return ''
    }

    const formatCurrency = (amount) => {
      if (!amount) return ''
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
    }

    const getSalaryText = (j) => {
      if (j.salary_text) return j.salary_text
      if (j.salary_min && j.salary_max) return `${formatCurrency(j.salary_min)} - ${formatCurrency(j.salary_max)}`
      if (j.salary_min) return `Desde ${formatCurrency(j.salary_min)}`
      return 'Salario a convenir'
    }

    const popupHtml = `
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
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
            ${job.barrio_nombre || job.location || 'Aguachica'}
          </span>
          <span class="map-popup-card__badge">
            ${getModalityIcon(job.modality)}
            ${job.modality}
          </span>
        </div>
        <div class="map-popup-card__salary">${getSalaryText(job)}</div>
        <a href="/job/${job.id}" class="btn btn--primary">Ver detalle</a>
      </div>
    `

    marker.bindPopup(popupHtml)
    
    // Tooltip hover identical to old
    marker.bindTooltip(`<b>${job.barrio_nombre || job.location || 'Aguachica'}</b><br>${job.title}`, {
      direction: 'top',
      offset: [0, -20]
    })

    markers.push(marker)
  })

  markerCluster.addLayers(markers)
}
</script>

<style>
@import '@/assets/css/pages/map.css';
/* Leaflet popup overrides */
.map-body .leaflet-popup-content-wrapper { border-radius: var(--radius-lg); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
.map-body .leaflet-popup-content { margin: var(--space-3) var(--space-4); }
</style>
