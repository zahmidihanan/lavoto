import type { ReactNode } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

interface Props {
  children: ReactNode
  className?: string
  as?: 'div' | 'section'
}

export function ScrollReveal({ children, className = '', as: Tag = 'div' }: Props) {
  const ref = useScrollReveal<HTMLDivElement>()

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  )
}
