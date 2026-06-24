/**
 * Purpose: Manages testimonial records used on the public site and homepage.
 * Used by: /admin/testimonials route.
 * Main dependencies: React Query, localClient adapter, and shared admin form controls.
 * Public functions: AdminTestimonials default export and TestimonialForm helper.
 * Side effects: reads, creates, updates, and deletes testimonial records in local storage or optional Supabase sync.
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Save, Star, Loader2 } from 'lucide-react';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EMPTY_FORM = {
  owner_name: '',
  country: '',
  villa_name: '',
  review: '',
  rating: 5,
  photo_url: '',
  status: 'active',
  is_featured: false,
};

function TestimonialForm({ item, onSave, onCancel }) {
  const [form, setForm] = useState(item || EMPTY_FORM);
  const fieldClassName =
    'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500';

  const updateField = (field, value) =>
    setForm((previous) => ({ ...previous, [field]: value }));

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
      <h3 className="text-white font-medium">
        {item ? 'Edit Testimonial' : 'Add Testimonial'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Owner Name *</Label>
          <Input
            required
            value={form.owner_name}
            onChange={(event) => updateField('owner_name', event.target.value)}
            placeholder="John Smith"
            className={fieldClassName}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Country</Label>
          <Input
            value={form.country}
            onChange={(event) => updateField('country', event.target.value)}
            placeholder="Australia"
            className={fieldClassName}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Villa Name</Label>
          <Input
            value={form.villa_name}
            onChange={(event) => updateField('villa_name', event.target.value)}
            placeholder="Villa Tirta"
            className={fieldClassName}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Photo Path / URL</Label>
          <Input
            value={form.photo_url}
            onChange={(event) => updateField('photo_url', event.target.value)}
            placeholder="/testimonials/photo-name.jpg"
            className={fieldClassName}
          />
          <p className="text-[11px] leading-5 text-slate-500">
            Taruh file di <span className="text-slate-300">public/testimonials/</span>, lalu isi path-nya di sini. Contoh: <span className="text-slate-300">/testimonials/villa-owner-1.jpg</span>
          </p>
          {form.photo_url && (
            <div className="pt-2">
              <img
                src={form.photo_url}
                alt=""
                className="h-24 w-24 rounded-xl object-cover border border-slate-700"
              />
            </div>
          )}
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label className="text-slate-400 text-xs">Review *</Label>
          <Textarea
            required
            value={form.review}
            onChange={(event) => updateField('review', event.target.value)}
            rows={3}
            placeholder="Write the testimonial..."
            className={fieldClassName}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Rating</Label>
          <Select
            value={String(form.rating)}
            onValueChange={(value) => updateField('rating', Number(value))}
          >
            <SelectTrigger className={fieldClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              {[5, 4, 3, 2, 1].map((rating) => (
                <SelectItem key={rating} value={String(rating)}>
                  {rating} Stars
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Status</Label>
          <Select
            value={form.status}
            onValueChange={(value) => updateField('status', value)}
          >
            <SelectTrigger className={fieldClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="is_featured"
            type="checkbox"
            checked={form.is_featured}
            onChange={(event) => updateField('is_featured', event.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <label
            htmlFor="is_featured"
            className="text-slate-400 text-sm cursor-pointer"
          >
            Featured on homepage
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave(form)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          <Save size={14} /> Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-400 hover:text-white text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function AdminTestimonials() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
     queryFn: () => localClient.entities.Testimonial.list('-created_date', 100),
  });

  const createMutation = useMutation({
     mutationFn: (data) => localClient.entities.Testimonial.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
     mutationFn: ({ id, data }) => localClient.entities.Testimonial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
     mutationFn: (id) => localClient.entities.Testimonial.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] }),
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonials</h1>
          <p className="text-slate-500 text-sm mt-1">
            {testimonials.length} reviews
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {showForm && !editing && (
        <TestimonialForm
          onSave={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id}>
              {editing?.id === testimonial.id ? (
                <TestimonialForm
                  item={editing}
                  onSave={(data) =>
                    updateMutation.mutate({ id: testimonial.id, data })
                  }
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {testimonial.photo_url ? (
                        <img
                          src={testimonial.photo_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                          <span className="text-amber-400 font-bold">
                            {testimonial.owner_name?.[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium text-sm">
                          {testimonial.owner_name}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {testimonial.country}
                          {testimonial.villa_name
                            ? ` · ${testimonial.villa_name}`
                            : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {testimonial.is_featured && (
                        <span className="text-xs bg-amber-600/20 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 border rounded-full ${
                          testimonial.status === 'active'
                            ? 'text-green-400 border-green-500/20 bg-green-500/10'
                            : 'text-slate-500 border-slate-600 bg-slate-800'
                        }`}
                      >
                        {testimonial.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={12}
                        className={
                          index < (testimonial.rating || 5)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }
                      />
                    ))}
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-3">
                    {testimonial.review}
                  </p>
                  <div className="flex gap-1 mt-3 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setEditing(testimonial)}
                      className="p-1.5 text-slate-500 hover:text-amber-400"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete?')) {
                          deleteMutation.mutate(testimonial.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {testimonials.length === 0 && (
            <div className="col-span-2 text-center py-16 text-slate-500">
              No testimonials yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
