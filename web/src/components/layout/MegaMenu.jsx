import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';

/**
 * MegaMenu - Editorial-style mega menu for category navigation.
 *
 * Layout: 4 columns
 *   - Col 1, 2, 3: Category list (grouped)
 *   - Col 4: Featured visual card with image + CTA
 */
export default function MegaMenu({
  isOpen,
  onMouseEnter,
  onMouseLeave,
  top,
  title,
  eyebrow,
  viewAllLink,
  categories = [],         // [{ title, items: [string] }]
  brands = [],             // [string]
  brandLinkPrefix = '',
  categoryLinkPrefix = '',
  featured = null,         // { image, title, subtitle, link, badge }
  secondary = null,        // { image, title, link }
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 z-40 flex justify-center"
          style={{ top }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="w-[80%] max-w-[1400px] aspect-[2/1] max-h-[60vh] bg-background/98 backdrop-blur-2xl border border-border/60 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden">
            <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-7 py-7">
              {/* Header strip */}
              <div className="flex items-end justify-between mb-6 pb-4 border-b border-border/60">
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
                    {title}
                  </h3>
                </div>
                <Link
                  to={viewAllLink}
                  className="group inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase font-bold text-white hover:text-amber-400 transition-colors"
                >
                  Xem tất cả
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Main grid: categories + featured */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Categories columns */}
                <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                  {categories.map((group, gIdx) => (
                    <div key={gIdx}>
                      <h4 className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.25em] uppercase text-amber-400 mb-4 pb-2.5 border-b-2 border-amber-400/50">
                        <span className="w-4 h-px bg-amber-500" />
                        {group.title}
                      </h4>
                      <ul className="space-y-2">
                        {group.items.map((item, idx) => (
                          <li key={idx}>
                            <Link
                              to={`${categoryLinkPrefix}${encodeURIComponent(item)}`}
                              className="group/item inline-flex items-center gap-2.5 text-[14px] font-semibold text-white/85 hover:text-white hover:translate-x-1 transition-all duration-200"
                            >
                              <span className="w-2 h-2 rounded-full bg-white/60 group-hover/item:bg-amber-400 transition-colors" />
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Featured card column */}
                {(featured || secondary) && (
                  <div className="lg:col-span-4 grid grid-cols-1 gap-4">
                    {featured && (
                      <Link
                        to={featured.link}
                        className="group relative block overflow-hidden rounded-2xl h-[260px]"
                      >
                        <img
                          src={featured.image}
                          alt={featured.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                        {featured.badge && (
                          <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-black text-[10px] tracking-wider uppercase font-bold">
                            <Sparkles className="w-3 h-3" />
                            {featured.badge}
                          </span>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                          <p className="text-[10px] tracking-[0.3em] uppercase text-amber-300 font-medium mb-1.5">
                            {featured.subtitle}
                          </p>
                          <h4 className="text-xl font-bold font-serif mb-2">
                            {featured.title}
                          </h4>
                          <span className="inline-flex items-center gap-1.5 text-[11px] tracking-wider uppercase font-semibold border-b border-amber-400 pb-0.5 text-amber-300">
                            Khám phá
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    )}

                    {secondary && (
                      <Link
                        to={secondary.link}
                        className="group relative block overflow-hidden rounded-2xl h-[120px] bg-gradient-to-br from-amber-50 to-amber-100"
                      >
                        <div className="absolute inset-0 p-5 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] tracking-[0.3em] uppercase text-amber-700 font-bold mb-1">
                              {secondary.subtitle || 'Ưu đãi'}
                            </p>
                            <h4 className="text-lg font-bold text-amber-900 font-serif leading-tight">
                              {secondary.title}
                            </h4>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center group-hover:bg-amber-400 transition-all duration-300">
                            <ArrowRight className="w-5 h-5 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
