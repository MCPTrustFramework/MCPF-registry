from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl


class Metadata(BaseModel):
    capabilities: List[str] = Field(default_factory=list)
    organization: Optional[str] = None
    country: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    status: Optional[str] = Field(
        default="active", description="e.g. active, inactive, revoked"
    )


class RegistryEntry(BaseModel):
    did: str = Field(..., description="DID of the MCP server")
    endpoint: HttpUrl = Field(..., description="MCP endpoint URL")
    manifest: HttpUrl = Field(..., description="MCP manifest URL")
    credentials: List[HttpUrl] = Field(
        default_factory=list,
        description="URLs to MCPServerCredential verifiable credentials",
    )
    metadata: Metadata = Field(default_factory=Metadata)


class Issuer(BaseModel):
    id: str = Field(..., description="Identifier of issuer, usually a DID")
    name: str = Field(..., description="Human-readable name of the issuer")
    documentation: Optional[HttpUrl] = Field(
        default=None, description="Link to issuer documentation"
    )


class RevokedServer(BaseModel):
    did: str
    revokedAt: str
    reason: Optional[str] = None


class RevokedCredential(BaseModel):
    id: HttpUrl
    revokedAt: str
    reason: Optional[str] = None


class RevocationStatus(BaseModel):
    revokedServers: List[RevokedServer] = Field(default_factory=list)
    revokedCredentials: List[RevokedCredential] = Field(default_factory=list)


class PaginatedServers(BaseModel):
    page: int
    limit: int
    total: int
    items: List[RegistryEntry]


class SearchResults(BaseModel):
    items: List[RegistryEntry] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
