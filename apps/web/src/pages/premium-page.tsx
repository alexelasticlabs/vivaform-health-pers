import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Star, Zap } from 'lucide-react';
import { createCheckoutSession } from '../api/subscriptions';

const PLANS = [
  {
    id: 'free',
    name: 'FREE',
    price: '$0',
    period: 'forever',
    description: 'Основы здорового питания',
    features: [
      { text: 'Трекинг калорий и макросов', included: true },
      { text: 'Учёт воды', included: true },
      { text: 'Отслеживание веса', included: true },
      { text: 'Базовые рекомендации', included: true },
      { text: 'Персональный план питания', included: false },
      { text: 'Генератор рационов (AI)', included: false },
      { text: 'Расширенная аналитика', included: false },
      { text: 'Интеграция с Apple Health/Google Fit', included: false },
      { text: 'Приоритетная поддержка', included: false },
    ],
    cta: 'Текущий план',
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: '$4.87',
    period: 'per month',
    description: 'Для серьёзных результатов',
    badge: 'Популярный',
    features: [
      { text: 'Всё из FREE', included: true },
      { text: 'Персональный план питания', included: true },
      { text: 'Генератор рационов (AI)', included: true },
      { text: 'Расширенная аналитика', included: true },
      { text: 'Интеграция с Apple Health/Google Fit', included: true },
      { text: 'Напоминания и уведомления', included: true },
      { text: 'Экспорт данных', included: true },
      { text: 'Приоритетная поддержка', included: true },
      { text: 'Без рекламы', included: true },
    ],
    cta: 'Начать',
    highlighted: true,
    stripePriceId: 'price_monthly', // Replace with actual Stripe Price ID
  },
];

const TESTIMONIALS = [
  {
    name: 'Анна К.',
    role: 'Похудела на 12 кг',
    text: 'VivaForm помог мне наконец достичь своих целей. Персонализированный план питания и простой трекинг сделали процесс лёгким.',
    avatar: '👩',
  },
  {
    name: 'Дмитрий С.',
    role: 'Набрал 8 кг мышц',
    text: 'Отличный инструмент для спортсменов. Точный подсчёт макросов и интеграция с Apple Health сэкономили кучу времени.',
    avatar: '👨',
  },
  {
    name: 'Мария П.',
    role: 'Улучшила здоровье',
    text: 'После 3 месяцев использования чувствую себя намного лучше. Рекомендации действительно работают!',
    avatar: '👩‍🦰',
  },
];

const FAQ = [
  {
    question: 'Можно ли отменить подписку?',
    answer: 'Да, вы можете отменить подписку в любое время в настройках аккаунта. После отмены доступ к премиум-функциям сохранится до конца оплаченного периода.',
  },
  {
    question: 'Есть ли пробный период?',
    answer: 'FREE план доступен всем пользователям без ограничений по времени. Вы можете попробовать базовые функции перед апгрейдом на PREMIUM.',
  },
  {
    question: 'Какие способы оплаты поддерживаются?',
    answer: 'Мы принимаем все основные кредитные карты (Visa, Mastercard, American Express) через безопасную платформу Stripe.',
  },
  {
    question: 'Можно ли перейти на другой план?',
    answer: 'Да, вы можете в любой момент перейти на другой план. При апгрейде разница будет рассчитана пропорционально.',
  },
  {
    question: 'Работает ли на мобильных?',
    answer: 'Да! У нас есть мобильное приложение для iOS и Android, а также адаптивная веб-версия.',
  },
];

export function PremiumPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { url } = await createCheckoutSession({
        plan: planId as any,
        successUrl: `${window.location.origin}/premium?success=true`,
        cancelUrl: `${window.location.origin}/premium?canceled=true`
      });
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Не удалось получить URL оплаты');
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Не удалось создать сессию оплаты. Попробуйте позже.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Error Alert */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Ошибка</h4>
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
            <Zap size={16} />
            Трансформируйте своё питание
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Выберите свой план
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Начните с бесплатного плана или получите полный доступ к персонализированным планам питания и AI-рекомендациям
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl p-8 ${
                plan.highlighted
                  ? 'border-4 border-blue-500 transform scale-105'
                  : 'border-2 border-gray-200'
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                  <div className="flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold rounded-full shadow-lg">
                    <Star size={14} fill="currentColor" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">/ {plan.period}</span>
                </div>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={plan.id === 'free' || isLoading}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all mb-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading && plan.id !== 'free' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Загрузка...
                  </span>
                ) : (
                  plan.cta
                )}
              </button>

              <ul className="space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="text-green-500 flex-shrink-0 mt-1" size={20} />
                    ) : (
                      <X className="text-gray-300 flex-shrink-0 mt-1" size={20} />
                    )}
                    <span
                      className={
                        feature.included ? 'text-gray-900' : 'text-gray-400'
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Истории успеха
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Часто задаваемые вопросы
          </h2>
          <div className="space-y-4">
            {FAQ.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">
                    {item.question}
                  </span>
                  <span
                    className={`transform transition-transform ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-4 text-gray-600">{item.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Готовы начать своё путешествие?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Присоединяйтесь к тысячам пользователей, которые уже достигли своих целей
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/quiz"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
            >
              Пройти квиз →
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Создать аккаунт
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
