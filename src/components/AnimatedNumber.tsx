import { useEffect, useRef, useState } from 'react'
import { motion, animate } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  decimals?: number
  suffix?: string
  className?: string
  duration?: number
}

export default function AnimatedNumber({ value, decimals = 1, suffix = '', className = '', duration = 0.8 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)
  const prevValue = useRef(value)

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    })
    prevValue.current = value
    return () => controls.stop()
  }, [value, duration])

  return (
    <motion.span
      key={value}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {display.toFixed(decimals)}{suffix}
    </motion.span>
  )
}
