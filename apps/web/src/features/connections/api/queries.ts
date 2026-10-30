import { queryOptions } from '@tanstack/react-query'
import { getConnections } from './connections-api'

export const connectionsKeys = {
  all: ['connections'] as const,
}

export const connectionsQuery = () =>
  queryOptions({ queryKey: connectionsKeys.all, queryFn: getConnections })
