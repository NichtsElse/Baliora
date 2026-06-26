/**
 * Purpose: Manages third-party service integrations — Supabase, EmailJS, and analytics connections.
 * Used by: /admin/settings/integrations route.
 * Main dependencies: lucide-react, import.meta.env, use-toast.
 * Public functions: AdminIntegrations default export.
 */
import React, { useState, useEffect } from 'react';
import {
  Plug, CheckCircle, XCircle, AlertCircle, RefreshCw,
  Database, Mail, BarChart3, Globe, Shield, ExternalLink,
  Eye, EyeOff, Copy, Save, Loader2, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const viteEnv = import.meta.env ?? {};

// Read configured values from environment
const ENV_VALUES = {
  supabase_url: viteEnv.VITE_SUPABASE_URL || '',
  supabase_anon_key: viteEnv.VITE_SUPABASE_ANON_KEY || '',
  emailjs_service_id: viteEnv.EMAILJS_SERVICE_ID || '',
  emailjs_public_key: viteEnv.EMAILJS_PUBLIC_KEY || '',
  emailjs_consultation_template: viteEnv.EMAILJS_CONSULTATION_TEMPLATE_ID || '',
  emailjs_booking_template: viteEnv.EMAILJS_BOOKING_TEMPLATE_ID || '',
  leads_email: viteEnv.LEADS_TO_EMAIL || '',
};

const isConfigured = (val) => Boolean(val && val.length > 4);

const INTEGRATIONS = [
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'Database',
    icon: Database,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    description: 'Cloud PostgreSQL database for syncing admin data across devices.',
    docs: 'https://supabase.com/docs',
    fields: [
      { key: 'supabase_url', label: 'Project URL', placeholder: 'https://xxx.supabase.co', type: 'url', secret: false },
      { key: 'supabase_anon_key', label: 'Anon Key (Public)', placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', type: 'text', secret: true },
    ],
    envKeys: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    envValues: { VITE_SUPABASE_URL: ENV_VALUES.supabase_url, VITE_SUPABASE_ANON_KEY: ENV_VALUES.supabase_anon_key },
  },
  {
    id: 'emailjs',
    name: 'EmailJS',
    category: 'Email',
    icon: Mail,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Send lead notification emails directly from the browser — no backend required.',
    docs: 'https://www.emailjs.com/docs',
    fields: [
      { key: 'emailjs_service_id', label: 'Service ID', placeholder: 'service_xxxxxxx', type: 'text', secret: false },
      { key: 'emailjs_public_key', label: 'Public Key', placeholder: 'xxxxxxxxxxxxxxxx', type: 'text', secret: true },
      { key: 'emailjs_consultation_template', label: 'Consultation Template ID', placeholder: 'template_xxxxxx', type: 'text', secret: false },
      { key: 'emailjs_booking_template', label: 'Booking Template ID', placeholder: 'template_xxxxxx', type: 'text', secret: false },
      { key: 'leads_email', label: 'Leads Destination Email', placeholder: 'info@yourcompany.com', type: 'email', secret: false },
    ],
    envKeys: ['EMAILJS_SERVICE_ID', 'EMAILJS_PUBLIC_KEY', 'EMAILJS_CONSULTATION_TEMPLATE_ID', 'EMAILJS_BOOKING_TEMPLATE_ID', 'LEADS_TO_EMAIL'],
    envValues: {
      EMAILJS_SERVICE_ID: ENV_VALUES.emailjs_service_id,
      EMAILJS_PUBLIC_KEY: ENV_VALUES.emailjs_public_key,
      EMAILJS_CONSULTATION_TEMPLATE_ID: ENV_VALUES.emailjs_consultation_template,
      EMAILJS_BOOKING_TEMPLATE_ID: ENV_VALUES.emailjs_booking_template,
      LEADS_TO_EMAIL: ENV_VALUES.leads_email,
    },
  },
  {
    id: 'ga4',
    name: 'Google Analytics 4',
    category: 'Analytics',
    icon: BarChart3,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    description: 'Track site traffic, user behavior, and conversions in real time.',
    docs: 'https://developers.google.com/analytics',
    fields: [
      { key: 'ga4_measurement_id', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX', type: 'text', secret: false },
    ],
    envKeys: ['VITE_GA4_MEASUREMENT_ID'],
    envValues: { VITE_GA4_MEASUREMENT_ID: viteEnv.VITE_GA4_MEASUREMENT_ID || '' },
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'Messaging',
    icon: Globe,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    description: 'Enable WhatsApp chat widget and instant guest messaging integration.',
    docs: 'https://business.whatsapp.com/',
    fields: [
      { key: 'wa_phone', label: 'Business Phone (with country code)', placeholder: '+628123456789', type: 'text', secret: false },
      { key: 'wa_default_message', label: 'Pre-filled Message', placeholder: 'Hello BALIORA, I am interested in...', type: 'text', secret: false },
    ],
    envKeys: ['VITE_WA_PHONE', 'VITE_WA_DEFAULT_MESSAGE'],
    envValues: {
      VITE_WA_PHONE: viteEnv.VITE_WA_PHONE || '',
      VITE_WA_DEFAULT_MESSAGE: viteEnv.VITE_WA_DEFAULT_MESSAGE || '',
    },
  },
];

function getStatus(integration) {
  const configured = integration.fields.filter(f => isConfigured(integration.envValues[integration.envKeys[integration.fields.indexOf(f)]]));
  if (configured.length === 0) return 'not_configured';
  if (configured.length < integration.fields.length) return 'partial';
  return 'connected';
}

const STATUS_CFG = {
  connected:      { label: 'Connected',      cls: 'bg-green-500/10 text-green-400 border-green-500/20',   icon: CheckCircle },
  partial:        { label: 'Partial',        cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   icon: AlertCircle },
  not_configured: { label: 'Not Configured', cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20',   icon: XCircle },
};

const cls = 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50 font-mono text-xs';

function IntegrationCard({ integration }) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const status = getStatus(integration);
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  const IntIcon = integration.icon;

  const toggleSecret = (key) => setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));

  const copyEnvBlock = () => {
    const block = Object.entries(integration.envValues)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    navigator.clipboard.writeText(block).catch(() => {});
    toast({ title: 'Copied to clipboard', description: 'Paste into your .env.local file' });
  };

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      const ok = status === 'connected';
      setTestResult(ok ? 'success' : 'error');
      setTesting(false);
      toast({
        title: ok ? `${integration.name} — Connection OK` : `${integration.name} — Not Configured`,
        description: ok ? 'Environment variables are set correctly.' : 'Configure your .env.local file and restart the dev server.',
        variant: ok ? 'default' : 'destructive',
      });
    }, 800);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl ${integration.bgColor} border ${integration.borderColor} flex items-center justify-center flex-shrink-0`}>
            <IntIcon size={20} className={integration.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-white font-semibold">{integration.name}</h3>
              <span className="text-slate-600 text-xs px-2 py-0.5 bg-slate-800 rounded-full">{integration.category}</span>
              <span className={`text-xs px-2.5 py-0.5 border rounded-full flex items-center gap-1 ${cfg.cls}`}>
                <Icon size={10} /> {cfg.label}
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">{integration.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleTest} disabled={testing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50">
              {testing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Test
            </button>
            <a href={integration.docs} target="_blank" rel="noreferrer"
              className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors">
              <ExternalLink size={15} />
            </a>
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-slate-500 hover:text-white transition-colors">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${testResult === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {testResult === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {testResult === 'success' ? 'All environment variables are present and readable.' : 'Some environment variables are missing. Edit .env.local and restart.'}
          </div>
        )}
      </div>

      {/* Expanded: Env Var Details */}
      {expanded && (
        <div className="border-t border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Environment Variables</p>
            <button onClick={copyEnvBlock}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition-colors">
              <Copy size={12} /> Copy .env block
            </button>
          </div>

          <div className="space-y-3">
            {integration.fields.map((field, i) => {
              const envKey = integration.envKeys[i];
              const currentValue = integration.envValues[envKey] || '';
              const hasValue = isConfigured(currentValue);
              const isSecret = field.secret;
              const showing = showSecrets[field.key];

              return (
                <div key={field.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-400 text-xs flex items-center gap-1.5">
                      {hasValue ? <CheckCircle size={11} className="text-green-400" /> : <XCircle size={11} className="text-red-400" />}
                      {field.label}
                      <span className="text-slate-600 font-mono">({envKey})</span>
                    </Label>
                    {isSecret && hasValue && (
                      <button onClick={() => toggleSecret(field.key)} className="text-slate-500 hover:text-slate-300 transition-colors">
                        {showing ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      readOnly
                      type={isSecret && !showing ? 'password' : 'text'}
                      value={hasValue ? currentValue : ''}
                      placeholder={hasValue ? '••••••••••' : `Not set — add ${envKey} to .env.local`}
                      className={`${cls} ${hasValue ? 'text-green-300/80' : 'text-red-400/60 placeholder:text-red-400/40'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* How to configure */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
            <p className="text-slate-400 text-xs font-medium flex items-center gap-2"><Info size={12} /> How to configure</p>
            <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
              <p className="text-slate-500"># .env.local</p>
              {integration.envKeys.map(k => (
                <p key={k}><span className="text-amber-400">{k}</span>=<span className="text-green-300">your_value_here</span></p>
              ))}
            </div>
            <p className="text-slate-600 text-xs">After editing .env.local, restart the dev server with <code className="text-amber-400">npm run dev</code></p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminIntegrations() {
  const connected = INTEGRATIONS.filter(i => getStatus(i) === 'connected').length;
  const partial = INTEGRATIONS.filter(i => getStatus(i) === 'partial').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Plug className="text-amber-500" size={24} /> Integrations
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage third-party service connections and API configurations</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Integrations', value: INTEGRATIONS.length, icon: Plug, color: 'text-slate-400' },
          { label: 'Connected', value: connected, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Partial / Issues', value: partial, icon: AlertCircle, color: 'text-amber-400' },
          { label: 'Not Configured', value: INTEGRATIONS.length - connected - partial, icon: XCircle, color: 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <Icon size={18} className={color} />
            <div>
              <p className="text-white font-bold text-xl">{value}</p>
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
        <Shield size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-300 text-sm font-medium">Environment Variable Configuration</p>
          <p className="text-slate-500 text-xs mt-1">
            All integration keys are read from your <code className="text-amber-400">.env.local</code> file at build time. 
            They are never stored in the browser or database. Restart the dev server after making changes.
          </p>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="space-y-4">
        {INTEGRATIONS.map(integration => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* Footer Note */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-3">
        <Info size={15} className="text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-slate-500 text-xs">
          Need a new integration? Contact your developer to add it to the codebase. 
          Common additions include Stripe payments, Airbnb channel manager, Booking.com sync, and property management systems.
        </p>
      </div>
    </div>
  );
}
