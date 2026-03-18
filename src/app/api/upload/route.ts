import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 5;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const signalId = formData.get('signalId') as string;
    const files = formData.getAll('files') as File[];

    if (!signalId) {
      return NextResponse.json({ error: 'Липсва ID на сигнала' }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'Не са прикачени файлове' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Не може да прикачите повече от ${MAX_FILES} файла` },
        { status: 400 }
      );
    }

    const signal = await prisma.signal.findUnique({ where: { id: signalId } });
    if (!signal) {
      return NextResponse.json({ error: 'Сигналът не е намерен' }, { status: 404 });
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', signalId);
    await mkdir(uploadDir, { recursive: true });

    const attachments = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;

      const ext = file.name.split('.').pop() || '';
      const filename = `${uuidv4()}.${ext}`;
      const filepath = join(uploadDir, filename);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      const attachment = await prisma.attachment.create({
        data: {
          signalId,
          filename,
          origName: file.name,
          mimeType: file.type,
          size: file.size,
          path: `/uploads/${signalId}/${filename}`,
        },
      });

      attachments.push(attachment);
    }

    return NextResponse.json({ attachments }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Грешка при качване на файлове' }, { status: 500 });
  }
}
