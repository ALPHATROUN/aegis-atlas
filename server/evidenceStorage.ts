import { createHash } from "node:crypto";
import { storagePut } from "./storage";

export type EvidenceStorageMetadata = {
  storageKey: string;
  storageUrl: string;
  originalName: string;
  mediaType: string;
  byteSize: number;
  sha256: string;
  classification: "synthetic" | "internal" | "confidential" | "restricted";
  sourceMetadata: Record<string, string>;
};

/**
 * Stores evidence bytes in object storage and returns only the reference metadata
 * intended for the evidenceArtifacts database table. File bytes never enter a DB row.
 */
export async function storeEvidenceArtifact(input: {
  engagementCode: string;
  originalName: string;
  mediaType: string;
  bytes: Buffer;
  classification: EvidenceStorageMetadata["classification"];
  sourceMetadata: Record<string, string>;
}): Promise<EvidenceStorageMetadata> {
  const safeName = input.originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const prefix = `engagements/${input.engagementCode}/evidence/${Date.now()}-${safeName}`;
  const { key, url } = await storagePut(prefix, input.bytes, input.mediaType);
  return {
    storageKey: key,
    storageUrl: url,
    originalName: input.originalName,
    mediaType: input.mediaType,
    byteSize: input.bytes.byteLength,
    sha256: createHash("sha256").update(input.bytes).digest("hex"),
    classification: input.classification,
    sourceMetadata: input.sourceMetadata,
  };
}
