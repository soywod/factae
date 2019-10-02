export function isAccountProfileValid(profile) {
  return profile.firstName && profile.lastName && profile.address && profile.zip && profile.city
}

export function isEnterpriseProfileValid(profile) {
  return (
    profile.siret &&
    profile.apeCode &&
    profile.activity &&
    profile.declarationPeriod &&
    profile.activityStartedAt
  )
}

export default {isAccountProfileValid, isEnterpriseProfileValid}
