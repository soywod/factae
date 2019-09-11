import {DateTime} from 'luxon'

export function isDemo(profile) {
  if (!profile) return false
  return profile.email === 'demo@factae.fr'
}

export const demoDate = DateTime.fromISO('2018-09-01')
