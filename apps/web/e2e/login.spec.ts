import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login successfully as egresado', async ({ page }) => {
    // Mock de la llamada tRPC de login
    await page.route('**/trpc/auth.login*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          result: {
            data: {
              accessToken: 'mock-token',
              user: {
                id: 'u1',
                email: 'test@example.com',
                role: 'EGRESADO',
              },
            },
          },
        }]),
      });
    });

    // Mock de la llamada tRPC 'me' para el dashboard
    await page.route('**/trpc/auth.me*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          result: {
            data: {
              id: 'u1',
              email: 'test@example.com',
              role: 'EGRESADO',
              isActive: true,
            },
          },
        }]),
      });
    });

    await page.goto('/auth/login');

    await page.fill('[data-testid="login-email"]', 'test@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    
    await Promise.all([
      page.waitForURL('**/dashboard/egresado', { timeout: 10000 }),
      page.click('[data-testid="login-submit"]'),
    ]);

    expect(page.url()).toContain('/dashboard/egresado');
  });
});
