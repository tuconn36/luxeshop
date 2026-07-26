import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * SectionHeader - Editorial-style header for product collection sections.
 * Used throughout HomePage and listing pages for visual consistency.
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  highlight,
  align = 'left',
  link,
  linkText = 'Xem tất cả',
}) {
  const justifyClass = align === 'center' ? 'items-center text-center' : 'items-end';
  const wrapperClass = align === 'center'
    ? 'flex-col text-center max-w-2xl mx-auto'
    : 'flex-col sm:flex-row';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`flex ${wrapperClass} ${justifyClass} justify-between mb-12 gap-6`}
    >
      <div className={align === 'center' ? '' : 'flex-1'}>
        {eyebrow && (
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-10 h-px bg-amber-500" />
            <span className="text-amber-600 font-semibold tracking-[0.4em] uppercase text-xs">
              {eyebrow}
            </span>
          </div>
        )}
        <h2
          className="text-4xl md:text-5xl font-bold mb-3 font-serif"
          style={{ letterSpacing: '-0.02em', lineHeight: '1' }}
        >
          {title}
          {highlight && (
            <>
              {' '}
              <span className="italic font-light text-amber-600">{highlight}</span>
            </>
          )}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {link && (
        <Link
          to={link}
          className="group inline-flex items-center gap-2 text-sm font-medium tracking-wider uppercase text-foreground hover:text-amber-600 transition-colors whitespace-nowrap"
        >
          {linkText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </motion.div>
  );
}
