import { test, expect } from '@playwright/test';

test.describe('Seeker Flow E2E', () => {
  test('El buscador de empleo puede ver y filtrar vacantes en el Home', async ({ page }) => {
    // Interceptar TODAS las llamadas a la API para evitar errores si el backend no está corriendo
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      console.log('INTERCEPTED:', url);
      
      if (url.includes('/api/jobs?')) {
        if (url.includes('search=Web')) {
          await route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({
              data: [ { id: 'j1', title: 'Desarrollador Web', company_name: 'Tech Corp', location: 'Centro', modality: 'Remoto', salary_min: 1000, vacancies: 1, created_at: new Date().toISOString() } ],
              total: 1, page: 1, per_page: 10
            })
          });
        } else {
          await route.fulfill({
            status: 200, contentType: 'application/json',
            body: JSON.stringify({
              data: [
                { id: 'j1', title: 'Desarrollador Web', company_name: 'Tech Corp', location: 'Centro', modality: 'Remoto', salary_min: 1000, vacancies: 1, created_at: new Date().toISOString() },
                { id: 'j2', title: 'Albañil', company_name: 'Construcciones S.A.', location: 'Norte', modality: 'Presencial', salary_min: 800, vacancies: 2, created_at: new Date().toISOString() }
              ],
              total: 2, page: 1, per_page: 10
            })
          });
        }
      } else if (url.includes('/api/jobs/recommended')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      } else if (url.includes('/api/jobs/categories')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 'cat1', name: 'Tecnología' }] }) });
      } else if (url.includes('/api/jobs/barrios')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [{ id: 'b1', name: 'Centro' }] }) });
      } else if (url.includes('/api/jobs/stats')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ total_active: 2, total_companies: 2 }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      }
    });

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    // Mock auth token to prevent router redirecting to /login
    await page.addInitScript(() => {
      localStorage.setItem('lw_token', 'fake-token');
      localStorage.setItem('lw_user', JSON.stringify({ role: 'seeker' }));
    });

    await page.goto('/home');

    const feed = page.locator('.home-center');
    await expect(feed.locator('text="Desarrollador Web"').first()).toBeVisible();
    await expect(feed.locator('text="Albañil"').first()).toBeVisible();

    const searchInput = page.locator('input[placeholder*="Cargo"]');
    await searchInput.fill('Web');

    await expect(feed.locator('text="Albañil"')).toHaveCount(0);
    await expect(feed.locator('text="Desarrollador Web"').first()).toBeVisible();
  });
});
