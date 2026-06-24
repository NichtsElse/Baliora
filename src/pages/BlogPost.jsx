/**
 * Purpose: Renders a single published journal article from the local compatibility content store.
 * Used by: /blog/:slug route.
 * Main dependencies: React Query, localClient adapter, router params, CTA section, and markdown rendering.
 * Public functions: BlogPost default export.
 * Side effects: reads published blog post records from local storage or optional Supabase sync.
 */
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowLeft, Loader2 } from 'lucide-react';
import CTASection from '../components/shared/CTASection';
import ReactMarkdown from 'react-markdown';

export default function BlogPost() {
    const { slug } = useParams();

    const { data: posts = [], isLoading } = useQuery({
        queryKey: ['blog-post', slug],
        queryFn: () => localClient.entities.BlogPost.filter({ status: 'published' }, '-published_at', 100),
    });

    const post = posts.find(p => p.slug === slug || p.id === slug);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-primary" size={28} />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                <p className="font-display text-3xl text-foreground">Article Not Found</p>
                <Link to="/blog" className="mt-6 font-body text-sm text-primary flex items-center gap-2 hover:underline">
                    <ArrowLeft size={14} /> Back to Journal
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Hero */}
            <div className="relative">
                {post.featured_image && (
                    <div className="h-72 lg:h-[480px] overflow-hidden">
                        <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    </div>
                )}
                <div className={`max-w-3xl mx-auto px-6 lg:px-8 ${post.featured_image ? 'relative -mt-32' : 'pt-24'}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link to="/blog" className="inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-primary mb-6 transition-colors">
                            <ArrowLeft size={13} /> Back to Journal
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
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
                            {post.author && (
                                <span className="font-body text-xs text-muted-foreground">By {post.author}</span>
                            )}
                        </div>
                        <h1 className="font-display text-3xl lg:text-5xl text-foreground leading-tight">
                            {post.title}
                        </h1>
                        {post.excerpt && (
                            <p className="font-body text-lg text-muted-foreground leading-relaxed mt-4">
                                {post.excerpt}
                            </p>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
                <div className="h-px bg-border mb-12" />
                <div className="prose prose-lg prose-stone max-w-none font-body prose-headings:mb-4 prose-headings:mt-8 first:prose-headings:mt-0 prose-p:mb-4 prose-p:leading-7 prose-li:mb-2 prose-ul:my-4 prose-ol:my-4 prose-ol:pl-6 prose-ul:pl-6">
                    {post.content ? (
                        <ReactMarkdown>{post.content}</ReactMarkdown>
                    ) : (
                        <p className="text-muted-foreground italic">No content available.</p>
                    )}
                </div>
                <div className="h-px bg-border mt-16 mb-8" />
                <Link to="/blog" className="inline-flex items-center gap-2 font-body text-sm text-primary hover:underline">
                    <ArrowLeft size={14} /> Back to Journal
                </Link>
            </div>

            <CTASection />
        </>
    );
}
