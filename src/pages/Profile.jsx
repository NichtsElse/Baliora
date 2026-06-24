/**
 * Purpose: Lets authenticated users update their own profile details and sign out.
 * Used by: /profile route and the public navigation account menu.
 * Main dependencies: localClient auth updateProfile, AuthContext session state, and shared form UI.
 * Public functions: Profile default export.
 * Side effects: updates the local user record in browser storage and can clear the session on logout.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { localClient } from '@/api/localClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserCircle2, LogOut, Save } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setFullName(user?.full_name || '');
    setEmail(user?.email || '');
    setContactNumber(user?.contact_number || '');
  }, [user]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const updatedUser = await localClient.auth.updateProfile({
        full_name: fullName,
        email,
        contact_number: contactNumber,
      });
      setFullName(updatedUser.full_name || '');
      setEmail(updatedUser.email || '');
      setContactNumber(updatedUser.contact_number || '');
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout(false);
    navigate('/login');
  };

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-background px-6 py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[28px] border border-border bg-card p-6 lg:p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserCircle2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">My Profile</p>
              <h1 className="mt-1 text-3xl font-display text-foreground">Account Information</h1>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-8 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+62 812-3456-7890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Account Info</Label>
              <div className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground">
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Account Status
                </span>
                <p className="mt-1 font-medium">Active</p>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" className="rounded-full px-6" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-6"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
