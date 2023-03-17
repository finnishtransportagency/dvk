import { detailedDiff } from 'deep-object-diff';

function replacer(key: string, value: object) {
  if (value === undefined) {
    return null;
  }
  return value;
}

export function diff(originalObject: object, updatedObject: object) {
  const changes = detailedDiff(originalObject, updatedObject);
  // convert undefined to null since otherwise omitted from audit log
  const json = JSON.stringify(changes, replacer);
  return JSON.parse(json);
}
