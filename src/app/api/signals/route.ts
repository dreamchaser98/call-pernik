import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signalCreateSchema } from '@/lib/validation';
import { generateSignalCode } from '@/lib/signal-code';

// GET /api/signals - List signals with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { shortDesc: { contains: search } },
        { fullDesc: { contains: search } },
        { code: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const [signals, total] = await Promise.all([
      prisma.signal.findMany({
        where,
        include: {
          category: true,
          type: true,
          attachments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.signal.count({ where }),
    ]);

    return NextResponse.json({
      signals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching signals:', error);
    return NextResponse.json(
      { error: 'Грешка при зареждане на сигналите' },
      { status: 500 }
    );
  }
}

// POST /api/signals - Create a new signal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signalCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Невалидни данни', details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const data = parsed.data;
    const code = await generateSignalCode();

    const signal = await prisma.signal.create({
      data: {
        code,
        categoryId: data.categoryId,
        typeId: data.typeId || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        address: data.address,
        settlement: data.settlement,
        district: data.district,
        street: data.street,
        streetNum: data.streetNum,
        block: data.block,
        entrance: data.entrance,
        floor: data.floor,
        apartment: data.apartment,
        shortDesc: data.shortDesc,
        fullDesc: data.fullDesc,
        senderName: data.senderName,
        senderEmail: data.senderEmail || null,
        senderPhone: data.senderPhone,
        gdprConsent: data.gdprConsent,
      },
      include: {
        category: true,
        type: true,
      },
    });

    // Log initial status
    await prisma.statusLog.create({
      data: {
        signalId: signal.id,
        oldStatus: '',
        newStatus: 'new',
        note: 'Сигналът е регистриран',
        changedBy: 'system',
      },
    });

    return NextResponse.json(signal, { status: 201 });
  } catch (error) {
    console.error('Error creating signal:', error);
    return NextResponse.json(
      { error: 'Грешка при създаване на сигнала' },
      { status: 500 }
    );
  }
}
