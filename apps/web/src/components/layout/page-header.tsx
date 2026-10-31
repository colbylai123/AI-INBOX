import type { ReactNode } from 'react'
import { usePageTitle } from '@/lib/use-page-title'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  usePageTitle(title)
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-3xl min-w-0">
        <h1 className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance md:text-[1.75rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {actions}
    </div>
  )
}
