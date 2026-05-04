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
          <option v-for="b in barrios" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Categoría</label>
        <select v-model="filterCategory" class="form-input" @change="applyFilters">
          <option value="all">Todas las categorías</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
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
  initMap()
  await Promise.all([
    loadFilters(),
    loadJobs()
  ])
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})

const initMap = () => {
  map = L.map(mapElement.value, {
    zoomControl: false // Add custom later if needed
  }).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
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
    categories.value = cats || []
    const barrs = await JobsService.getBarrios()
    barrios.value = barrs || []
  } catch (e) {
    console.error('Error load filters', e)
  }
}

const loadJobs = async () => {
  try {
    const jobs = await JobsService.getMapData()
    allJobs = jobs || []
    applyFilters()
  } catch (e) {
    console.error('Error load jobs map', e)
  }
}

const getUserLocation = () => {
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización')
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation.value = [pos.coords.latitude, pos.coords.longitude]
      updateUserMarker()
      map.setView(userLocation.value, 15)
      applyFilters()
    },
    (err) => {
      alert('No se pudo obtener tu ubicación. Permite el acceso e intenta de nuevo.')
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
      html: '<div style="width:16px;height:16px;background:#3b82f6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  }).addTo(map)

  userCircle = L.circle(userLocation.value, {
    radius: filterDistance.value,
    color: '#3b82f6',
    fillColor: '#3b82f6',
    fillOpacity: 0.1,
    weight: 1
  }).addTo(map)
}

const applyFilters = () => {
  if (userLocation.value) updateUserMarker()

  const filtered = allJobs.filter(job => {
    if (filterCategory.value !== 'all' && job.category_id !== parseInt(filterCategory.value)) return false
    if (filterBarrio.value !== 'all' && job.barrio_id !== parseInt(filterBarrio.value)) return false
    if (filterModality.value !== 'all' && job.modality !== filterModality.value) return false
    
    if (userLocation.value && job.lat && job.lng) {
      const dist = map.distance(userLocation.value, [job.lat, job.lng])
      if (dist > filterDistance.value) return false
    }
    return true
  })

  filteredJobsCount.value = filtered.length
  renderMarkers(filtered)
}

const renderMarkers = (jobs) => {
  markerCluster.clearLayers()
  const markers = []

  jobs.forEach(job => {
    if (!job.lat || !job.lng) return

    const el = document.createElement('div')
    el.innerHTML = `<div style="width:36px;height:36px;background:var(--color-primary);border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);font-size:12px;">
      ${job.company_name ? job.company_name.substring(0, 2).toUpperCase() : 'LW'}
    </div>`

    const icon = L.divIcon({
      className: 'custom-job-marker',
      html: el.innerHTML,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    })

    const marker = L.marker([job.lat, job.lng], { icon })

    const popupHtml = `
      <div style="font-family:var(--font-sans);min-width:200px;">
        <h3 style="margin:0 0 4px;font-size:14px;color:var(--color-text);">${job.title}</h3>
        <p style="margin:0 0 8px;font-size:12px;color:var(--color-text-muted);">${job.company_name || 'Empresa confidencial'}</p>
        <div style="display:flex;gap:4px;margin-bottom:12px;flex-wrap:wrap;">
          <span style="font-size:10px;padding:2px 6px;background:var(--color-bg);border-radius:4px;">${job.modality}</span>
          ${job.salary_text ? `<span style="font-size:10px;padding:2px 6px;background:var(--color-primary-50);color:var(--color-primary-dark);border-radius:4px;">${job.salary_text}</span>` : ''}
        </div>
        <a href="#/job/${job.id}" class="btn btn--sm btn--primary" style="display:block;text-align:center;text-decoration:none;width:100%;padding:4px 0;">Ver detalles</a>
      </div>
    `

    marker.bindPopup(popupHtml, { minWidth: 200 })
    markers.push(marker)
  })

  markerCluster.addLayers(markers)
}
</script>

<style scoped>
@import '@/assets/css/pages/map.css';
.map-layout { display: flex; height: calc(100vh - var(--navbar-height, 60px)); overflow: hidden; background: var(--color-bg); }
.map-filters { width: 320px; background: var(--color-surface); border-right: 1px solid var(--color-border-light); display: flex; flex-direction: column; overflow-y: auto; padding: var(--space-5); z-index: 10; box-shadow: 2px 0 10px rgba(0,0,0,0.05); }
.map-filters__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
.map-filters__header h2 { font-size: var(--fs-lg); margin: 0; }
.map-filters .form-group { margin-bottom: var(--space-5); }
.map-filters__footer { margin-top: auto; padding-top: var(--space-4); border-top: 1px solid var(--color-border-light); font-size: var(--fs-sm); color: var(--color-text-muted); text-align: center; }
.map-container { flex: 1; position: relative; }
@media (max-width: 768px) {
  .map-layout { flex-direction: column; height: calc(100vh - 60px); }
  .map-filters { width: 100%; max-height: 40vh; border-right: none; border-bottom: 1px solid var(--color-border-light); box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: var(--space-4); }
  .map-container { flex: 1; min-height: 50vh; }
}
/* Leaflet popup overrides */
:deep(.leaflet-popup-content-wrapper) { border-radius: var(--radius-lg); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
:deep(.leaflet-popup-content) { margin: var(--space-3) var(--space-4); }
</style>
