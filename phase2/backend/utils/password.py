# [Task]: T-017
# [From]: authentication.md §FR-002, Constitution §VI (No hardcoded secrets)
# [Reference]: FR-002 (MUST verify credentials using secure password hashing), FR-011 (secure hashing)

import bcrypt
from typing import Tuple


def hash_password(plaintext: str) -> str:
    """Hash a plaintext password using bcrypt

    Principles:
    - Uses bcrypt with salt (never store plaintext passwords)
    - Output: 60-character bcrypt hash
    - Intended use: Store in users.password_hash field

    Security:
    - bcrypt automatically generates unique salt per hash
    - Cost factor: Default 12 (configurable, higher = slower)
    - Resistant to rainbow tables and dictionary attacks
    - Timing-safe comparison (handled by verify_password)

    Args:
        plaintext: Raw password string (from registration/password reset)

    Returns:
        bcrypt hash string (60 chars)

    Example:
    ```python
    hash = hash_password("correct_horse_battery_staple")
    # Returns: '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUe'
    ```
    """
    # Generate salt and hash password
    # bcrypt.gensalt() creates a random salt with default cost factor 12
    # bcrypt.hashpw() combines salt + hashing
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(plaintext.encode("utf-8"), salt)

    # Return hash as string (decoded from bytes)
    return hashed.decode("utf-8")


def verify_password(plaintext: str, hashed: str) -> bool:
    """Verify plaintext password against bcrypt hash

    Principles:
    - Performs timing-safe comparison (resistant to timing attacks)
    - Returns True only if plaintext + hash match
    - Used during login to verify credentials

    Security:
    - bcrypt.checkpw() is timing-safe (constant time)
    - Prevents attackers from learning password via response time
    - Always returns False if hash is invalid

    Args:
        plaintext: Raw password string (from login form)
        hashed: Stored bcrypt hash (from users.password_hash)

    Returns:
        bool: True if password matches hash, False otherwise

    Example:
    ```python
    stored_hash = "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUe"
    is_valid = verify_password("correct_horse_battery_staple", stored_hash)  # True
    is_invalid = verify_password("wrong_password", stored_hash)  # False
    ```
    """
    try:
        # bcrypt.checkpw() performs timing-safe comparison
        return bcrypt.checkpw(plaintext.encode("utf-8"), hashed.encode("utf-8"))
    except (TypeError, ValueError):
        # Handle invalid hash format
        return False
