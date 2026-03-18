import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        types: {
          orderBy: { orderNum: 'asc' },
        },
      },
      orderBy: { orderNum: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Грешка при зареждане на категориите' },
      { status: 500 }
    );
  }
}
