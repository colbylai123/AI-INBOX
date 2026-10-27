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
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
      <div className="max-w-3xl">
        <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-balance md:text-5xl">
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
