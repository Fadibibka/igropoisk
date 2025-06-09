from typing import Dict, Any, List, Optional
from src.models.models import Game


def explain_game_recommendation(
    game: Game,
    cf_score: Optional[float] = None,
    cb_score: Optional[float] = None,
    final_score: Optional[float] = None,
    matched_genres: Optional[List[str]] = None,
    matched_developer: Optional[str] = None
) -> Dict[str, Any]:
    """
    Генерирует объяснение, почему игра оказалась в рекомендациях.
    """

    explanation = {
        "game_id": game.game_id,
        "title": game.title,
        "final_score": round(final_score or 0.0, 4),
        "components": {},
        "priority_bonuses": [],
        "why_recommended": [],
        "materials": []  # ← добавляем поле
    }

    # CF объяснение
    if cf_score is not None:
        explanation["components"]["CF"] = round(cf_score, 4)
        explanation["why_recommended"].append(
            "Похожа на выбор пользователей со схожими вкусами"
        )

    # CB объяснение
    cb_reasons = []
    if cb_score is not None:
        explanation["components"]["CB"] = round(cb_score, 4)

    if matched_genres:
        cb_reasons.append(f" {', '.join(matched_genres)}")

    if matched_developer:
        cb_reasons.append(f"разработчик — {matched_developer}")

    if cb_reasons:
        explanation["why_recommended"].append("Cовпадение жанров:" + "; ".join(cb_reasons))

    # Добавляем материалы (если есть)
    if hasattr(game, "materials"):
        explanation["materials"] = [
            {
                "material_url": m.material_url,
                "material_type": m.material_type
            }
            for m in game.materials  # можно оставить только скриншоты
        ]

    return explanation
