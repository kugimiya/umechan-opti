export const getFeatureFlags = () => ({
  IS_MODERKA_ENABLED: process.env.NEXT_PUBLIC_FEATURE_FLAG_MODERKA === 'TRUE'
})
