/**
 * Purpose: Manages public navbar branding, navigation links, and CTA buttons from the admin area.
 * Used by: /admin/content/navbar route.
 * Main dependencies: React Query, localClient adapter, shared admin inputs, and router preview links.
 * Public functions: AdminContentNavbar default export.
 * Side effects: reads and updates website setting records in local storage or optional Supabase sync.
 */
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  Loader2,
  Eye,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEFAULT_NAV_LINKS = [
  { label: 'Villa Management', path: '/services' },
  { label: 'Rental Villas', path: '/villas' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Journal', path: '/blog' },
  { label: 'About', path: '/about' },
];

const DEFAULT_CTA = [
  { label: 'Owner Consultation', path: '/contact', style: 'primary' },
];

export default function AdminContentNavbar() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [navLinks, setNavLinks] = useState(DEFAULT_NAV_LINKS);
  const [ctaButtons, setCtaButtons] = useState(DEFAULT_CTA);
  const [brandName, setBrandName] = useState('BALIORA');
  const [initialized, setInitialized] = useState(false);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['content-navbar'],
    queryFn: () =>
      localClient.entities.WebsiteSetting.filter({ category: 'navbar' }, 'key', 20),
  });

  useEffect(() => {
    if (settings.length > 0 && !initialized) {
      const map = settings.reduce((accumulator, setting) => {
        accumulator[setting.key] = setting.value;
        return accumulator;
      }, {});

      if (map.brand_name) {
        setBrandName(map.brand_name);
      }

      if (map.nav_links) {
        try {
          setNavLinks(JSON.parse(map.nav_links));
        } catch {}
      }

      if (map.cta_buttons) {
        try {
          setCtaButtons(JSON.parse(map.cta_buttons));
        } catch {}
      }

      setInitialized(true);
    }
  }, [settings, initialized]);

  const settingsMap = settings.reduce((accumulator, setting) => {
    accumulator[setting.key] = setting;
    return accumulator;
  }, {});

  const upsert = async (key, value) => {
    const existing = settingsMap[key];
    const payload = {
      key,
      value,
      category: 'navbar',
      label: key,
      type: 'text',
    };

    if (existing?.id) {
      return localClient.entities.WebsiteSetting.update(existing.id, payload);
    }

    return localClient.entities.WebsiteSetting.create(payload);
  };

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      upsert('brand_name', brandName),
      upsert('nav_links', JSON.stringify(navLinks)),
      upsert('cta_buttons', JSON.stringify(ctaButtons)),
    ]);
    await queryClient.invalidateQueries({ queryKey: ['content-navbar'] });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateLink = (index, field, value) => {
    setNavLinks((previous) =>
      previous.map((link, currentIndex) =>
        currentIndex === index ? { ...link, [field]: value } : link
      )
    );
  };

  const removeLink = (index) => {
    setNavLinks((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const addLink = () => {
    setNavLinks((previous) => [...previous, { label: 'New Link', path: '/' }]);
  };

  const updateCta = (index, field, value) => {
    setCtaButtons((previous) =>
      previous.map((button, currentIndex) =>
        currentIndex === index ? { ...button, [field]: value } : button
      )
    );
  };

  const inputClassName =
    'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Navbar</h1>
          <p className="text-slate-500 text-sm mt-1">
            Edit navigation links, brand name, and CTA buttons
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-3 py-2 border border-slate-700 rounded-lg"
          >
            <Eye size={15} /> Preview
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/50">
              <h3 className="text-amber-400 text-sm font-medium">Brand</h3>
            </div>
            <div className="p-5">
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Brand Name</Label>
                <Input
                  value={brandName}
                  onChange={(event) => setBrandName(event.target.value)}
                  className={inputClassName}
                  placeholder="BALIORA"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/50 flex items-center justify-between">
              <h3 className="text-amber-400 text-sm font-medium">
                Navigation Links
              </h3>
              <button
                onClick={addLink}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                <Plus size={13} /> Add Link
              </button>
            </div>
            <div className="p-5 space-y-3">
              {navLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-3">
                  <GripVertical
                    size={16}
                    className="text-slate-700 flex-shrink-0"
                  />
                  <Input
                    value={link.label}
                    onChange={(event) =>
                      updateLink(index, 'label', event.target.value)
                    }
                    placeholder="Label"
                    className={`${inputClassName} flex-1`}
                  />
                  <Input
                    value={link.path}
                    onChange={(event) =>
                      updateLink(index, 'path', event.target.value)
                    }
                    placeholder="/path"
                    className={`${inputClassName} flex-1`}
                  />
                  <button
                    onClick={() => removeLink(index)}
                    className="text-slate-600 hover:text-red-400 flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <p className="text-slate-600 text-xs pt-1">
                Left column = display label, Right column = URL path
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/50">
              <h3 className="text-amber-400 text-sm font-medium">
                CTA Buttons (max 2)
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {ctaButtons.map((button, index) => (
                <div key={index} className="space-y-2">
                  <Label className="text-slate-500 text-xs">
                    Button {index + 1} —{' '}
                    <span className="text-slate-400">
                      {button.style === 'primary' ? 'Filled' : 'Outline'}
                    </span>
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      value={button.label}
                      onChange={(event) =>
                        updateCta(index, 'label', event.target.value)
                      }
                      placeholder="Button label"
                      className={`${inputClassName} flex-1`}
                    />
                    <Input
                      value={button.path}
                      onChange={(event) =>
                        updateCta(index, 'path', event.target.value)
                      }
                      placeholder="/path or https://..."
                      className={`${inputClassName} flex-1`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/50">
              <h3 className="text-amber-400 text-sm font-medium">Preview</h3>
            </div>
            <div className="p-5">
              <div className="bg-white/5 border border-slate-700 rounded-lg px-6 py-4 flex items-center justify-between gap-4 overflow-x-auto">
                <span className="font-display text-white text-lg tracking-widest flex-shrink-0">
                  {brandName}
                </span>
                <div className="flex items-center gap-5 flex-1 justify-center">
                  {navLinks.map((link, index) => (
                    <span
                      key={index}
                      className="text-slate-300 text-xs whitespace-nowrap"
                    >
                      {link.label}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {ctaButtons.map((button, index) => (
                    <span
                      key={index}
                      className={`text-xs px-3 py-1.5 whitespace-nowrap rounded-full border ${
                        button.style === 'primary'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'border-slate-400 text-slate-300'
                      }`}
                    >
                      {button.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
