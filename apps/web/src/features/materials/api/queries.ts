import { queryOptions } from '@tanstack/react-query'
import { getMaterials } from './materials-api'

export const materialsKeys = {
  all: ['materials'] as const,
  list: () => [...materialsKeys.all, 'list'] as const,
  /** Mutation key for removals, so every in-flight one can be found. */
  remove: () => [...materialsKeys.all, 'remove'] as const,
}

export const materialsQuery = () =>
  queryOptions({ queryKey: materialsKeys.list(), queryFn: getMaterials })
