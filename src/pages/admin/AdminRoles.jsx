import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Crown, Shield, User, Loader2, Plus, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const ROLES = [
  {
    key: 'admin',
    label: 'Super Admin',
    desc: 'Memiliki akses penuh ke seluruh modul sistem, pengaturan, aktivitas log, dan manajemen pengguna.',
    icon: Crown,
    colorStyle: 'bg-red-500/10 text-red-400 border-red-500/20',
    permissions: [
      'Akses penuh ke semua modul',
      'Manajemen villa, booking, dan content',
      'Melihat log aktivitas audit',
      'Mengubah hak akses / role pengguna lain'
    ]
  },
  {
    key: 'villa_manager',
    label: 'Villa Manager',
    desc: 'Mengelola listing villa, ketersediaan kalender, fasilitas, galeri foto, dan pengaturan harga.',
    icon: Shield,
    colorStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    permissions: [
      'Melihat dashboard utama',
      'Membuat, mengedit, dan menghapus listing villa',
      'Mengelola harga dan kalender villa',
      'Mengunggah galeri foto villa'
    ]
  },
  {
    key: 'reservation_staff',
    label: 'Reservation Staff',
    desc: 'Menangani permintaan booking (inquiries) dari tamu dan mengelola data tamu.',
    icon: User,
    colorStyle: 'bg-green-500/10 text-green-400 border-green-500/20',
    permissions: [
      'Melihat dashboard utama',
      'Mengelola inquiry booking dari tamu',
      'Mengakses database tamu dan reservasi',
      'Menghubungi tamu via WhatsApp/Gmail prefilled'
    ]
  },
  {
    key: 'content_manager',
    label: 'Content Manager',
    desc: 'Mengelola blog, testimonial pelanggan, FAQ, dan konten statis website seperti navigasi/homepage.',
    icon: Shield,
    colorStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    permissions: [
      'Mengelola artikel blog',
      'Mengelola Frequently Asked Questions (FAQ)',
      'Mengelola ulasan/testimonial pelanggan',
      'Mengedit teks homepage, about, dan navbar'
    ]
  },
  {
    key: 'user',
    label: 'Standard User',
    desc: 'Role default dengan akses terbatas. Hanya dapat melihat profil pribadi dan info dasar di portal publik.',
    icon: User,
    colorStyle: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    permissions: [
      'Akses terbatas read-only',
      'Melihat profil pribadi',
      'Tidak dapat mengakses modul admin'
    ]
  }
];

export default function AdminRoles() {
  const [selectedRoleKey, setSelectedRoleKey] = useState('admin');
  const [userToAssign, setUserToAssign] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => localClient.entities.User.list(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => localClient.entities.User.update(userId, { role }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUserToAssign('');
      toast({
        title: 'Role Berhasil Diperbarui',
        description: `Pengguna ${updatedUser.email} sekarang memiliki role ${updatedUser.role}.`,
        className: 'bg-slate-900 border-slate-800 text-white',
      });
    },
    onError: (error) => {
      toast({
        title: 'Gagal Memperbarui Role',
        description: error.message || 'Terjadi kesalahan saat memproses permintaan.',
        variant: 'destructive',
      });
    }
  });

  const selectedRole = ROLES.find(r => r.key === selectedRoleKey) || ROLES[0];
  const members = users.filter(u => (u.role || 'user') === selectedRoleKey);
  const nonMembers = users.filter(u => (u.role || 'user') !== selectedRoleKey);

  const handleGrantRole = (e) => {
    e.preventDefault();
    if (!userToAssign) return;
    updateRoleMutation.mutate({ userId: userToAssign, role: selectedRoleKey });
  };

  const handleRevokeRole = (userId) => {
    if (confirm('Apakah Anda yakin ingin mencabut role ini? Pengguna akan dikembalikan ke role Standard User.')) {
      updateRoleMutation.mutate({ userId, role: 'user' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
        <p className="text-slate-500 text-sm mt-1">
          Kelola hak akses dan peranan anggota tim BALIORA.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Role Selection Cards */}
          <div className="space-y-3">
            <h3 className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-2">Daftar Peranan</h3>
            {ROLES.map(role => {
              const count = users.filter(u => (u.role || 'user') === role.key).length;
              const Icon = role.icon;
              const isSelected = role.key === selectedRoleKey;

              return (
                <button
                  key={role.key}
                  onClick={() => setSelectedRoleKey(role.key)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg border ${role.colorStyle}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium text-sm">{role.label}</span>
                      <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                        {count} Anggota
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 truncate">{role.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Role Details & Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detail Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              {/* Header Details */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-white font-semibold text-lg">{selectedRole.label}</h2>
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 border rounded-full ${selectedRole.colorStyle}`}>
                      <selectedRole.icon size={11} />
                      {selectedRole.key}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{selectedRole.desc}</p>
                </div>
              </div>

              {/* Permissions List */}
              <div className="space-y-3">
                <h3 className="text-white font-medium text-sm flex items-center gap-2">
                  <ShieldAlert size={16} className="text-amber-500" />
                  Hak Akses Terkait
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedRole.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300 text-sm bg-slate-800/40 border border-slate-800/60 p-2.5 rounded-lg">
                      <CheckCircle2 size={14} className="text-amber-500 flex-shrink-0" />
                      <span>{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grant/Assign Role Section (Only show if not Standard User or if we want to change user role) */}
              {selectedRole.key !== 'user' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-white font-medium text-sm flex items-center gap-2">
                    <Plus size={16} className="text-amber-500" />
                    Berikan Akses Role ini
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih pengguna untuk ditambahkan ke role <strong>{selectedRole.label}</strong>.
                  </p>
                  <form onSubmit={handleGrantRole} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Select value={userToAssign} onValueChange={setUserToAssign}>
                        <SelectTrigger className="bg-slate-900 border-slate-800 text-white w-full">
                          <SelectValue placeholder="Pilih pengguna..." />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          {nonMembers.length === 0 ? (
                            <SelectItem disabled value="_none">Tidak ada pengguna lain</SelectItem>
                          ) : (
                            nonMembers.map(u => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.full_name ? `${u.full_name} (${u.email})` : u.email} [{u.role || 'user'}]
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <button
                      type="submit"
                      disabled={!userToAssign || updateRoleMutation.isPending}
                      className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {updateRoleMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                      Berikan Akses
                    </button>
                  </form>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-3">
                <h3 className="text-white font-medium text-sm">
                  Daftar Anggota ({members.length})
                </h3>
                <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 bg-slate-950/40">
                  {members.map(member => (
                    <div key={member.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/10 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 text-amber-500 font-bold text-xs border border-slate-700">
                          {member.full_name?.[0] || member.email?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{member.full_name || '—'}</p>
                          <p className="text-slate-500 text-xs truncate">{member.email}</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      {selectedRoleKey !== 'user' ? (
                        <button
                          onClick={() => handleRevokeRole(member.id)}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
                        >
                          <Trash2 size={12} />
                          Cabut Akses
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Default Role</span>
                      )}
                    </div>
                  ))}
                  {members.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      Belum ada anggota yang terdaftar dengan role ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
