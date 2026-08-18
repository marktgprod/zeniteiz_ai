from app.models.user import SubscriptionTier

REQUEST_LIMITS: dict[SubscriptionTier, int] = {
    SubscriptionTier.FREE: 0,
    SubscriptionTier.STARTER: 50,
    SubscriptionTier.PRO: 100,
    SubscriptionTier.VIP: 5000,
}
