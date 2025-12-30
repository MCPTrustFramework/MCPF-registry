from pydantic import BaseModel
import os


class Settings(BaseModel):
    registry_name: str = "MCP Trust Registry (Reference Implementation)"
    base_url: str = "http://localhost:8080"

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            registry_name=os.getenv("REGISTRY_NAME", cls.__fields__["registry_name"].default),
            base_url=os.getenv("REGISTRY_BASE_URL", cls.__fields__["base_url"].default),
        )


settings = Settings.from_env()
