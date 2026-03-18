export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  orderNum: number;
  types: SignalType[];
}

export interface SignalType {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  orderNum: number;
}

export interface Signal {
  id: string;
  code: string;
  categoryId: string;
  typeId: string | null;
  status: string;
  priority: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  district: string | null;
  settlement: string | null;
  street: string | null;
  streetNum: string | null;
  block: string | null;
  entrance: string | null;
  floor: string | null;
  apartment: string | null;
  shortDesc: string;
  fullDesc: string | null;
  senderName: string;
  senderEmail: string | null;
  senderPhone: string | null;
  gdprConsent: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  category?: Category;
  type?: SignalType;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  signalId: string;
  filename: string;
  origName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
}

export interface SignalFormData {
  categoryId: string;
  typeId: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  settlement: string;
  district: string;
  street: string;
  streetNum: string;
  block: string;
  entrance: string;
  floor: string;
  apartment: string;
  shortDesc: string;
  fullDesc: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  gdprConsent: boolean;
}
