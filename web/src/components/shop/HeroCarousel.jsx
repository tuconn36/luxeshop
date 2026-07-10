import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1656042744506-1d3c6e2b013e?w=1920&h=1080&fit=crop',
    label: 'Bộ sưu tập 2026',
    title: 'Định nghĩa phong cách',
    titleAccent: 'của riêng bạn',
    description: 'Khám phá bộ sưu tập thời trang cao cấp, nơi tinh hoa gặp gỡ đương đại',
    cta: 'Khám phá ngay',
    ctaLink: '/products',
    bgGradient: 'from-amber-900/40 via-transparent to-transparent'
  },
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop',
    label: 'Thời trang Nam',
    title: 'Phong cách',
    titleAccent: '& Đẳng cấp',
    description: 'Thiết kế lịch lãm dành cho phái mạnh tự tin, khẳng định bản lĩnh',
    cta: 'Bộ sưu tập Nam',
    ctaLink: '/men',
    bgGradient: 'from-blue-900/50 via-transparent to-transparent'
  },
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=1080&fit=crop',
    label: 'Thời trang Nữ',
    title: 'Thanh lịch',
    titleAccent: '& Quyến rũ',
    description: 'Bộ sưu tập đầy cá tính, tôn vinh vẻ đẹp nữ tính hiện đại',
    cta: 'Bộ sưu tập Nữ',
    ctaLink: '/women',
    bgGradient: 'from-rose-900/50 via-transparent to-transparent'
  }
]

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const SLIDE_DURATION = 5000

  useEffect(() => {
    if (isPaused) return

    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, SLIDE_DURATION)

    return () => clearInterval(slideInterval)
  }, [isPaused])

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const slide = slides[currentSlide]

  return (
    <section
      className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden bg-black -mt-[112px] pt-[112px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background slides with Ken Burns effect */}
      <div className="absolute inset-0">
        {slides.map((s, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: index === currentSlide ? 1 : 0,
              scale: index === currentSlide ? 1 : 1.1
            }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={s.image}
              alt={s.title}
              className={`w-full h-full object-cover ${index === currentSlide ? 'animate-ken-burns' : ''}`}
            />
          </motion.div>
        ))}
        
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient}`} />
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Floating decorative shapes */}
      <motion.div
        className="absolute top-1/3 right-20 w-2 h-2 bg-white/30 rounded-full"
        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/2 right-32 w-3 h-3 bg-white/20 rounded-full"
        animate={{ y: [0, 15, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-1/3 right-48 w-2 h-2 bg-primary/40 rounded-full"
        animate={{ y: [0, -10, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Label */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-12 h-[1px] bg-primary" />
                <span className="text-primary font-medium tracking-[0.3em] uppercase text-sm">
                  {slide.label}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[0.95]"
              >
                <span className="block">{slide.title}</span>
                <span className="block bg-gradient-to-r from-primary via-amber-300 to-primary bg-clip-text text-transparent">
                  {slide.titleAccent}
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg sm:text-xl text-white/60 mb-10 max-w-lg leading-relaxed"
              >
                {slide.description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap items-center gap-5"
              >
                <Link to={slide.ctaLink} className="group">
                  <button className="relative px-8 py-4 bg-primary text-black font-semibold rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105">
                    <span className="relative z-10 flex items-center gap-2">
                      {slide.cta}
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </Link>
                
                <Link to="/new-arrivals" className="group flex items-center gap-3 text-white/80 hover:text-white transition-colors">
                  <span className="text-sm font-medium tracking-wide">Hàng mới về</span>
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex gap-12 mt-16 pt-8 border-t border-white/10"
              >
                <div>
                  <p className="text-3xl font-bold text-white">500+</p>
                  <p className="text-sm text-white/40 mt-1">Sản phẩm</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">10K+</p>
                  <p className="text-sm text-white/40 mt-1">Khách hàng</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">50+</p>
                  <p className="text-sm text-white/40 mt-1">Thương hiệu</p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right side decorative */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            <div className="w-80 h-80 rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border border-white/5 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center">
                  <span className="text-6xl font-serif text-white/20">L</span>
                </div>
              </div>
            </div>
            {/* Decorative lines */}
            <motion.div
              className="absolute -left-20 top-1/2 w-20 h-[1px] bg-gradient-to-r from-transparent to-primary/50"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </div>

      {/* Navigation arrows */}
      <motion.button
        onClick={goToPrevious}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white transition-all duration-300 hover:scale-110 hover:border-primary/50 group"
        aria-label="Slide trước"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      </motion.button>

      <motion.button
        onClick={goToNext}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white transition-all duration-300 hover:scale-110 hover:border-primary/50 group"
        aria-label="Slide tiếp"
      >
        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </motion.button>

      {/* Bottom navigation with dots */}
      <div className="absolute bottom-8 left-4 sm:left-8 right-4 sm:right-8 z-20">
        <div className="flex items-center justify-between">
          {/* Slide indicators */}
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`relative h-1 rounded-full transition-all duration-500 ${
                  index === currentSlide ? 'w-12 bg-primary' : 'w-6 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Slide ${index + 1}`}
              >
                {index === currentSlide && (
                  <motion.div
                    className="absolute inset-0 bg-primary rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
                    key={`progress-${currentSlide}`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Slide counter */}
          <div className="flex items-center gap-2 text-white/40">
            <span className="font-mono text-sm">
              <span className="text-white font-semibold">{String(currentSlide + 1).padStart(2, '0')}</span>
              <span className="mx-1">/</span>
              <span>{String(slides.length).padStart(2, '0')}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
