'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import CategorySelector from '@/components/CategorySelector';
import FileUpload from '@/components/FileUpload';
import type { Category, SignalFormData } from '@/types';

// Dynamic import for map (SSR incompatible with Leaflet)
const LocationMap = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
      <span className="text-slate-400">Зареждане на картата...</span>
    </div>
  ),
});

interface UploadedFile {
  file: File;
  preview?: string;
}

const INITIAL_FORM: SignalFormData = {
  categoryId: '',
  typeId: '',
  latitude: null,
  longitude: null,
  address: '',
  settlement: 'Перник',
  district: '',
  street: '',
  streetNum: '',
  block: '',
  entrance: '',
  floor: '',
  apartment: '',
  shortDesc: '',
  fullDesc: '',
  senderName: '',
  senderEmail: '',
  senderPhone: '',
  gdprConsent: false,
};

type Step = 'category' | 'location' | 'description' | 'sender';

const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: 'category', label: 'Категория', icon: '📋' },
  { key: 'location', label: 'Местоположение', icon: '📍' },
  { key: 'description', label: 'Описание', icon: '✏️' },
  { key: 'sender', label: 'Подател', icon: '👤' },
];

export default function CreateSignalPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<SignalFormData>(INITIAL_FORM);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>('category');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    code?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const updateField = <K extends keyof SignalFormData>(key: K, value: SignalFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  function validateStep(step: Step): boolean {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'category':
        if (!form.categoryId) newErrors.categoryId = 'Моля, изберете категория';
        break;
      case 'location':
        // Location is recommended but not strictly required
        break;
      case 'description':
        if (!form.shortDesc || form.shortDesc.length < 5)
          newErrors.shortDesc = 'Краткото описание трябва да е поне 5 символа';
        if (form.shortDesc.length > 200)
          newErrors.shortDesc = 'Краткото описание не може да е повече от 200 символа';
        break;
      case 'sender':
        if (!form.senderName || form.senderName.length < 2)
          newErrors.senderName = 'Моля, въведете вашето име';
        if (form.senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.senderEmail))
          newErrors.senderEmail = 'Невалиден имейл адрес';
        if (!form.senderEmail && !form.senderPhone)
          newErrors.senderContact = 'Моля, въведете имейл или телефон за контакт';
        if (!form.gdprConsent)
          newErrors.gdprConsent = 'Трябва да се съгласите с обработката на лични данни';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function goNext() {
    if (!validateStep(currentStep)) return;
    const idx = currentStepIndex;
    if (idx < STEPS.length - 1) {
      setCurrentStep(STEPS[idx + 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goPrev() {
    const idx = currentStepIndex;
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1].key);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goToStep(step: Step) {
    // Only allow going to completed steps or current
    const targetIdx = STEPS.findIndex((s) => s.key === step);
    if (targetIdx <= currentStepIndex) {
      setCurrentStep(step);
    }
  }

  async function handleSubmit() {
    if (!validateStep('sender')) return;
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // 1. Create signal
      const res = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          gdprConsent: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Грешка при създаване на сигнала');
      }

      const signal = await res.json();

      // 2. Upload files if any
      if (files.length > 0) {
        const formData = new FormData();
        formData.append('signalId', signal.id);
        files.forEach((f) => formData.append('files', f.file));

        await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
      }

      setSubmitResult({ success: true, code: signal.code });
    } catch (error: any) {
      setSubmitResult({
        success: false,
        error: error.message || 'Възникна неочаквана грешка',
      });
    }

    setIsSubmitting(false);
  }

  // Success screen
  if (submitResult?.success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          <div className="animate-float text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Сигналът е регистриран!
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Вашият сигнал беше успешно подаден и получи номер:
          </p>
          <div className="inline-block bg-gradient-to-r from-[#1a2744] to-[#2d4a7a] text-white text-2xl font-mono font-bold px-8 py-4 rounded-xl mb-8">
            {submitResult.code}
          </div>
          <p className="text-sm text-slate-500 mb-8">
            Запишете този номер, за да можете да следите статуса на вашия сигнал.
            {form.senderEmail && ' Ще получите потвърждение на имейл адреса, който сте посочили.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/signal/create"
              className="px-6 py-3 bg-[#2d4a7a] text-white rounded-lg font-medium hover:bg-[#1a2744] transition-colors"
            >
              Подай нов сигнал
            </a>
            <a
              href="/"
              className="px-6 py-3 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Към началната страница
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Регистрация на сигнал
        </h1>
        <p className="text-slate-500 mt-2">
          Подадените данни по сигнала, с изключение на тези от рубрика &quot;Подател&quot;, подлежат на публикуване.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8 overflow-x-auto pb-2">
        {STEPS.map((step, idx) => (
          <div key={step.key} className="flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={() => goToStep(step.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentStep === step.key
                  ? 'bg-[#2d4a7a] text-white shadow-md'
                  : idx < currentStepIndex
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                  : 'bg-slate-100 text-slate-400'
              }`}
              disabled={idx > currentStepIndex}
            >
              <span>{step.icon}</span>
              <span className="hidden sm:inline">{step.label}</span>
              {idx < currentStepIndex && <span>✓</span>}
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 ${idx < currentStepIndex ? 'bg-green-300' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {submitResult?.error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-red-800">Грешка при подаване на сигнала</p>
            <p className="text-sm text-red-600 mt-1">{submitResult.error}</p>
          </div>
        </div>
      )}

      {/* Form card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <form onSubmit={(e) => e.preventDefault()}>
          {/* === STEP 1: CATEGORY === */}
          {currentStep === 'category' && (
            <div className="animate-fade-in-up">
              <CategorySelector
                categories={categories}
                selectedCategoryId={form.categoryId}
                selectedTypeId={form.typeId}
                onCategoryChange={(id) => updateField('categoryId', id)}
                onTypeChange={(id) => updateField('typeId', id)}
              />
              {errors.categoryId && (
                <p className="text-sm text-red-500 mt-2">{errors.categoryId}</p>
              )}
            </div>
          )}

          {/* === STEP 2: LOCATION === */}
          {currentStep === 'location' && (
            <div className="animate-fade-in-up space-y-6">
              <LocationMap
                latitude={form.latitude}
                longitude={form.longitude}
                onLocationChange={(lat, lng) => {
                  updateField('latitude', lat);
                  updateField('longitude', lng);
                }}
              />

              {/* Address details */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Уточняващ адрес
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Попълнете точен адрес, когато посоченият на картата не отговаря напълно на търсения.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Нас. място</label>
                    <input
                      type="text"
                      value={form.settlement}
                      onChange={(e) => updateField('settlement', e.target.value)}
                      placeholder="Перник"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#2d4a7a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">ж.к. / кв.</label>
                    <input
                      type="text"
                      value={form.district}
                      onChange={(e) => updateField('district', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#2d4a7a] transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Бул./Ул./Пл.</label>
                    <input
                      type="text"
                      value={form.street}
                      onChange={(e) => updateField('street', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#2d4a7a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">№</label>
                    <input
                      type="text"
                      value={form.streetNum}
                      onChange={(e) => updateField('streetNum', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#2d4a7a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Блок №</label>
                    <input
                      type="text"
                      value={form.block}
                      onChange={(e) => updateField('block', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#2d4a7a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Вход</label>
                    <input
                      type="text"
                      value={form.entrance}
                      onChange={(e) => updateField('entrance', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#2d4a7a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Етаж</label>
                    <input
                      type="text"
                      value={form.floor}
                      onChange={(e) => updateField('floor', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#2d4a7a] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Апартамент</label>
                    <input
                      type="text"
                      value={form.apartment}
                      onChange={(e) => updateField('apartment', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-[#2d4a7a] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === STEP 3: DESCRIPTION === */}
          {currentStep === 'description' && (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Кратко описание <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.shortDesc}
                  onChange={(e) => updateField('shortDesc', e.target.value)}
                  placeholder="Накратко опишете проблема..."
                  maxLength={200}
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:border-[#2d4a7a] transition-colors ${
                    errors.shortDesc ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {errors.shortDesc ? (
                    <p className="text-xs text-red-500">{errors.shortDesc}</p>
                  ) : (
                    <span />
                  )}
                  <span className={`text-xs ${form.shortDesc.length > 180 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {form.shortDesc.length}/200
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Подробно описание
                </label>
                <textarea
                  value={form.fullDesc}
                  onChange={(e) => updateField('fullDesc', e.target.value)}
                  placeholder="Добавете допълнителни детайли за проблема..."
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:border-[#2d4a7a] transition-colors resize-y"
                />
              </div>

              {/* File upload */}
              <FileUpload files={files} onFilesChange={setFiles} />
            </div>
          )}

          {/* === STEP 4: SENDER === */}
          {currentStep === 'sender' && (
            <div className="animate-fade-in-up space-y-6">
              {/* GDPR notice */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 text-sm mb-2">
                  Съгласие за обработване на лични данни
                </h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Искаме вашето име, телефон и e-mail, за да се свържем с Вас при обработка
                  на подадения от Вас сигнал. Вашите данни ще бъдат използвани единствено с
                  цел обработка на подадения от вас сигнал.
                </p>
              </div>

              <p className="text-xs text-slate-500">
                Електронна поща и/или телефон са необходими за връзка с Вас. При условие, че не
                предоставите тези данни, съществува вероятност сигналът Ви да бъде отхвърлен.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Име <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.senderName}
                    onChange={(e) => updateField('senderName', e.target.value)}
                    placeholder="Вашето име"
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:border-[#2d4a7a] transition-colors ${
                      errors.senderName ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  {errors.senderName && (
                    <p className="text-xs text-red-500 mt-1">{errors.senderName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={form.senderPhone}
                    onChange={(e) => updateField('senderPhone', e.target.value)}
                    placeholder="+359 ..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:border-[#2d4a7a] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Е-мейл адрес за известяване
                  </label>
                  <input
                    type="email"
                    value={form.senderEmail}
                    onChange={(e) => updateField('senderEmail', e.target.value)}
                    placeholder="email@example.com"
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:border-[#2d4a7a] transition-colors ${
                      errors.senderEmail ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  {errors.senderEmail && (
                    <p className="text-xs text-red-500 mt-1">{errors.senderEmail}</p>
                  )}
                </div>

                {errors.senderContact && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.senderContact}
                  </p>
                )}
              </div>

              {/* GDPR consent */}
              <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                form.gdprConsent
                  ? 'bg-green-50 border-green-200'
                  : errors.gdprConsent
                  ? 'bg-red-50 border-red-200'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}>
                <input
                  type="checkbox"
                  checked={form.gdprConsent}
                  onChange={(e) => updateField('gdprConsent', e.target.checked as any)}
                  className="mt-0.5 w-5 h-5 text-[#2d4a7a] rounded border-slate-300 focus:ring-[#2d4a7a]"
                />
                <span className="text-sm text-slate-700">
                  Съгласен/а съм с условията за обработване на личните данни{' '}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.gdprConsent && (
                <p className="text-xs text-red-500">{errors.gdprConsent}</p>
              )}

              {/* Summary before submit */}
              <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-slate-700 text-sm">Обобщение на сигнала</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">Категория: </span>
                    <span className="text-slate-700 font-medium">
                      {categories.find((c) => c.id === form.categoryId)?.name || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Тип: </span>
                    <span className="text-slate-700">
                      {categories
                        .find((c) => c.id === form.categoryId)
                        ?.types.find((t) => t.id === form.typeId)?.name || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Местоположение: </span>
                    <span className="text-slate-700">
                      {form.latitude && form.longitude
                        ? `${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}`
                        : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Файлове: </span>
                    <span className="text-slate-700">{files.length} бр.</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400">Описание: </span>
                    <span className="text-slate-700">{form.shortDesc || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentStepIndex === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentStepIndex === 0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </button>

            {currentStep !== 'sender' ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2d4a7a] text-white rounded-lg text-sm font-medium hover:bg-[#1a2744] transition-colors shadow-sm"
              >
                Продължи
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-[#e8b931] text-[#1a2744] rounded-xl text-sm font-bold hover:bg-yellow-400 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin inline-block">⏳</span>
                    Изпращане...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Подай сигнал
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
