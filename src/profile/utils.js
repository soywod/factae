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
    ((!profile.taxId && !profile.taxRate) || (profile.taxId && profile.taxRate))
  )
}

export default {isProfileValid}
