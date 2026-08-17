// Mirrors Config.Pricing.SERVICE_FEE_ENABLED in ndotoniBackend (packages/lambda/src/config/index.ts).
// The backend is the source of truth for what's actually charged — this only controls
// what these two client-side estimates *display* before a booking is created, so keep
// it in sync when the backend flag is flipped off.
export const SERVICE_FEE_ENABLED = true;
