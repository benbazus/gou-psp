import type { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export const slideInRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 300 } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } },
}

export const scaleIn: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.15 } },
}

export const centeredScaleIn: Variants = {
  hidden: { x: '-50%', y: '-50%', scale: 0.95, opacity: 0 },
  visible: {
    x: '-50%',
    y: '-50%',
    scale: 1,
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    x: '-50%',
    y: '-50%',
    scale: 0.95,
    opacity: 0,
    transition: { duration: 0.15 },
  },
}

export const flowNode: Variants = {
  idle: { scale: 1, boxShadow: '0 0 0 0 rgba(244, 176, 0, 0)' },
  active: {
    scale: 1.05,
    boxShadow: '0 0 0 8px rgba(244, 176, 0, 0.2)',
    transition: { duration: 0.4 },
  },
  completed: {
    scale: 1,
    boxShadow: '0 0 0 0 rgba(22, 163, 74, 0)',
    transition: { duration: 0.3 },
  },
  failed: {
    scale: 1,
    boxShadow: '0 0 0 8px rgba(214, 40, 40, 0.2)',
    transition: { duration: 0.3 },
  },
}

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}
