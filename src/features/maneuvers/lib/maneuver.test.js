import { describe, expect, it } from 'vitest'
import {
  filterManeuvers,
  maneuverStatusBucket,
  parseEvents,
  parseProgress,
  sortByDispatchDate,
  summarizeManeuvers,
  timelineProgress,
} from './maneuver'
import { isSafeGpsLink } from './gps'
import { isValidKeyFormat } from '@/features/auth/keyFormat'

describe('parseEvents', () => {
  it('agrupa de 4 en 4 y deja el evento más reciente primero', () => {
    const raw = ['t1', 'A', 'EN PROCESO', '10', 't2', 'B', 'EN TERMINAL', '60']
    expect(parseEvents(raw)[0]).toEqual({ time: 't2', location: 'B', status: 'EN TERMINAL', percentage: '60' })
  })
  it('devuelve [] con entrada vacía', () => {
    expect(parseEvents(undefined)).toEqual([])
  })
})

describe('estatus y progreso', () => {
  it('clasifica estatus en cubetas', () => {
    expect(maneuverStatusBucket('CANCELADO')).toBe('cancelled')
    expect(maneuverStatusBucket('SIN INICIAR')).toBe('pending')
    expect(maneuverStatusBucket('EN TRÁNSITO')).toBe('started')
  })
  it('cuenta por cubeta', () => {
    const list = [{ man_current_status: 'CANCELADO' }, { man_current_status: 'EN PROCESO' }, {}]
    expect(summarizeManeuvers(list)).toEqual({ started: 1, pending: 1, cancelled: 1 })
  })
  it('acota el progreso a 0-100', () => {
    expect(parseProgress('150')).toBe(100)
    expect(parseProgress('abc')).toBe(0)
  })
  it('cancelada siempre marca 0 %', () => {
    expect(timelineProgress({ man_current_status: 'CANCELADO', man_progress: '80' })).toBe(0)
  })
})

describe('filtros y orden', () => {
  const list = [
    { man_id: 1, man_dispatch_date: '2026-01-02', man_transporter: 'ACME', man_containers: [{ container_id: 'ABCD1' }] },
    { man_id: 2, man_dispatch_date: 'PENDIENTE', man_transporter: 'Zeta', man_containers: [] },
    { man_id: 3, man_dispatch_date: '2026-03-01', man_transporter: 'Zeta', man_containers: [{ container_id: 'XYZ9' }] },
  ]
  it('filtra por ID parcial, transportista o "sin contenedores"', () => {
    const f = (q) => filterManeuvers(list, { dispatchDate: '', containerIds: [], containerQuery: q }).map((m) => m.man_id)
    expect(f('abc')).toEqual([1])
    expect(f('zeta')).toEqual([2, 3])
    expect(f('sin')).toEqual([2])
  })
  it('filtra por cubeta de estatus', () => {
    const withStatus = [
      { man_id: 1, man_current_status: 'EN PROCESO' },
      { man_id: 2, man_current_status: 'CANCELADO' },
    ]
    const ids = (status) => filterManeuvers(withStatus, { status }).map((m) => m.man_id)
    expect(ids('cancelled')).toEqual([2])
    expect(ids('')).toEqual([1, 2])
  })
  it('manda las fechas no válidas al final en ambas direcciones', () => {
    expect(sortByDispatchDate(list, 'asc').map((m) => m.man_id)).toEqual([1, 3, 2])
    expect(sortByDispatchDate(list, 'desc').map((m) => m.man_id)).toEqual([3, 1, 2])
  })
})

describe('seguridad de entradas', () => {
  it('rechaza llaves con operadores o símbolos', () => {
    expect(isValidKeyFormat('abc-123_X')).toBe(true)
    expect(isValidKeyFormat('{"$ne":""}')).toBe(false)
    expect(isValidKeyFormat('abc')).toBe(false)
    expect(isValidKeyFormat(null)).toBe(false)
  })
  it('solo acepta enlaces GPS http(s)', () => {
    expect(isSafeGpsLink('https://x.com/map.png')).toBe(true)
    expect(isSafeGpsLink('javascript:alert(1)')).toBe(false)
    expect(isSafeGpsLink('data:text/html,<script>')).toBe(false)
    expect(isSafeGpsLink('PENDIENTE')).toBe(false)
  })
})
