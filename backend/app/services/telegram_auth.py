import hashlib
import hmac
import json
from urllib.parse import parse_qsl

from app.config import settings


class InvalidInitData(Exception):
    pass


def verify_init_data(init_data: str) -> dict:
    """Verify Telegram WebApp init data signature.

    See https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    """
    parsed = dict(parse_qsl(init_data, strict_parsing=True))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise InvalidInitData("missing hash")

    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed.items()))
    secret_key = hmac.new(b"WebAppData", settings.telegram_bot_token.encode(), hashlib.sha256).digest()
    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(computed_hash, received_hash):
        raise InvalidInitData("signature mismatch")

    if "user" in parsed:
        parsed["user"] = json.loads(parsed["user"])
    return parsed
