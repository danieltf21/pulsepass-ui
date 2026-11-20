import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { afterAll, beforeAll } from 'vitest'
import { server } from './mocks/server'
import { limpiarAvisos } from '../lib/avisos'

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))

afterEach(() => {
  limpiarAvisos()
  server.resetHandlers()
  cleanup()
})

afterAll(() => server.close())
