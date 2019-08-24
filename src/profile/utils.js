export function isProfileValid(profile) {
  return (
    profile.firstName &&
    profile.lastName &&
    profile.address &&
    profile.zip &&
    profile.city &&
    profile.siret &&
    profile.apeCode &&
    profile.activity &&
    profile.declarationPeriod &&
    profile.activityStartedAt
  )
}

export default {isProfileValid}
