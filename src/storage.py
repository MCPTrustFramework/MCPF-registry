from __future__ import annotations

from typing import Dict, List, Optional
from datetime import datetime, timezone

from models import (
    RegistryEntry,
    Issuer,
    RevocationStatus,
    RevokedServer,
    RevokedCredential,
)


class InMemoryStorage:
    """
    Simple in-memory storage for registry entries, issuers, and revocations.

    This is not concurrent-safe or persistent; it is intended only for
    demonstration and testing of the API and data model.
    """

    def __init__(self) -> None:
        self._servers: Dict[str, RegistryEntry] = {}
        self._issuers: List[Issuer] = []
        self._revoked_servers: List[RevokedServer] = []
        self._revoked_credentials: List[RevokedCredential] = []

    # --- MCP Servers ---

    def list_servers(self) -> List[RegistryEntry]:
        return list(self._servers.values())

    def get_server(self, did: str) -> Optional[RegistryEntry]:
        return self._servers.get(did)

    def upsert_server(self, entry: RegistryEntry) -> None:
        self._servers[entry.did] = entry

    def search_servers(
        self,
        capability: Optional[str] = None,
        tag: Optional[str] = None,
        organization: Optional[str] = None,
        country: Optional[str] = None,
    ) -> List[RegistryEntry]:
        results: List[RegistryEntry] = []
        for entry in self._servers.values():
            meta = entry.metadata

            if capability and capability not in (meta.capabilities or []):
                continue
            if tag and tag not in (meta.tags or []):
                continue
            if organization and (meta.organization or "").lower() != organization.lower():
                continue
            if country and (meta.country or "").upper() != country.upper():
                continue

            results.append(entry)

        return results

    # --- Issuers ---

    def list_issuers(self) -> List[Issuer]:
        return list(self._issuers)

    def add_issuer(self, issuer: Issuer) -> None:
        self._issuers.append(issuer)

    # --- Revocations ---

    def list_revocations(self) -> RevocationStatus:
        return RevocationStatus(
            revokedServers=list(self._revoked_servers),
            revokedCredentials=list(self._revoked_credentials),
        )

    def revoke_server(self, did: str, reason: Optional[str] = None) -> None:
        now = datetime.now(timezone.utc).isoformat()
        self._revoked_servers.append(
            RevokedServer(did=did, revokedAt=now, reason=reason)
        )

    def revoke_credential(self, cred_id: str, reason: Optional[str] = None) -> None:
        now = datetime.now(timezone.utc).isoformat()
        self._revoked_credentials.append(
            RevokedCredential(id=cred_id, revokedAt=now, reason=reason)
        )
