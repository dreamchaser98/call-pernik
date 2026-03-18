import { prisma } from './prisma';

export async function generateSignalCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PK-${year}-`;

  const lastSignal = await prisma.signal.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: 'desc' },
  });

  let nextNum = 1;
  if (lastSignal) {
    const lastNum = parseInt(lastSignal.code.replace(prefix, ''), 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(5, '0')}`;
}
