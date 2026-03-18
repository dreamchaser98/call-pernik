import { NextRequest, NextResponse } from 'next/server';

// Mock POST endpoint for visual preview
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate a mock signal code
    const code = `SIG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;

    // Return mock response
    return NextResponse.json({
      id: crypto.randomUUID(),
      code,
      ...body,
      status: 'new',
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating signal:', error);
    return NextResponse.json(
      { error: 'Грешка при създаване на сигнала' },
      { status: 500 }
    );
  }
}

// Mock GET endpoint
export async function GET() {
  return NextResponse.json({
    signals: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  });
}
