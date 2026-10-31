import { Moon, Sun } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { setTheme, useTheme } from '@/lib/theme'
import { cn } from '@/lib/utils'

/**
 * Switches between the light and dark theme. A toggle button, so screen readers
 * hear "Dark mode, pressed" or "not pressed". `row` is the full-width version for
 * a menu.
 */
export function ThemeToggle({ row = false, className }: { row?: boolean; className?: string }) {
  const dark = useTheme() === 'dark'
  const Icon = dark ? Sun : Moon
  return (
    <button
      type="button"
      aria-pressed={dark}
      aria-label={row ? undefined : 'Dark mode'}
      title={row ? undefined : dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className={cn(
        row
          ? 'flex h-11 w-full items-center gap-2 rounded-md px-3 text-interface font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          : cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8'),
        className,
      )}
    >
      <Icon aria-hidden className="size-4" />
      {row && 'Dark mode'}
    </button>
  )
}

/**
 * The violet pill in the app's top row. It's labeled with the theme it switches
 * to, Dark or Light, so it's a plain button rather than a pressed toggle.
 */
export function ThemePill() {
  const dark = useTheme() === 'dark'
  const Icon = dark ? Sun : Moon
  return (
    <button
      type="button"
      aria-label={dark ? 'Light mode' : 'Dark mode'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className={cn(buttonVariants({ variant: 'approve', size: 'sm' }), 'h-9 px-4')}
    >
      <Icon aria-hidden />
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}
