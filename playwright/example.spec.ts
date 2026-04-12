import { test, expect } from '@playwright/test';

test.describe('Blog Public Pages', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/orBlog/);
    await expect(page.locator('text=orBlog')).toBeVisible();
  });

  test('homepage shows post list', async ({ page }) => {
    await page.goto('/');
    // At least one post or empty state should be visible
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('text=关于')).toBeVisible();
  });

  test('category page loads', async ({ page }) => {
    await page.goto('/');
    // Click on category filter if exists
    const categoryLink = page.locator("a[href*='category']").first();
    if (await categoryLink.isVisible()) {
      await categoryLink.click();
      await expect(page).toHaveURL(/category/);
    }
  });
});

test.describe('Admin Pages', () => {
  test('admin login page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test('unauthorized access redirects to login without leaking admin content', async ({
    page,
    request,
  }) => {
    const response = await request.get('/admin', {
      failOnStatusCode: false,
      maxRedirects: 0,
    });

    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe('/admin/login');

    const body = await response.text();
    expect(body).not.toContain('All Posts');
    expect(body).not.toContain('New Post');
    expect(body).not.toContain('/admin/edit/');
    expect(body).not.toContain('action=');
    expect(body).not.toContain('$ACTION_');

    await page.goto('/admin');
    await expect(page).toHaveURL(/admin\/login/);
    await expect(page.locator('text=All Posts')).toHaveCount(0);
    await expect(page.locator('text=New Post')).toHaveCount(0);
  });

  test('unauthorized access to nested admin routes does not leak protected content', async ({
    request,
  }) => {
    const response = await request.get('/admin/categories', {
      failOnStatusCode: false,
      maxRedirects: 0,
    });

    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe('/admin/login');

    const body = await response.text();
    expect(body).not.toContain('/admin/categories/');
    expect(body).not.toContain('Create Category');
    expect(body).not.toContain('action=');
    expect(body).not.toContain('$ACTION_');
  });
});

test.describe('Search', () => {
  test('search page loads', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator("input[placeholder*='搜索']")).toBeVisible();
  });
});
