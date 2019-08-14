import {useProfile} from '../profile/hooks'

export function useThresholds() {
  const profile = useProfile()

  if (!profile) {
    return [0, 0, 0]
  }

  switch (profile.activity) {
    case 'trade':
      return [82800, 91000, 170000]

    case 'service':
      return [33200, 35200, 70000]

    default:
      return [0, 0, 0]
  }
}

export default {useThresholds}
