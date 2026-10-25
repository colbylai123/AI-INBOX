// Small artificial latency so loading states are visible while running on mocks.
export const mockDelay = (ms = 250) =>
  new Promise<void>((resolve) => setTimeout(resolve, import.meta.env.MODE === 'test' ? 0 : ms))
