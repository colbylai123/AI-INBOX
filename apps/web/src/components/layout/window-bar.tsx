import { useQueryClient } from '@tanstack/react-query'
import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Lock, Minus, RotateCw, Square, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The top of the app's window: back and forward, the wordmark, and refresh. The
 * colored dots and the window controls are drawn only, so they're hidden from
 * screen readers and can't be focused.
 */
export function WindowBar() {
  const router = useRouter()
  const queryClient = useQueryClient()
  // Re-rendered on every navigation, so Back is enabled once there's a page to go back to.
  useRouterState({ select: (state) => state.location.href })
  return (
    <div className="flex h-12 items-center gap-3 px-3 sm:px-4">
      <span aria-hidden className="flex gap-2 max-sm:hidden">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
      </span>
      <span className="flex items-center">
        <BarButton
          label="Back"
          disabled={!router.history.canGoBack()}
          onClick={() => router.history.back()}
        >
          <ChevronLeft />
        </BarButton>
        <BarButton label="Forward" onClick={() => router.history.forward()}>
          <ChevronRight />
        </BarButton>
      </span>
      <Link
        to="/inbox"
        className="mx-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-metadata font-semibold tracking-[-0.01em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Lock className="size-3" aria-hidden />
        ai inbox
      </Link>
      <BarButton label="Refresh" onClick={() => void queryClient.invalidateQueries()}>
        <RotateCw />
      </BarButton>
      <span aria-hidden className="flex items-center gap-3 text-muted-foreground max-md:hidden">
        <Minus className="size-3.5" />
        <Square className="size-3" />
        <X className="size-3.5" />
      </span>
    </div>
  )
}

function BarButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
        '[&_svg]:size-4',
      )}
    >
      {children}
    </button>
  )
}
