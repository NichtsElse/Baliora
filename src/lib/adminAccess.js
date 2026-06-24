/**
 * Purpose: Centralizes admin role-to-module access rules for the local-first admin area.
 * Used by: admin navigation, admin route guards, and future permission checks.
 * Main dependencies: none.
 * Public functions: canAccessAdminPath, filterAdminNavItems, getAllowedAdminModules.
 * Side effects: none.
 */
const ROLE_ACCESS = {
  admin: ['*'],
  villa_manager: [
    '/admin',
    '/admin/villas',
    '/admin/villas/new',
    '/admin/villas/:id/edit',
    '/admin/villas/availability',
    '/admin/villas/amenities',
    '/admin/villas/gallery',
    '/admin/villas/pricing',
  ],
  reservation_staff: [
    '/admin',
    '/admin/bookings',
    '/admin/bookings/reservations',
    '/admin/bookings/guests',
    '/admin/bookings/communications',
    '/admin/inquiries',
  ],
  content_manager: [
    '/admin',
    '/admin/blog',
    '/admin/blog/new',
    '/admin/blog/:id/edit',
    '/admin/faqs',
    '/admin/testimonials',
    '/admin/content/navbar',
    '/admin/content/homepage',
    '/admin/content/about',
    '/admin/content/services',
  ],
  user: [],
};

const normalizePath = (path) => path.replace(/\/+$/, '');

const matchesRule = (pathname, rule) => {
  if (rule === '*') {
    return true;
  }

  const normalizedPath = normalizePath(pathname);
  const normalizedRule = normalizePath(rule);

  if (normalizedRule.includes('/:id/')) {
    const [prefix, suffix] = normalizedRule.split('/:id/');
    return normalizedPath.startsWith(prefix) && normalizedPath.includes(`/${suffix}`);
  }

  if (normalizedRule.endsWith('/:id/edit')) {
    const prefix = normalizedRule.replace('/:id/edit', '');
    return normalizedPath.startsWith(prefix) && normalizedPath.endsWith('/edit');
  }

  return normalizedPath === normalizedRule || normalizedPath.startsWith(`${normalizedRule}/`);
};

export const canAccessAdminPath = (role = 'user', pathname = '') => {
  const rules = ROLE_ACCESS[role] || ROLE_ACCESS.user;
  return rules.some((rule) => matchesRule(pathname, rule));
};

export const filterAdminNavItems = (items, role = 'user') =>
  items.filter((item) => canAccessAdminPath(role, item.path || '/admin'));

export const getAllowedAdminModules = (role = 'user') => ROLE_ACCESS[role] || ROLE_ACCESS.user;
