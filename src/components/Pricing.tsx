import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CodeCompare, CircleCheck } from '@gravity-ui/icons';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Basic',
      price: isAnnual ? 99 : 9.99,
      features: [
        'Basic task management',
        'Natural language processing',
        'Priority detection',
        'Basic integrations',
        '5GB storage'
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      name: 'Pro',
      price: isAnnual ? 199 : 19.99,
      features: [
        'Everything in Basic',
        'Advanced AI suggestions',
        'Custom workflows',
        'Advanced analytics',
        'Unlimited storage',
        'Priority support'
      ],
      cta: 'Try Pro',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'Custom AI training',
        'SLA guarantee',
        'Advanced security',
        'API access'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed w-full backdrop-blur-md z-50 bg-white/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <CodeCompare className="w-8 h-8 text-blue-500" />
              <span className="ml-3 text-2xl font-semibold tracking-tight">ThinkLink</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Start free and scale as you grow
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Annual (Save 20%)
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white scale-105 shadow-xl'
                    : 'bg-white text-gray-900 shadow-lg hover:scale-105'
                }`}
              >
                <h3 className="text-2xl font-semibold mb-4">{plan.name}</h3>
                <div className="mb-6">
                  {typeof plan.price === 'number' ? (
                    <>
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-lg">{isAnnual ? '/year' : '/month'}</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold">{plan.price}</span>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CircleCheck className={`w-5 h-5 ${plan.highlighted ? 'text-white' : 'text-blue-500'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 px-6 rounded-full text-lg font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
