/**
 * Purpose: Lists published journal articles from the local compatibility content store.
 * Used by: /blog route.
 * Main dependencies: React Query, localClient adapter, shared hero/CTA sections, and router links.
 * Public functions: Blog default export.
 * Side effects: reads published blog post records from local storage or optional Supabase sync.
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHero from '../components/shared/PageHero';
import CTASection from '../components/shared/CTASection';
import { Calendar, Tag, ArrowRight, Loader2 } from 'lucide-react';

export default function Blog() {
    const [category, setCategory] = useState('');

    const { data: posts = [], isLoading } = useQuery({
        queryKey: ['blog-posts'],
        queryFn: () => localClient.entities.BlogPost.filter({ status: 'published' }, '-published_at', 50),
    });

    const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];
    const filtered = category ? posts.filter(p => p.category === category) : posts;

    return (
        <>
            <PageHero
                eyebrow="Insights & Updates"
                title="The Baliora Journal"
                description="Expert perspectives on villa ownership, Bali real estate, hospitality management, and maximizing your investment."
            />

            <section className="py-20 lg:py-28 bg-background">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">

                    {/* Category filter */}
                    {categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-12">
                            <button
                                onClick={() => setCategory('')}
                                className={`px-4 py-1.5 text-xs tracking-wider border transition-colors ${!category ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-1.5 text-xs tracking-wider border transition-colors ${category === cat ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="animate-spin text-primary" size={28} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="font-display text-2xl text-foreground">No articles yet</p>
                            <p className="font-body text-muted-foreground mt-2">Check back soon for insights and updates.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map((post, idx) => (
                                <motion.article
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.07 }}
                                    className="group"
                                >
                                    <Link to={`/blog/${post.slug || post.id}`}>
                                        <div className="overflow-hidden mb-5">
                                            {post.featured_image ? (
                                                <img
                                                    src={post.featured_image}
                                                    alt={post.title}
                                                    className="w-full h-52 object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-52 bg-secondary flex items-center justify-center">
                                                    <span className="font-display text-4xl text-muted-foreground/30">B</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mb-3">
                                            {post.category && (
                                                <span className="flex items-center gap-1 font-body text-xs text-primary tracking-wider uppercase">
                                                    <Tag size={11} /> {post.category}
                                                </span>
                                            )}
                                            {post.published_at && (
                                                <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                                                    <Calendar size={11} /> {new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="font-display text-xl text-foreground leading-snug group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h2>
                                        {post.excerpt && (
                                            <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <span className="inline-flex items-center gap-1.5 font-body text-xs text-primary mt-4 group-hover:gap-2.5 transition-all">
                                            Read Article <ArrowRight size={13} />
                                        </span>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <CTASection
                title="Want to Stay Informed?"
                subtitle="Follow along as we share insights on villa management, Bali real estate, and hospitality excellence."
            />
        </>
    );
}
