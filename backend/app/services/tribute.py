import hashlib
import hmac

from app.config import settings


def verify_webhook_signature(raw_body: bytes, signature: str) -> bool:
    expected = hmac.new(settings.tribute_webhook_secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
