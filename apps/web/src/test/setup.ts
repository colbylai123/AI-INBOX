import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement scrolling; the router calls it on navigation.
window.scrollTo = () => {}
