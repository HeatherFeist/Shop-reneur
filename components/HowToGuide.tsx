
import React, { useState } from 'react';
import {
  X, BookOpen, Search, Lock, LayoutDashboard, Package,
  DollarSign, Link, FileText, Image as ImageIcon, CheckCircle2,
  Video, ShoppingCart, ChevronRight, ChevronLeft, Lightbulb
} from 'lucide-react';

interface Step {
  number: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  tips?: string[];
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Log In as an Owner',
    icon: <Search size={28} />,
    description:
      'Start at the portal page. Type your store owner name in the Identity Search field. Once your profile appears, select "Executive Owner" as your access level, then click "Initialize Hub Session" and enter your secret Access Key.',
    tips: [
      'If you are new, click "Build Your Profile" to create your account first.',
      'Shoppers can browse the storefront without an Access Key.',
    ],
  },
  {
    number: 2,
    title: 'Open the Dashboard',
    icon: <LayoutDashboard size={28} />,
    description:
      'After logging in you will land on the Admin Dashboard automatically. You can also reach it at any time by clicking the "Dashboard" button in the top navigation bar.',
    tips: [
      'The Dashboard is only visible to store Owners.',
    ],
  },
  {
    number: 3,
    title: 'Go to Inventory Ops',
    icon: <Package size={28} />,
    description:
      'Inside the Dashboard, click the "Inventory Ops" tab at the top. This is where you create and manage all of your products.',
    tips: [
      'You will also find the Lifecycle Ledger here — a table showing every product you have added.',
    ],
  },
  {
    number: 4,
    title: 'Fill In Product Details',
    icon: <FileText size={28} />,
    description:
      'Under the "Asset Onboarding" form, complete the following fields:\n• Marketplace — choose Amazon, Shein, or eBay.\n• Department — select the category that best describes your product.\n• Asset Name — enter the full product title.',
    tips: [
      'Pick the marketplace where you will be sourcing the product.',
      'Choose the most specific department to help customers find your item.',
    ],
  },
  {
    number: 5,
    title: 'Set Pricing & Marketplace ID',
    icon: <DollarSign size={28} />,
    description:
      'Enter the Retail Target price (the price your customers will see) and your Cost Price (what you personally pay). Then paste the product\'s unique ID — the Amazon ASIN, eBay Item ID, or Shein Product Code.',
    tips: [
      'Your profit margin is automatically calculated in the Lifecycle Ledger.',
      'You can find the ASIN on any Amazon product page under "Product Information".',
    ],
  },
  {
    number: 6,
    title: 'Add Affiliate Link & Description',
    icon: <Link size={28} />,
    description:
      'Paste your affiliate link in the "Affiliate Landing URL" field. Then write a product description, or click the "AI Generate Pitch" button to have the AI create one for you using your product name and category.',
    tips: [
      'Your affiliate link is what earns you a commission when customers purchase.',
      'Use descriptive keywords in the product name to get the best AI-generated pitch.',
    ],
  },
  {
    number: 7,
    title: 'Add a Product Image',
    icon: <ImageIcon size={28} />,
    description:
      'Paste a direct image URL in the "Asset Imagery" field, or click the image icon button to auto-generate a product image with AI. A clear, high-quality image greatly improves your store presentation.',
    tips: [
      'Images from Amazon or the product\'s official page work best.',
      'If you leave the image field blank, a placeholder image will be used.',
    ],
  },
  {
    number: 8,
    title: 'Save Your Product',
    icon: <CheckCircle2 size={28} />,
    description:
      'Click the "Commit to Ledger" button to save your product. It will immediately appear in the Lifecycle Ledger table below the form and enter the "Incubator Phase".',
    tips: [
      'You can edit or delete any product from the Lifecycle Ledger at any time.',
    ],
  },
  {
    number: 9,
    title: 'Unlock the Product (The 2-Unit Rule)',
    icon: <Video size={28} />,
    description:
      'New products start locked in the "Incubator Phase". To unlock them for public sales:\n1. Purchase at least 1 unit through the storefront to add it to your personal stock.\n2. Record a short video review (TikTok or Reels) and attach the link using the alert button in the Lifecycle Ledger.\n3. Purchase a 2nd unit — you will now reach "Enterprise Grade" status and your product is fully unlocked.',
    tips: [
      '"Personal Stock Only" means you have a unit but still need a review video.',
      '"Enterprise Grade" products are visible and purchasable by your customers.',
    ],
  },
  {
    number: 10,
    title: 'Your Product Is Live!',
    icon: <ShoppingCart size={28} />,
    description:
      'Once your product reaches Enterprise Grade status, it appears on your public Storefront for customers to browse and purchase. Customers can add it to their cart and complete the checkout through your affiliate link.',
    tips: [
      'Share your storefront link with friends and family to start driving traffic.',
      'Use the AI Business Mentor (bottom-right button) for personalised advice.',
    ],
  },
];

interface HowToGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToGuide: React.FC<HowToGuideProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentStep = activeStep !== null ? STEPS[activeStep] : null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-card max-w-2xl w-full rounded-[3rem] border border-white/10 shadow-3xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-10 pt-10 pb-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600/20 text-indigo-400 p-3 rounded-2xl border border-indigo-500/30">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-white leading-none">How to Add Products</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-1.5">Step-by-step guide</p>
            </div>
          </div>
          <button
            onClick={() => { onClose(); setActiveStep(null); }}
            className="text-slate-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
            aria-label="Close guide"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-10 py-8">
          {currentStep === null ? (
            /* Overview — all steps listed */
            <div className="space-y-3">
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Follow these 10 steps to add your first product and get it live on your storefront.
                Click any step to read the full details.
              </p>
              {STEPS.map((step, index) => (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  className="w-full flex items-center gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:border-indigo-500/30 transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 text-sm font-black group-hover:bg-indigo-600/40 transition-colors">
                    {step.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{step.title}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            /* Detail view for a single step */
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                  {currentStep.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                    Step {currentStep.number} of {STEPS.length}
                  </p>
                  <h3 className="text-2xl font-display font-bold text-white leading-snug">{currentStep.title}</h3>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed whitespace-pre-line">{currentStep.description}</p>

              {currentStep.tips && currentStep.tips.length > 0 && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500 flex items-center gap-2">
                    <Lightbulb size={12} /> Pro Tips
                  </p>
                  <ul className="space-y-2">
                    {currentStep.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-yellow-200/70 leading-relaxed">
                        <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-500/50"></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="px-10 py-6 border-t border-white/5 shrink-0 flex items-center justify-between gap-4">
          {currentStep === null ? (
            <p className="text-slate-600 text-xs">{STEPS.length} steps total</p>
          ) : (
            <button
              onClick={() => setActiveStep(null)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              <ChevronLeft size={14} /> All Steps
            </button>
          )}
          <div className="flex items-center gap-3 ml-auto">
            {currentStep !== null && (
              <>
                <button
                  onClick={() => setActiveStep(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
                  disabled={activeStep === 0}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-30 flex items-center gap-2"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  onClick={() => setActiveStep(prev => (prev !== null && prev < STEPS.length - 1 ? prev + 1 : prev))}
                  disabled={activeStep === STEPS.length - 1}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-30 flex items-center gap-2"
                >
                  Next <ChevronRight size={14} />
                </button>
              </>
            )}
            {currentStep === null && (
              <button
                onClick={() => setActiveStep(0)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                Start Guide <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToGuide;
