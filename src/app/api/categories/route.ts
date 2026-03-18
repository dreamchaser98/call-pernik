import { NextResponse } from 'next/server';

// Mock data for visual preview
const mockCategories = [
  {
    id: '1',
    name: 'Инфраструктура',
    icon: '🏗️',
    orderNum: 1,
    types: [
      { id: '1-1', name: 'Тротоар', orderNum: 1 },
      { id: '1-2', name: 'Мост/надлез', orderNum: 2 },
      { id: '1-3', name: 'Канализация', orderNum: 3 },
    ],
  },
  {
    id: '2',
    name: 'Улично осветление',
    icon: '💡',
    orderNum: 2,
    types: [
      { id: '2-1', name: 'Неработеща лампа', orderNum: 1 },
      { id: '2-2', name: 'Счупен стълб', orderNum: 2 },
      { id: '2-3', name: 'Липсващо осветление', orderNum: 3 },
    ],
  },
  {
    id: '3',
    name: 'Чистота',
    icon: '🧹',
    orderNum: 3,
    types: [
      { id: '3-1', name: 'Сметосъбиране', orderNum: 1 },
      { id: '3-2', name: 'Нерегламентирано сметище', orderNum: 2 },
      { id: '3-3', name: 'Почистване на улици', orderNum: 3 },
    ],
  },
  {
    id: '4',
    name: 'Зелени площи',
    icon: '🌳',
    orderNum: 4,
    types: [
      { id: '4-1', name: 'Паднало дърво', orderNum: 1 },
      { id: '4-2', name: 'Повреда на съоръжение', orderNum: 2 },
      { id: '4-3', name: 'Поддръжка на парк', orderNum: 3 },
    ],
  },
  {
    id: '5',
    name: 'Пътища',
    icon: '🛣️',
    orderNum: 5,
    types: [
      { id: '5-1', name: 'Дупка', orderNum: 1 },
      { id: '5-2', name: 'Пропадане', orderNum: 2 },
      { id: '5-3', name: 'Липсваща маркировка', orderNum: 3 },
      { id: '5-4', name: 'Повреден знак', orderNum: 4 },
    ],
  },
  {
    id: '6',
    name: 'Други',
    icon: '📋',
    orderNum: 6,
    types: [
      { id: '6-1', name: 'Друг проблем', orderNum: 1 },
    ],
  },
];

export async function GET() {
  return NextResponse.json(mockCategories);
}
