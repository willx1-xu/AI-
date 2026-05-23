import { motion } from 'framer-motion'

interface TimelineItemProps {
  time: string
  text: string
  color?: string
  delay?: number
}

export default function TimelineItem({ time, text, color = '#9ca3af', delay = 0 }: TimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 py-2"
    >
      <div className="w-px h-8 rounded-full" style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }} />
      <div>
        <span className="text-xs text-gray-500 mr-2">{time}</span>
        <span className="text-sm text-gray-300">{text}</span>
      </div>
    </motion.div>
  )
}
