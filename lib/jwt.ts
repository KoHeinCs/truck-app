type JwtPayload = Record<string, unknown>;

function decodeJwtPayload(token: string): JwtPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;

        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            "=",
        );
        const json = atob(padded);
        const payload = JSON.parse(json);

        return payload && typeof payload === "object" ? payload : null;
    } catch {
        return null;
    }
}

function readStringClaim(payload: JwtPayload, keys: string[]): string | null {
    for (const key of keys) {
        const value = payload[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return null;
}


export function parseTokenDetails(token: string) {
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    return {
        userId: readStringClaim(payload, ["user_id", "userId", "sub"]),
        parentOwnerId: readStringClaim(payload, ["parentOwnerId", "parent_owner_id"])
    };
}


