import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// The design system's own sizes and shadow (globals.css). Without this, tailwind-merge
// reads `text-label` as a color and drops it when a color class follows.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['interface', 'metadata', 'label'],
      shadow: ['panel'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
