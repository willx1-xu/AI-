import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface NeonButtonProps {
  children: ReactNode
  onClick?: () => void
  color?: 'green' | 'orange' | 'blue' | 'purple'
  variant?: 'filled' | 'ghost'
  className?: string
  disabled?: boolean
  fullWidth?: boolean
}

const colorMap = {
  green: { bg: 'bg-[#00ff88]', text: 'text-black', ghost: 'text-[#00ff88] border-[#00ff88]/30' },
  orange: { bg: 'bg-[#ff6b35]', text: 'text-black', ghost: 'text-[#ff6b35] border-[#ff6b35]/30' },
  blue: { bg: 'bg-[#00d4ff]', text: 'text-black', ghost: 'text-[#00d4ff] border-[#00d4ff]/30' },
  purple: { bg: 'bg-[#a855f7]', text: 'text-black', ghost: 'text-[#a855f7] border-[#a855f7]/30' },
}

export default function NeonButton({ children, onClick, color = 'green', variant = 'filled', className = '', disabled, fullWidth }: NeonButtonProps) {
  const c = colorMap[color]
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variant === 'filled' ? `${c.bg} ${c.text}` : `bg-transparent ${c.ghost} border`}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-30' : ''}
        px-4 py-2.5 rounded-xl font-semibold text-sm transition-opacity
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
