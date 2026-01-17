// Alignment format from ElevenLabs SDK (camelCase)
export interface ElevenLabsAlignment {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
}

// Legacy alignment format (snake_case) - for backward compatibility
export interface LegacyAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface Block {
  uuid: string;
  type: string;
  properties?: {
    text?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface BlockSegment {
  blockId: string;
  text: string;
  charStart: number;
  charEnd: number;
}

export interface TimestampMapping {
  blockId: string;
  startTimeMs: number;
  endTimeMs: number;
  characterStart: number;
  characterEnd: number;
}

/**
 * Builds concatenated text from blocks while tracking character positions
 * for each block.
 */
export function buildSectionText(blocks: Block[]): {
  text: string;
  segments: BlockSegment[];
} {
  const segments: BlockSegment[] = [];
  let currentPosition = 0;
  const textParts: string[] = [];

  for (const block of blocks) {
    // Only process text blocks
    if (block.type !== 'text') continue;

    const text = block.properties?.text || '';
    if (!text.trim()) continue;

    // Clean and normalize the text
    const cleanedText = text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    if (!cleanedText) continue;

    segments.push({
      blockId: block.uuid,
      text: cleanedText,
      charStart: currentPosition,
      charEnd: currentPosition + cleanedText.length,
    });

    textParts.push(cleanedText);
    currentPosition += cleanedText.length + 1; // +1 for space between blocks
  }

  // Join with single space between blocks
  const combinedText = textParts.join(' ');

  return {
    text: combinedText,
    segments,
  };
}

/**
 * Maps ElevenLabs character-level alignment data back to block boundaries.
 * Returns timing information for each block.
 * Supports both SDK format (camelCase) and legacy format (snake_case).
 */
export function mapAlignmentToBlocks(
  segments: BlockSegment[],
  alignment: ElevenLabsAlignment | LegacyAlignment
): TimestampMapping[] {
  const mappings: TimestampMapping[] = [];

  if (!alignment.characters || alignment.characters.length === 0) {
    return mappings;
  }

  // Normalize to support both SDK (camelCase) and legacy (snake_case) formats
  const startTimes = 'characterStartTimesSeconds' in alignment
    ? alignment.characterStartTimesSeconds
    : alignment.character_start_times_seconds;
  const endTimes = 'characterEndTimesSeconds' in alignment
    ? alignment.characterEndTimesSeconds
    : alignment.character_end_times_seconds;

  for (const segment of segments) {
    // Find character indices that fall within this segment's range
    // The alignment arrays are indexed by character position in the text
    const startCharIndex = segment.charStart;
    const endCharIndex = segment.charEnd;

    // Find the first character's start time within this segment
    let startTimeMs = -1;
    let endTimeMs = -1;

    // Search for valid timestamps within the segment range
    for (let i = startCharIndex; i < endCharIndex && i < startTimes.length; i++) {
      const startTime = startTimes[i];
      const endTime = endTimes[i];

      if (startTime !== undefined && startTime !== null) {
        if (startTimeMs === -1) {
          startTimeMs = Math.floor(startTime * 1000);
        }
      }

      if (endTime !== undefined && endTime !== null) {
        endTimeMs = Math.floor(endTime * 1000);
      }
    }

    // Only add mapping if we found valid timestamps
    if (startTimeMs !== -1 && endTimeMs !== -1) {
      mappings.push({
        blockId: segment.blockId,
        startTimeMs,
        endTimeMs,
        characterStart: segment.charStart,
        characterEnd: segment.charEnd,
      });
    }
  }

  return mappings;
}

/**
 * Finds the block ID that corresponds to a given playback position.
 * Used during audio playback to determine which block is being played.
 */
export function findBlockAtPosition(
  mappings: TimestampMapping[],
  positionMs: number
): string | null {
  for (const mapping of mappings) {
    if (positionMs >= mapping.startTimeMs && positionMs < mapping.endTimeMs) {
      return mapping.blockId;
    }
  }
  return null;
}

/**
 * Gets all blocks that have been played up to a given position.
 * Useful for reporting which blocks have been consumed during playback.
 */
export function getPlayedBlocks(
  mappings: TimestampMapping[],
  positionMs: number
): string[] {
  return mappings
    .filter(mapping => positionMs >= mapping.startTimeMs)
    .map(mapping => mapping.blockId);
}

/**
 * Validates that timestamp mappings are consistent (no overlaps, ordered correctly).
 */
export function validateMappings(mappings: TimestampMapping[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (let i = 0; i < mappings.length; i++) {
    const current = mappings[i];

    // Check for valid time range
    if (current.startTimeMs >= current.endTimeMs) {
      errors.push(`Block ${current.blockId}: start time >= end time`);
    }

    // Check for overlaps with next mapping
    if (i < mappings.length - 1) {
      const next = mappings[i + 1];
      if (current.endTimeMs > next.startTimeMs) {
        errors.push(
          `Overlap between blocks ${current.blockId} and ${next.blockId}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
