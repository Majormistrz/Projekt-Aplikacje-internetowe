from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

CLIENT_ID = "454536949951-fbdfflqh9s0fuf86kglmoduaa67g54rj.apps.googleusercontent.com"

def verify_google_token(token: str):
    """Weryfikuje token Google i zwraca dane użytkownika lub None."""
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            CLIENT_ID,
            clock_skew_in_seconds=5
        )
        return idinfo
    except Exception:
        return None
