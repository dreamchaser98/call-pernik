import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/signals/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const signal = await prisma.signal.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        type: true,
        attachments: true,
        comments: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
        },
        statusLog: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!signal) {
      return NextResponse.json(
        { error: 'Сигналът не е намерен' },
        { status: 404 }
      );
    }

    return NextResponse.json(signal);
  } catch (error) {
    console.error('Error fetching signal:', error);
    return NextResponse.json(
      { error: 'Грешка при зареждане на сигнала' },
      { status: 500 }
    );
  }
}

// PATCH /api/signals/:id - Update signal status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, note } = body;

    const existing = await prisma.signal.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Сигналът не е намерен' },
        { status: 404 }
      );
    }

    const signal = await prisma.signal.update({
      where: { id: params.id },
      data: {
        status,
        resolvedAt: status === 'resolved' ? new Date() : undefined,
      },
      include: {
        category: true,
        type: true,
      },
    });

    await prisma.statusLog.create({
      data: {
        signalId: signal.id,
        oldStatus: existing.status,
        newStatus: status,
        note: note || null,
        changedBy: 'admin',
      },
    });

    return NextResponse.json(signal);
  } catch (error) {
    console.error('Error updating signal:', error);
    return NextResponse.json(
      { error: 'Грешка при обновяване на сигнала' },
      { status: 500 }
    );
  }
}
