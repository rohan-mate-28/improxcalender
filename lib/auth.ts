import "server-only";

export function isEditPasswordValid(password: string) {
  const expected = process.env.CALENDAR_EDIT_PASSWORD || "improx";
  return password === expected;
}
