import { NextRequest, NextResponse } from 'next/server';

// Mock upload endpoint for visual preview
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const signalId = formData.get('signalId') as string;
    const files = formData.getAll('files') as File[];

    if (!signalId) {
      return NextResponse.json({ error: 'Липсва ID на сигнала' }, { status: 400 });
    }

    // Mock response - pretend files were uploaded
    const attachments = files.map((file, index) => ({
      id: `mock-${index}`,
      signalId,
      filename: file.name,
      origName: file.name,
      mimeType: file.type,
      size: file.size,
      path: `/uploads/mock/${file.name}`,
    }));

    return NextResponse.json({ attachments }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Грешка при качване на файлове' }, { status: 500 });
  }
}
