import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 md:mb-12">
      <div className="max-w-3xl min-w-0">
        <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-[-0.03em] text-balance md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base text-muted-foreground md:text-lg">{description}</p>
        )}
      </div>
      {actions}
    </div>
  )
}
