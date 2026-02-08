# [Task]: T-016
# [From]: Constitution §VI (Error Handling Standards)
# [Reference]: Constitution §VI, rest-endpoints.md §Error Responses

from fastapi import HTTPException
from typing import Optional, Dict, Any


class AppException(HTTPException):
    """Base application exception with consistent error response format

    Implements Constitution §VI error handling standards:
    - 401 Unauthorized: Missing/invalid JWT token
    - 403 Forbidden: User authenticated but lacks permission
    - 400 Bad Request: Request validation failed
    - 404 Not Found: Resource not found
    - 422 Unprocessable Entity: Request validation failed (Pydantic)
    - 500 Internal Server Error: Unhandled exception

    All responses follow standard structure:
    ```json
    {
      "detail": "User-facing error message",
      "code": "ERROR_CODE",
      "error": "Technical error details (optional)"
    }
    ```
    """

    def __init__(
        self,
        status_code: int,
        detail: str,
        code: str,
        error: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None,
    ):
        self.status_code = status_code
        self.detail = {
            "detail": detail,
            "code": code,
            "error": error or detail,
        }
        self.headers = headers or {}


class UnauthorizedError(AppException):
    """401 Unauthorized: Missing or invalid JWT token

    Use cases:
    - Missing Authorization header
    - Invalid Bearer token format
    - JWT signature verification failed
    - Token expired (exp claim < now)
    - User_id missing from JWT claims

    Frontend action: Redirect to login, clear token
    """

    def __init__(self, detail: str = "Unauthorized", error: Optional[str] = None):
        super().__init__(
            status_code=401,
            detail=detail,
            code="AUTH_FAILED",
            error=error or detail,
        )


class ForbiddenError(AppException):
    """403 Forbidden: User authenticated but lacks permission

    Use cases:
    - User attempts to update/delete task owned by different user
    - User attempts to access resource outside their tenant
    - Permission/role-based access denied

    Frontend action: Display permission error, offer support contact
    """

    def __init__(self, detail: str = "Forbidden", error: Optional[str] = None):
        super().__init__(
            status_code=403,
            detail=detail,
            code="INSUFFICIENT_PERMS",
            error=error or detail,
        )


class NotFoundError(AppException):
    """404 Not Found: Resource does not exist or user lacks access

    Use cases:
    - Task ID does not exist
    - User ID does not exist
    - User cannot access resource (treated same as non-existent for security)

    Note: For security, 404 returned regardless of whether resource exists
    or user lacks permission (prevents information leakage).

    Frontend action: Offer to create new resource or return to list
    """

    def __init__(self, detail: str = "Not Found", error: Optional[str] = None):
        super().__init__(
            status_code=404,
            detail=detail,
            code="NOT_FOUND",
            error=error or detail,
        )


class BadRequestError(AppException):
    """400 Bad Request: Request validation failed or invalid input

    Use cases:
    - Pydantic validation failed (malformed JSON, wrong types)
    - Required field missing
    - Field value out of bounds
    - Business logic validation failed

    Frontend action: Display validation errors, highlight invalid fields
    """

    def __init__(self, detail: str = "Bad Request", error: Optional[str] = None):
        super().__init__(
            status_code=400,
            detail=detail,
            code="VALIDATION_ERROR",
            error=error or detail,
        )


class ConflictError(AppException):
    """409 Conflict: Resource already exists or operation conflicts

    Use cases:
    - Email already registered (user tries to register twice)
    - Duplicate resource creation attempt
    - State conflict (e.g., cannot delete already-deleted item)

    Frontend action: Show conflict message, offer alternatives
    """

    def __init__(self, detail: str = "Conflict", error: Optional[str] = None):
        super().__init__(
            status_code=409,
            detail=detail,
            code="CONFLICT",
            error=error or detail,
        )


class ServerError(AppException):
    """500 Internal Server Error: Unhandled exception

    Use cases:
    - Unexpected exception during request processing
    - Database connection failure
    - Third-party API failure
    - Internal logic error

    Frontend action: Log error, show retry message, contact support
    """

    def __init__(self, detail: str = "Internal Server Error", error: Optional[str] = None):
        super().__init__(
            status_code=500,
            detail=detail,
            code="SERVER_ERROR",
            error=error or detail,
        )
