export type Entity = {
  entityType: string;
};

export function groupEntitiesByType<T extends Entity>(entities: T[]) {
  const result: Record<string, T[]> = {};

  for (const entity of entities) {
    (result[entity.entityType] ??= []).push(entity);
  }

  return result;
}