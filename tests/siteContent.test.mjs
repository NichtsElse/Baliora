/**
 * Purpose: Verifies public content helpers read admin-managed local records with correct fallbacks.
 * Used by: node --test verification during local development.
 * Main dependencies: node:test, node:assert, and siteContent helpers.
 * Public functions: none.
 * Side effects: none.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { getFeaturedTestimonials, getPublicFaqs, getWebsiteSettingValue } from '../src/lib/siteContent.js';

test('site content helpers expose the expected public fallbacks', () => {
  assert.equal(getWebsiteSettingValue('hero_subtitle'), 'Protecting your asset, elevating your returns.');
  assert.equal(getWebsiteSettingValue('company_name'), 'BALIORA');
  assert.equal(getPublicFaqs()[0].question, 'What types of villas do you manage?');
  assert.equal(getFeaturedTestimonials()[0].owner_name, 'Villa Owner');
});
