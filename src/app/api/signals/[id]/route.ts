import { NextRequest, NextResponse } from 'next/server';

// Mock GET /api/signals/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Return mock signal for visual preview
  return NextResponse.json({
    id: params.id,
    code: 'SIG-2024-001',
    status: 'new',
    shortDesc: 'Mock signal for preview',
    fullDesc: 'This is a mock signal for visual preview purposes.',
    category: { id: '1', name: 'Инфраструктура', icon: '🏗️' },
    type: { id: '1-1', name: 'Тротоар' },
    attachments: [],
    comments: [],
    statusLog: [],
    createdAt: new Date().toISOString(),
  });
}

// Mock PATCH /api/signals/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  
  return NextResponse.json({
    id: params.id,
    ...body,
    updatedAt: new Date().toISOString(),
  });
}
