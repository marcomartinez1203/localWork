import { test, expect } from '@playwright/test';

test.describe('Auth Flow E2E', () => {
  test('El usuario puede iniciar sesión y acceder al dashboard', async ({ page }) => {
    // Interceptar llamadas a la API para simular el backend
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/api/auth/login')) {
        await route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({ token: 'mock-jwt-token', user: { id: 'u1', email: 'test@empresa.com', role: 'employer', full_name: 'Juan Perez' } })
        });
      } else if (url.includes('/api/auth/profile')) {
        await route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({ id: 'u1', role: 'employer', full_name: 'Juan Perez', email: 'test@empresa.com' })
        });
      } else if (url.includes('/api/companies/mine')) {
        await route.fulfill({
          status: 200, contentType: 'application/json',
          body: JSON.stringify({ data: { id: 'c1', name: 'Tech Corp' } })
        });
      } else if (url.includes('/api/jobs/mine') || url.includes('/api/applications/employer') || url.includes('/api/jobs/employer-stats')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0, page: 1, per_page: 10, views_count: 0 }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
      }
    });

    await page.goto('/login');

    await page.fill('input[type="email"]', 'test@empresa.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1').first()).toContainText('Panel');
  });

  test('Muestra un error cuando las credenciales son incorrectas', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401, contentType: 'application/json',
        body: JSON.stringify({ message: 'Credenciales inválidas' })
      });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@empresa.com');
    await page.fill('input[type="password"]', 'badpassword');
    await page.click('button[type="submit"]');

    const toast = page.locator('.lw-alert.show');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Credenciales inválidas');
  });
});
