/**
 * The 3D character, if there is one. Files live in /public/models; paths here
 * are relative to that folder. A clip can name an animation inside a file, as
 * "file.glb#ClipName", otherwise the file's first animation is used.
 *
 * Only `idle` and `walk` are required. Without `sit` he lowers behind the desk
 * in his idle pose; without `typing` he idles once seated. While this is null
 * the drawn character is used.
 */
export type CharacterModel = {
  character: string;
  clips: { idle: string; walk: string; sit?: string; typing?: string };
};

export const CHARACTER_MODEL: CharacterModel | null = null;
