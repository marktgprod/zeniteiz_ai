from datetime import datetime, timedelta, timezone

from app.models.user import SubscriptionTier, User

TIER_RANK = {
    SubscriptionTier.FREE: 0,
    SubscriptionTier.STARTER: 1,
    SubscriptionTier.PRO: 2,
    SubscriptionTier.VIP: 3,
}


def has_active_reward(user: User) -> bool:
    if not user.reward_tier or not user.reward_expires_at:
        return False
    expires_at = user.reward_expires_at
    if expires_at.tzinfo is None:
        # SQLite (local dev only — prod Postgres columns are timezone-aware)
        # drops tzinfo on read; the values are always written in UTC.
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at > datetime.now(timezone.utc)


def get_effective_tier(user: User) -> SubscriptionTier:
    """The tier to use for request-limit gating: the higher of the user's real
    subscription and an active, unexpired reward boost (from loyalty levels,
    referrals, or any future source that grants one)."""
    if has_active_reward(user) and TIER_RANK[user.reward_tier] > TIER_RANK[user.subscription_tier]:
        return user.reward_tier
    return user.subscription_tier


def grant_tier_boost(user: User, tier: SubscriptionTier, days: int, video_credits: int = 0) -> None:
    """Stacks with any existing active boost instead of overwriting it: keeps
    the higher tier and extends the expiry from whichever is later (now, or
    the current unexpired boost). Two independent reward sources (loyalty
    levels, referrals) can both grant boosts without one clobbering the
    other's remaining time or downgrading the tier."""
    now = datetime.now(timezone.utc)
    current_expires = user.reward_expires_at
    if current_expires and current_expires.tzinfo is None:
        current_expires = current_expires.replace(tzinfo=timezone.utc)

    still_active = current_expires is not None and current_expires > now
    base = current_expires if still_active else now
    user.reward_expires_at = base + timedelta(days=days)

    if not (still_active and user.reward_tier and TIER_RANK[user.reward_tier] > TIER_RANK[tier]):
        user.reward_tier = tier

    user.reward_video_credits += video_credits
