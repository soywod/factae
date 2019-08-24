import {DateTime} from 'luxon'

import {useProfile} from '../profile/hooks'

export function useThresholds() {
  const profile = useProfile()

  if (!profile) {
    return [0, 0, 0]
  }

  let ratio = 1
  const now = DateTime.local()
  const activityStartedAt = DateTime.fromISO(profile.activityStartedAt)

  if (activityStartedAt.isValid && activityStartedAt.year === now.year) {
    const firstDayOfYear = now.set({
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })

    const lastDayOfYear = firstDayOfYear
      .plus({year: 1})
      .minus({day: 1})
      .set({hour: 23, minute: 59, second: 59, millisecond: 999})

    const yearDiff = lastDayOfYear - firstDayOfYear
    const activityDiff = activityStartedAt - firstDayOfYear

    ratio = activityDiff / yearDiff
  }

  switch (profile.activity) {
    case 'trade':
      return [82800, 91000, 170000].map(x => x * ratio)

    case 'service':
      return [33200, 35200, 70000].map(x => x * ratio)

    default:
      return [0, 0, 0]
  }
}

export default {useThresholds}
