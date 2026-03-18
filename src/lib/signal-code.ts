export function generateSignalCode(): string {
  const year = new Date().getFullYear();
  const prefix = `PK-${year}-`;
  const randomNum = Math.floor(Math.random() * 99999) + 1;
  return `${prefix}${String(randomNum).padStart(5, '0')}`;
}
