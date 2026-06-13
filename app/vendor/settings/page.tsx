'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Copy, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input, Select } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { business } from '@/lib/mock-data'

const CATEGORIES = ['Café & Bakery', 'Restaurant', 'Salon & Spa', 'Gym & Fitness', 'Retail', 'Pharmacy', 'Pet Clinic', 'Other']

export default function SettingsPage() {
  const [form, setForm] = useState({ ...business })
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-extrabold text-v-text">Settings</h1>
        <p className="text-v-text-2 text-sm mt-1">Manage your business profile and QR code</p>
      </motion.div>

      <div className="space-y-6">
        {/* Business profile */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <h2 className="text-base font-bold text-v-text mb-5">Business Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-v-surface-3 flex items-center justify-center text-4xl border border-v-border">
                  {form.logo}
                </div>
                <div>
                  <div className="text-sm font-bold text-v-text">{form.name}</div>
                  <div className="text-xs text-v-text-3">{form.category}</div>
                  <Button variant="ghost" size="sm" className="mt-1 text-xs">Change Logo</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Business Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                <Select label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <Input label="Tagline" value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} hint="Shown to customers on the loyalty page" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                <Input label="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <Input label="Address" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                <Input label="Business Hours" value={form.hours} onChange={e => setForm(p => ({ ...p, hours: e.target.value }))} />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button variant={saved ? 'secondary' : 'primary'} onClick={handleSave}>
                {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* QR Code */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <h2 className="text-base font-bold text-v-text mb-1">QR Code</h2>
            <p className="text-xs text-v-text-3 mb-5">Print and place this on your counter. Customers scan to access all active campaigns.</p>
            <div className="flex items-start gap-6">
              {/* QR placeholder */}
              <div className="w-32 h-32 rounded-2xl bg-white flex items-center justify-center p-3 shrink-0">
                <svg viewBox="0 0 100 100" width="100" height="100">
                  {/* Simplified QR visual */}
                  {[0,1,2,3,4,5,6].flatMap(r =>
                    [0,1,2,3,4,5,6].map(c => {
                      const inCorner = (r < 3 && c < 3) || (r < 3 && c > 3) || (r > 3 && c < 3)
                      const fill = inCorner ? '#1A1840' : (Math.random() > 0.5 ? '#1A1840' : 'white')
                      return <rect key={`${r}-${c}`} x={c * 14 + 1} y={r * 14 + 1} width="12" height="12" fill={fill} rx="1" />
                    })
                  )}
                  <rect x="1" y="1" width="40" height="40" fill="none" stroke="#1A1840" strokeWidth="3" rx="4" />
                  <rect x="59" y="1" width="40" height="40" fill="none" stroke="#1A1840" strokeWidth="3" rx="4" />
                  <rect x="1" y="59" width="40" height="40" fill="none" stroke="#1A1840" strokeWidth="3" rx="4" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs text-v-text-3 mb-1">Business URL</div>
                <div className="flex items-center gap-2 mb-4">
                  <code className="text-xs text-v-purple bg-v-surface-2 px-3 py-1.5 rounded-lg">loyalgenie.in/b/brew-bite</code>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="w-3.5 h-3.5 text-v-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm"><Download className="w-3.5 h-3.5" /> Download QR</Button>
                  <Button variant="secondary" size="sm">Print Ready</Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
