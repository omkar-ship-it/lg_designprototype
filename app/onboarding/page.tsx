'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Upload, Plus, Trash2, ChevronDown } from 'lucide-react'

// ── Dark-theme primitives ──────────────────────────────────────────────────────
const D = {
  bg:          '#0D0B28',
  card:        '#1A1840',
  cardBorder:  'rgba(255,255,255,0.08)',
  input:       'rgba(255,255,255,0.05)',
  inputBorder: 'rgba(255,255,255,0.12)',
  inputFocus:  '#7C3AED',
  label:       'rgba(255,255,255,0.55)',
  text:        '#FFFFFF',
  textMuted:   'rgba(255,255,255,0.45)',
  gold:        '#F5C518',
  purple:      '#7C3AED',
  purple2:     '#9D6FF0',
}

// ── Field primitives ───────────────────────────────────────────────────────────
function DLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold mb-1.5" style={{ color: D.label }}>{children}</label>
}

function DInput({ placeholder, value, onChange, type = 'text', prefix }: {
  placeholder?: string; value: string; onChange: (v: string) => void; type?: string; prefix?: string
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: D.textMuted }}>{prefix}</span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
        style={{
          background: D.input,
          border: `1px solid ${D.inputBorder}`,
          color: D.text,
          paddingLeft: prefix ? '2.5rem' : undefined,
        }}
        onFocus={e => e.currentTarget.style.borderColor = D.inputFocus}
        onBlur={e => e.currentTarget.style.borderColor = D.inputBorder}
      />
    </div>
  )
}

function DTextarea({ placeholder, value, onChange, rows = 3 }: {
  placeholder?: string; value: string; onChange: (v: string) => void; rows?: number
}) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
      style={{ background: D.input, border: `1px solid ${D.inputBorder}`, color: D.text }}
      onFocus={e => e.currentTarget.style.borderColor = D.inputFocus}
      onBlur={e => e.currentTarget.style.borderColor = D.inputBorder}
    />
  )
}

function DSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none appearance-none cursor-pointer transition-all"
        style={{ background: D.input, border: `1px solid ${D.inputBorder}`, color: value ? D.text : D.textMuted }}
        onFocus={e => e.currentTarget.style.borderColor = D.inputFocus}
        onBlur={e => e.currentTarget.style.borderColor = D.inputBorder}
      >
        {placeholder && <option value="" style={{ background: D.card }}>{placeholder}</option>}
        {options.map(o => <option key={o} value={o} style={{ background: D.card }}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: D.textMuted }} />
    </div>
  )
}

function DUpload({ label, hint, multi }: { label: string; hint?: string; multi?: boolean }) {
  return (
    <div>
      <DLabel>{label}</DLabel>
      <div
        className="w-full rounded-xl flex items-center gap-3 px-5 py-5 cursor-pointer transition-all hover:opacity-80"
        style={{ background: D.input, border: `1px dashed ${D.inputBorder}` }}
      >
        <Upload className="w-5 h-5 shrink-0" style={{ color: D.textMuted }} />
        <span className="text-sm" style={{ color: D.textMuted }}>{hint ?? 'Click to upload or drag & drop'}</span>
      </div>
    </div>
  )
}

// ── Sparkle decoration ────────────────────────────────────────────────────────
function Sparkle({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="rgba(255,255,255,0.3)" />
    </svg>
  )
}

// ── Step / section config ─────────────────────────────────────────────────────
const SECTIONS = [
  { key: 'business',  label: 'Business',  steps: 2 },
  { key: 'branches',  label: 'Branches',  steps: 1 },
  { key: 'branding',  label: 'Branding',  steps: 2 },
]
const TOTAL_STEPS = SECTIONS.reduce((s, sec) => s + sec.steps, 0)  // 5

function sectionOf(globalStep: number) {
  let acc = 0
  for (const sec of SECTIONS) {
    if (globalStep < acc + sec.steps) return { section: sec, subStep: globalStep - acc + 1 }
    acc += sec.steps
  }
  return { section: SECTIONS[SECTIONS.length - 1], subStep: SECTIONS[SECTIONS.length - 1].steps }
}

// ── Form state ────────────────────────────────────────────────────────────────
type FormData = {
  // Business Step 1
  name: string; tagline: string; description: string; businessType: string
  ownerName: string; mobile: string; whatsapp: string; email: string
  // Business Step 2
  city: string; pincode: string; landmark: string; address: string
  mapLink: string; operatingHours: string; weeklyOff: string
  // Branches Step 1
  branchName: string; branchCity: string; branchAddress: string
  // Branding Step 1: theme color (simplified)
  brandColor: string
  // Branding Step 2
  instagram: string; facebook: string; website: string; googleReview: string
}

const initial: FormData = {
  name: '', tagline: '', description: '', businessType: '', ownerName: '',
  mobile: '', whatsapp: '', email: '', city: '', pincode: '', landmark: '',
  address: '', mapLink: '', operatingHours: '', weeklyOff: '', branchName: '',
  branchCity: '', branchAddress: '', brandColor: '#7C3AED', instagram: '',
  facebook: '', website: '', googleReview: '',
}

const BUSINESS_TYPES = ['Café & Bakery', 'Restaurant', 'Quick Service Restaurant', 'Salon & Spa', 'Gym & Fitness', 'Retail Store', 'Pharmacy', 'Pet Clinic', 'Other']
const BRAND_COLORS = ['#7C3AED', '#EC4899', '#06B6D4', '#16A34A', '#D97706', '#DC2626', '#1D4ED8', '#0D9488']

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep] = useState(0)   // 0-based global step index
  const [form, setForm] = useState<FormData>(initial)
  const set = (k: keyof FormData) => (v: string) => setForm(p => ({ ...p, [k]: v }))

  const { section, subStep } = sectionOf(step)
  const isFirst = step === 0
  const isLast  = step === TOTAL_STEPS - 1

  // Progress: how far through each section?
  let sectionProgress = 0
  for (const sec of SECTIONS) {
    if (sec.key === section.key) break
    sectionProgress += sec.steps
  }
  const overallProgress = ((step + 1) / TOTAL_STEPS) * 100

  const next = () => { if (!isLast) setStep(s => s + 1) }
  const back = () => { if (!isFirst) setStep(s => s - 1) }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(135deg, #0D0B28 0%, #1A1840 60%, #0D0B28 100%)` }}>
      {/* Ambient sparkles */}
      <Sparkle className="fixed top-14 left-14 opacity-60" />
      <Sparkle className="fixed top-40 right-12 opacity-40" />
      <Sparkle className="fixed bottom-32 left-8 opacity-30" />
      <Sparkle className="fixed bottom-20 right-20 opacity-50" />

      {/* ── Top bar ── */}
      <div className="w-full flex justify-center pt-8 pb-2">
        <Link href="/" className="flex items-center gap-0.5 text-xl font-black tracking-tight">
          <span style={{ color: '#FFFFFF' }}>Loyal</span>
          <span style={{ color: D.gold }}>Genie</span>
          <span className="text-xs ml-1" style={{ color: D.gold }}>✦</span>
        </Link>
      </div>

      {/* ── Hero text ── */}
      <div className="text-center pt-6 pb-8 px-4">
        <h1 className="text-4xl font-black leading-tight mb-3" style={{ color: D.text }}>
          Let's set up your café's{' '}
          <span style={{ color: D.gold, fontStyle: 'italic' }}>magic.</span>
        </h1>
        <p className="text-sm max-w-sm mx-auto" style={{ color: D.textMuted }}>
          A few details and we'll have your loyalty program, branded app, and counter standee ready to go. Takes about 5 minutes.
        </p>

        {/* Section tabs + progress */}
        <div className="max-w-lg mx-auto mt-7">
          <div className="relative flex items-center justify-between mb-1">
            {/* Line */}
            <div className="absolute left-0 right-0 h-0.5 top-1/2 -translate-y-1/2 z-0 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <motion.div
              className="absolute left-0 h-0.5 top-1/2 -translate-y-1/2 z-0 rounded-full"
              style={{ background: `linear-gradient(90deg, ${D.purple}, ${D.gold})` }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.4 }}
            />
            {SECTIONS.map((sec, i) => {
              const secStartStep = SECTIONS.slice(0, i).reduce((s, x) => s + x.steps, 0)
              const isDone    = step >= secStartStep + sec.steps
              const isActive  = sec.key === section.key
              return (
                <div key={sec.key} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border-2 transition-all"
                    style={{
                      background: isDone ? D.gold : isActive ? D.purple : 'rgba(255,255,255,0.15)',
                      borderColor: isDone ? D.gold : isActive ? D.purple : 'rgba(255,255,255,0.2)',
                    }} />
                  <span className="text-xs font-semibold"
                    style={{ color: isActive ? D.gold : isDone ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>
                    {sec.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Content card ── */}
      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-2xl rounded-2xl p-8"
            style={{ background: D.card, border: `1px solid ${D.cardBorder}` }}
          >
            {/* Step label */}
            <div className="text-xs font-black tracking-widest mb-1" style={{ color: D.gold }}>
              STEP {String(subStep).padStart(2, '0')}
            </div>

            {/* ── BUSINESS STEP 1: Basic Info ── */}
            {step === 0 && (
              <>
                <h2 className="text-2xl font-black mb-1" style={{ color: D.text }}>Tell us about your café</h2>
                <p className="text-sm mb-7" style={{ color: D.textMuted }}>The basics — who you are, what you're called, and how we reach you.</p>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div><DLabel>Name</DLabel><DInput placeholder="e.g. Brew & Co." value={form.name} onChange={set('name')} /></div>
                    <div><DLabel>Tagline</DLabel><DInput placeholder="e.g. Brewco Hospitality Pvt. Ltd." value={form.tagline} onChange={set('tagline')} /></div>
                  </div>
                  <div>
                    <DLabel>Description</DLabel>
                    <DTextarea placeholder="e.g. Where every cup tells a story" value={form.description} onChange={set('description')} />
                  </div>
                  <div>
                    <DLabel>Business Type</DLabel>
                    <DSelect value={form.businessType} onChange={set('businessType')} options={BUSINESS_TYPES} placeholder="Select business type" />
                  </div>

                  <div className="pt-2">
                    <p className="text-base font-bold mb-0.5" style={{ color: D.text }}>Contact information</p>
                    <p className="text-xs mb-4" style={{ color: D.textMuted }}>So we know who to ring when the magic's ready.</p>
                    <div className="space-y-4">
                      <div><DLabel>Owner Name</DLabel><DInput placeholder="Full name" value={form.ownerName} onChange={set('ownerName')} /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><DLabel>Mobile Number</DLabel><DInput placeholder="9XXXX XXXXX" value={form.mobile} onChange={set('mobile')} prefix="+91" /></div>
                        <div><DLabel>WhatsApp Number</DLabel><DInput placeholder="9XXXX XXXXX" value={form.whatsapp} onChange={set('whatsapp')} prefix="+91" /></div>
                      </div>
                      <div><DLabel>Email Address</DLabel><DInput placeholder="you@yourcafe.com" value={form.email} onChange={set('email')} type="email" /></div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── BUSINESS STEP 2: Café Details ── */}
            {step === 1 && (
              <>
                <h2 className="text-2xl font-black mb-1" style={{ color: D.text }}>Café Details</h2>
                <p className="text-sm mb-7" style={{ color: D.textMuted }}>The basics — who you are, what you're called, and how we reach you.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><DLabel>City</DLabel><DInput placeholder="e.g. Hyderabad" value={form.city} onChange={set('city')} /></div>
                    <div><DLabel>Pincode</DLabel><DInput placeholder="6 digit Pincode" value={form.pincode} onChange={set('pincode')} /></div>
                  </div>
                  <div><DLabel>Landmark</DLabel><DInput placeholder="e.g. Opp wow kids school" value={form.landmark} onChange={set('landmark')} /></div>
                  <div><DLabel>Full Address</DLabel><DTextarea placeholder="e.g. street, Area, Building name etc" value={form.address} onChange={set('address')} rows={2} /></div>
                  <div><DLabel>Google Map Link</DLabel><DInput placeholder="Paste Google Map location link" value={form.mapLink} onChange={set('mapLink')} /></div>

                  <div className="pt-2">
                    <p className="text-base font-bold mb-0.5" style={{ color: D.text }}>Timings</p>
                    <p className="text-xs mb-4" style={{ color: D.textMuted }}>So customers know when to visit.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div><DLabel>Operating Hours</DLabel><DInput placeholder="e.g. 8:00 AM – 10:00 PM" value={form.operatingHours} onChange={set('operatingHours')} /></div>
                      <div><DLabel>Weekly Off Days</DLabel><DInput placeholder="e.g. None / Sunday" value={form.weeklyOff} onChange={set('weeklyOff')} /></div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── BRANCHES STEP 1 ── */}
            {step === 2 && (
              <>
                <h2 className="text-2xl font-black mb-1" style={{ color: D.text }}>Add Your Branches</h2>
                <p className="text-sm mb-7" style={{ color: D.textMuted }}>Multiple locations? Add them here. You can always add more later.</p>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.cardBorder}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold" style={{ color: D.text }}>Branch 1 — Main Location</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${D.gold}22`, color: D.gold }}>Primary</span>
                    </div>
                    <div className="space-y-3">
                      <div><DLabel>Branch Name</DLabel><DInput placeholder="e.g. Brew & Bite — Koramangala" value={form.branchName} onChange={set('branchName')} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><DLabel>City</DLabel><DInput placeholder="City" value={form.branchCity} onChange={set('branchCity')} /></div>
                        <div><DLabel>Full Address</DLabel><DInput placeholder="Street, Area" value={form.branchAddress} onChange={set('branchAddress')} /></div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-70"
                    style={{ background: 'transparent', border: `1px dashed ${D.inputBorder}`, color: D.textMuted }}>
                    <Plus className="w-4 h-4" /> Add another branch
                  </button>
                  <p className="text-xs text-center" style={{ color: D.textMuted }}>
                    Or <button className="underline" style={{ color: D.textMuted }}>skip for now</button> — you can add branches from settings later.
                  </p>
                </div>
              </>
            )}

            {/* ── BRANDING STEP 1: Brand Color ── */}
            {step === 3 && (
              <>
                <h2 className="text-2xl font-black mb-1" style={{ color: D.text }}>Choose Your Brand Colour</h2>
                <p className="text-sm mb-7" style={{ color: D.textMuted }}>This will be the primary colour your customers see across the LoyalGenie app.</p>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    {BRAND_COLORS.map(c => (
                      <button key={c} onClick={() => set('brandColor')(c)}
                        className="w-10 h-10 rounded-xl transition-all"
                        style={{
                          background: c,
                          outline: form.brandColor === c ? `3px solid white` : 'none',
                          outlineOffset: '2px',
                          transform: form.brandColor === c ? 'scale(1.15)' : 'scale(1)',
                        }} />
                    ))}
                  </div>
                  {/* Preview card */}
                  <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${D.cardBorder}` }}>
                    <div className="h-16" style={{ background: `linear-gradient(135deg, ${form.brandColor}, ${form.brandColor}88)` }} />
                    <div className="p-5" style={{ background: '#100E2B' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black" style={{ background: form.brandColor }}>
                          ☕
                        </div>
                        <div>
                          <div className="text-base font-black" style={{ color: D.text }}>{form.name || 'Your Café'}</div>
                          <div className="text-xs" style={{ color: D.textMuted }}>{form.tagline || 'Your tagline here'}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {['Spin a Wheel', 'Stamp Card', 'Shake & Win'].map(l => (
                          <div key={l} className="px-3 py-1.5 rounded-full text-[10px] font-semibold" style={{ background: `${form.brandColor}33`, color: form.brandColor }}>
                            {l}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: D.textMuted }}>This is how your loyalty page will look to customers. You can change it anytime from settings.</p>
                </div>
              </>
            )}

            {/* ── BRANDING STEP 2: Logo, Photos, Social ── */}
            {step === 4 && (
              <>
                <h2 className="text-2xl font-black mb-1" style={{ color: D.text }}>Brand Your Cafe</h2>
                <p className="text-sm mb-7" style={{ color: D.textMuted }}>This is what your customers will see inside the LoyalGenie app — your logo, your colours, your vibe.</p>
                <div className="space-y-5">
                  <DUpload label="Logo" hint="Click to upload or drag & drop — PNG/SVG, transparent background preferred" />
                  <DUpload label="Cover Banner Image" hint="Wide images for your app home screen — 1920×600px recommended" />
                  <div className="grid grid-cols-2 gap-4">
                    <DUpload label="Interior Photos" hint="Add a few photos of the inside" multi />
                    <DUpload label="Exterior Photos" hint="Add a few photos outside of the café" multi />
                  </div>

                  <div className="pt-2">
                    <p className="text-base font-bold mb-0.5" style={{ color: D.text }}>Social media handles</p>
                    <p className="text-xs mb-4" style={{ color: D.textMuted }}>We'll link these inside your customer app profile.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div><DLabel>Instagram</DLabel><DInput placeholder="yourhandle" value={form.instagram} onChange={set('instagram')} prefix="@" /></div>
                      <div><DLabel>Facebook</DLabel><DInput placeholder="yourpage" value={form.facebook} onChange={set('facebook')} prefix="@" /></div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                      <div><DLabel>Website</DLabel><DInput placeholder="yoursite.com" value={form.website} onChange={set('website')} prefix="https://" /></div>
                      <div><DLabel>Google Review Link</DLabel><DInput placeholder="Paste your Google review link here" value={form.googleReview} onChange={set('googleReview')} /></div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Navigation buttons ── */}
            <div className={`flex gap-3 mt-8 ${isFirst ? 'justify-end' : 'justify-between'}`}>
              {!isFirst && (
                <button onClick={back}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ border: `1.5px solid rgba(255,255,255,0.2)`, color: D.text, background: 'transparent' }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              {isLast ? (
                <Link href="/vendor/dashboard"
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: D.purple, color: '#fff' }}>
                  Launch My Loyalty Program ✦
                </Link>
              ) : (
                <button onClick={next}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${D.purple}, ${D.purple2})`, color: '#fff' }}>
                  Continue ✦
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="text-center pb-6 text-xs" style={{ color: D.textMuted }}>
        LoyalGenie · Onboarding takes ~5 minutes
      </div>
    </div>
  )
}
