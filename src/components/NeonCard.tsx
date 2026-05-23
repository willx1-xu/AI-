import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface NeonCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'green' | 'orange' | 'blue' | 'purple' | 'white'
  onClick?: () => void
  delay?: number
}

const glowMap = {
  green: 'neon-glow-green',
  orange: 'neon-glow-orange',
  blue: 'neon-glow-blue',
  purple: 'neon-glow-purple',
  white: 'neon-glow-white',
}

export default function NeonCard({ children, className = '', glowColor, onClick, delay = 0 }: NeonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      onClick={onClick}
      className={`glass-card p-4 ${glowColor ? glowMap[glowColor] : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
