'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, Copy, Check, CreditCard, Receipt, Zap,
  Crown, AlertCircle, Globe, Star, AtSign,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input, Select } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { business } from '@/lib/mock-data'

// ── Mock billing data ─────────────────────────────────────────────────────────
const CURRENT_PLAN = {
  name: 'Growth',
  price: 2499,
  cycle: 'monthly' as const,
  nextBilling: '2026-07-13',
  customersUsed: 7,
  customerLimit: 500,
  campaignsUsed: 5,
  campaignLimit: 999,
  features: [
    'Up to 500 customers',
    'Unlimited campaigns',
    'All 5 game mechanics',
    'Custom branding',
    'Priority support',
    'Analytics dashboard',
  ],
}

const PLANS = [
  {
    name: 'Starter', price: 1499, color: '#6B7280',
    features: ['Up to 200 customers', '3 active campaigns', 'Shake, Spin & Stamp', 'Basic analytics'],
    cta: 'Downgrade',
  },
  {
    name: 'Growth', price: 2499, color: '#7C3AED', current: true,
    features: ['Up to 500 customers', 'Unlimited campaigns', 'All 5 mechanics', 'Custom branding', 'Priority support'],
    cta: 'Current Plan',
  },
  {
    name: 'Pro', price: 4999, color: '#D97706',
    features: ['Unlimited customers', 'Unlimited campaigns', 'All mechanics + Lottery', 'Dedicated account manager', 'White-label app'],
    cta: 'Upgrade →',
  },
]

const BILLING_HISTORY = [
  { id: 'INV-2026-006', date: '2026-06-01', amount: 2499, plan: 'Growth', status: 'paid' },
  { id: 'INV-2026-005', date: '2026-05-01', amount: 2499, plan: 'Growth', status: 'paid' },
  { id: 'INV-2026-004', date: '2026-04-01', amount: 1499, plan: 'Starter', status: 'paid' },
  { id: 'INV-2026-003', date: '2026-03-01', amount: 1499, plan: 'Starter', status: 'paid' },
  { id: 'INV-2026-002', date: '2026-02-01', amount: 1499, plan: 'Starter', status: 'paid' },
]

const PAYMENT_METHOD = {
  type: 'card' as const,
  brand: 'Visa',
  last4: '4242',
  expiry: '08/27',
  name: 'Omkar Ramu Bandi',
}

const CATEGORIES = ['Café & Bakery', 'Restaurant', 'Quick Service Restaurant', 'Salon & Spa', 'Gym & Fitness', 'Retail', 'Pharmacy', 'Pet Clinic', 'Other']

type Tab = 'profile' | 'billing' | 'qr'

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab,     setTab]     = useState<Tab>('profile')
  const [form,    setForm]    = useState({ ...business, instagram: '', facebook: '', website: business.website, googleReview: '' })
  const [saved,   setSaved]   = useState(false)
  const [copied,  setCopied]  = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2200) }
  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'Business Profile', icon: <Star className="w-3.5 h-3.5" /> },
    { key: 'billing', label: 'Billing & Plan',   icon: <CreditCard className="w-3.5 h-3.5" /> },
    { key: 'qr',      label: 'QR Code',          icon: <Globe className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="p-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <h1 className="text-2xl font-extrabold text-v-text">Settings</h1>
        <p className="text-v-text-2 text-sm mt-1">Manage your profile, plan, and integrations</p>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-7 bg-v-surface-2 border border-v-border rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.key ? 'bg-white text-v-text shadow-sm border border-v-border' : 'text-v-text-2 hover:text-v-text'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <div className="space-y-6">
              {/* Logo + identity */}
              <Card className="p-6">
                <h2 className="text-base font-bold text-v-text mb-5">Business Identity</h2>
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-v-surface-3 border border-v-border-b flex items-center justify-center text-4xl">
                      {form.logo}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-v-purple text-white flex items-center justify-center text-xs font-bold hover:bg-v-purple-d transition-colors">+</button>
                  </div>
                  <div>
                    <div className="text-base font-black text-v-text">{form.name}</div>
                    <div className="text-xs text-v-text-3 mt-0.5">{form.category}</div>
                    <div className="text-xs text-v-text-3 mt-0.5">{form.tagline}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Business Name" value={form.name} onChange={set('name')} />
                    <Select label="Category" value={form.category} onChange={set('category')}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </Select>
                  </div>
                  <Input label="Tagline" value={form.tagline} onChange={set('tagline')} hint="Shown to customers on the loyalty page" />
                  <Input label="Description" value={form.description} onChange={set('description')} />
                </div>
              </Card>

              {/* Contact */}
              <Card className="p-6">
                <h2 className="text-base font-bold text-v-text mb-5">Contact & Location</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Phone" value={form.phone} onChange={set('phone')} />
                    <Input label="Email" value={form.email} onChange={set('email')} />
                  </div>
                  <Input label="Address" value={form.address} onChange={set('address')} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="City" value={form.city} onChange={set('city')} />
                    <Input label="Business Hours" value={form.hours} onChange={set('hours')} />
                  </div>
                  <Input label="Website" value={form.website} onChange={set('website')} />
                </div>
              </Card>

              {/* Social media */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <AtSign className="w-4 h-4 text-v-purple" />
                  <h2 className="text-base font-bold text-v-text">Social Media</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Instagram" value={form.instagram} onChange={set('instagram')} placeholder="@yourhandle" />
                  <Input label="Facebook" value={form.facebook} onChange={set('facebook')} placeholder="@yourpage" />
                </div>
                <div className="mt-4">
                  <Input label="Google Review Link" value={form.googleReview} onChange={set('googleReview')} placeholder="Paste your Google review link" />
                </div>
              </Card>

              <div className="flex justify-end">
                <Button variant={saved ? 'secondary' : 'primary'} onClick={handleSave}>
                  {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}

          {/* ── BILLING TAB ── */}
          {tab === 'billing' && (
            <div className="space-y-6">

              {/* Current plan */}
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-4 h-4 text-v-purple" />
                      <h2 className="text-base font-bold text-v-text">Current Plan</h2>
                    </div>
                    <p className="text-xs text-v-text-3">Next billing on {CURRENT_PLAN.nextBilling}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-v-purple">₹{CURRENT_PLAN.price.toLocaleString()}</div>
                    <div className="text-xs text-v-text-3">/ month</div>
                  </div>
                </div>

                {/* Plan badge */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-v-surface-2 border border-v-border mb-5">
                  <div className="w-10 h-10 rounded-xl bg-v-purple flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-v-text">{CURRENT_PLAN.name} Plan</div>
                    <div className="text-xs text-v-text-3">Active · renews monthly</div>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-green-700 border border-emerald-200">Active</span>
                </div>

                {/* Usage */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-v-text-2 font-medium">Customers</span>
                      <span className="text-v-text font-bold">{CURRENT_PLAN.customersUsed} / {CURRENT_PLAN.customerLimit}</span>
                    </div>
                    <div className="h-2 bg-v-surface-3 rounded-full overflow-hidden">
                      <div className="h-full bg-v-purple rounded-full" style={{ width: `${CURRENT_PLAN.customersUsed / CURRENT_PLAN.customerLimit * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-v-text-2 font-medium">Campaigns</span>
                      <span className="text-v-text font-bold">{CURRENT_PLAN.campaignsUsed} / Unlimited</span>
                    </div>
                    <div className="h-2 bg-v-surface-3 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '2%' }} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {CURRENT_PLAN.features.map(f => (
                    <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-v-surface-3 border border-v-border text-v-text-2 font-medium flex items-center gap-1">
                      <Check className="w-2.5 h-2.5 text-v-success" />{f}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Plan comparison */}
              <div>
                <h2 className="text-sm font-bold text-v-text mb-3">All Plans</h2>
                <div className="grid grid-cols-3 gap-3">
                  {PLANS.map(plan => (
                    <div key={plan.name}
                      className={`rounded-2xl p-5 border transition-all ${plan.current ? 'border-v-purple bg-v-surface-2' : 'border-v-border bg-white hover:border-v-border-b'}`}>
                      {plan.current && (
                        <div className="text-[10px] font-black text-v-purple mb-2 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> CURRENT
                        </div>
                      )}
                      <div className="text-base font-black text-v-text mb-0.5">{plan.name}</div>
                      <div className="text-2xl font-black mb-1" style={{ color: plan.color }}>₹{plan.price.toLocaleString()}</div>
                      <div className="text-[10px] text-v-text-3 mb-4">/ month</div>
                      <ul className="space-y-1.5 mb-5">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-start gap-1.5 text-[11px] text-v-text-2">
                            <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: plan.color }} />{f}
                          </li>
                        ))}
                      </ul>
                      <button
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${plan.current ? 'bg-v-surface-3 text-v-text-3 cursor-not-allowed' : 'hover:opacity-90'}`}
                        style={!plan.current ? { background: plan.color, color: 'white' } : {}}
                        disabled={plan.current}>
                        {plan.cta}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-v-purple" />
                    <h2 className="text-sm font-bold text-v-text">Payment Method</h2>
                  </div>
                  <Button variant="ghost" size="sm">Update</Button>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-v-surface-2 border border-v-border">
                  <div className="w-12 h-8 rounded-lg bg-v-purple/10 border border-v-border flex items-center justify-center">
                    <span className="text-[10px] font-black text-v-purple">{PAYMENT_METHOD.brand.toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-v-text">•••• •••• •••• {PAYMENT_METHOD.last4}</div>
                    <div className="text-xs text-v-text-3">{PAYMENT_METHOD.name} · Expires {PAYMENT_METHOD.expiry}</div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-green-700 border border-emerald-200 font-semibold">Default</span>
                </div>
                <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-700">Auto-renewal is on. You'll be charged ₹2,499 on 13 July 2026.</p>
                </div>
              </Card>

              {/* Billing history */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Receipt className="w-4 h-4 text-v-purple" />
                  <h2 className="text-sm font-bold text-v-text">Billing History</h2>
                </div>
                <div className="space-y-0 divide-y divide-v-border">
                  {BILLING_HISTORY.map(inv => (
                    <div key={inv.id} className="flex items-center gap-4 py-3">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-v-text">{inv.plan} Plan</div>
                        <div className="text-[10px] text-v-text-3">
                          {new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {' · '}{inv.id}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-v-text">₹{inv.amount.toLocaleString()}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-green-700 border border-emerald-200 font-semibold capitalize">
                        {inv.status}
                      </span>
                      <button className="text-v-purple hover:text-v-purple-d transition-colors">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ── QR CODE TAB ── */}
          {tab === 'qr' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-base font-bold text-v-text mb-1">QR Code</h2>
                <p className="text-xs text-v-text-3 mb-6">Print and place this on your counter. Customers scan to access all active campaigns.</p>
                <div className="flex items-start gap-8">
                  <div className="w-36 h-36 rounded-2xl bg-white flex items-center justify-center p-3 border border-v-border shrink-0">
                    <svg viewBox="0 0 100 100" width="110" height="110">
                      {[0,1,2,3,4,5,6].flatMap(r =>
                        [0,1,2,3,4,5,6].map(c => {
                          const inCorner = (r < 3 && c < 3) || (r < 3 && c > 3) || (r > 3 && c < 3)
                          const fill = inCorner ? '#1A1840' : (((r * 7 + c) * 13 + 7) % 3 === 0 ? '#1A1840' : 'white')
                          return <rect key={`${r}-${c}`} x={c * 14 + 1} y={r * 14 + 1} width="12" height="12" fill={fill} rx="1" />
                        })
                      )}
                      <rect x="1" y="1" width="40" height="40" fill="none" stroke="#1A1840" strokeWidth="3" rx="4" />
                      <rect x="59" y="1" width="40" height="40" fill="none" stroke="#1A1840" strokeWidth="3" rx="4" />
                      <rect x="1" y="59" width="40" height="40" fill="none" stroke="#1A1840" strokeWidth="3" rx="4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-v-text-3 mb-1.5">Customer loyalty URL</div>
                    <div className="flex items-center gap-2 mb-5">
                      <code className="text-xs text-v-purple bg-v-surface-2 border border-v-border px-3 py-2 rounded-lg flex-1">
                        loyalgenie.in/b/brew-bite
                      </code>
                      <Button variant="ghost" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="w-3.5 h-3.5 text-v-success" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="primary" size="sm"><Download className="w-3.5 h-3.5" /> Download PNG</Button>
                      <Button variant="secondary" size="sm"><Download className="w-3.5 h-3.5" /> Print PDF</Button>
                    </div>
                    <p className="text-[11px] text-v-text-3 mt-4 leading-relaxed">
                      Place the QR on your counter, menu card, or receipt. Customers scan it with any camera app to instantly join your loyalty program.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Counter standee preview */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-v-text">Counter Standee Preview</h2>
                    <p className="text-xs text-v-text-3 mt-0.5">We'll print and courier this to you within 5 business days.</p>
                  </div>
                  <Button variant="primary" size="sm">Order Standee →</Button>
                </div>
                <div className="w-48 mx-auto rounded-2xl border border-v-border overflow-hidden shadow-lg">
                  <div className="h-16 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1A1840, #7C3AED)' }}>
                    <span className="text-lg font-black text-white">Loyal<span style={{ color: '#F5C518' }}>Genie</span></span>
                  </div>
                  <div className="bg-white p-4 text-center">
                    <p className="text-[10px] text-gray-400 mb-2">Scan to win rewards</p>
                    <div className="w-20 h-20 bg-gray-100 rounded-xl mx-auto flex items-center justify-center border border-gray-200">
                      <span className="text-[9px] text-gray-300">QR code</span>
                    </div>
                    <p className="text-xs font-bold text-gray-800 mt-2">{business.name}</p>
                    <p className="text-[9px] text-gray-400">{business.tagline}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}
