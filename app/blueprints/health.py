from flask import Blueprint, jsonify

from app.cloudinary_store import cloudinary_ready
from app.extensions import limiter
from app.revision import APP_REVISION, APP_SERVICE
from app.schemas import HealthOut

bp = Blueprint("health", __name__)


@bp.get("/api/health")
@limiter.exempt
def health():
    body = HealthOut(
        ok=True,
        status="online",
        service=APP_SERVICE,
        revision=APP_REVISION,
        cloudinary=cloudinary_ready(),
    )
    response = jsonify(body.model_dump())
    response.headers["Cache-Control"] = "no-store, max-age=0"
    response.headers["Pragma"] = "no-cache"
    return response, 200
