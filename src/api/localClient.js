/**
 * Purpose: Canonical local client facade for app pages and admin screens.
 * Used by: public pages, auth screens, and admin content/data screens.
 * Main dependencies: the local data client compatibility layer.
 * Public functions: localClient.auth.*, localClient.entities.*, localClient.integrations.*.
 * Side effects: Reads and writes browser sessionStorage through local services and optional Supabase sync.
 */
export { localClient } from './localClientCore.js';
