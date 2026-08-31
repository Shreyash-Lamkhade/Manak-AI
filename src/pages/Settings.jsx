import { useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'
import Toast from '../components/Toast'
import { mockUser } from '../data/mockData'

const DEPARTMENTS = [
  'Ministry of Commerce & Industry',
  'Ministry of Finance',
  'Ministry of Road Transport & Highways',
  'Ministry of Housing & Urban Affairs',
  'Ministry of Power',
  'Ministry of Jal Shakti',
  'Ministry of Defence',
  'Central Public Works Department (CPWD)',
  'National Highways Authority of India (NHAI)',
  'Railways Board',
]

export default function Settings() {
  const [form, setForm] = useState({
    name: mockUser.name,
    department: mockUser.department,
    designation: mockUser.designation,
    language: 'en',
    emailNotifications: true,
    qcoAlerts: true,
    amendmentAlerts: false,
  })
  const [toast, setToast] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const handleSave = () => setToast({ message: 'Settings saved successfully.', type: 'success' })

  return (
    <Layout title="Settings">
      <div className="max-w-xl space-y-6">

        <Card className="p-5">
          <h3 className="text-[16px] font-semibold text-[#111111] mb-4">Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#111111] mb-1.5" htmlFor="name">Full name</label>
              <input
                id="name" type="text" value={form.name}
                onChange={e => set('name', e.target.value)}
                className="w-full px-3 py-2.5 text-[14px] border border-[#DDD9D0] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#16294D]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#111111] mb-1.5" htmlFor="dept">Department</label>
              <select
                id="dept" value={form.department}
                onChange={e => set('department', e.target.value)}
                className="w-full px-3 py-2.5 text-[14px] border border-[#DDD9D0] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#16294D]"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#111111] mb-1.5" htmlFor="desig">Designation</label>
              <input
                id="desig" type="text" value={form.designation}
                onChange={e => set('designation', e.target.value)}
                className="w-full px-3 py-2.5 text-[14px] border border-[#DDD9D0] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#16294D]"
              />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-[16px] font-semibold text-[#111111] mb-4">Language Preference</h3>
          <fieldset>
            <legend className="text-[13px] text-[#4B4845] mb-3">Interface language</legend>
            <div className="flex gap-4">
              {[{ val: 'en', label: 'English' }, { val: 'hi', label: 'हिंदी (Hindi)' }].map(l => (
                <label key={l.val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio" name="language" value={l.val}
                    checked={form.language === l.val}
                    onChange={() => {
                      set('language', l.val)
                      localStorage.setItem('lang', l.val === 'hi' ? 'HI' : 'EN')
                      window.dispatchEvent(new StorageEvent('storage', { key: 'lang', newValue: l.val === 'hi' ? 'HI' : 'EN' }))
                    }}
                    className="accent-[#16294D]"
                  />
                  <span className="text-[14px] text-[#111111]">{l.label}</span>
                </label>
              ))}
            </div>
            {form.language === 'hi' && (
              <p className="mt-3 text-[12px] text-[#B8862B] bg-[#FDF2DC] border border-[#EDD087] rounded px-3 py-2">
                हिंदी अनुवाद सक्रिय है। मुख्य नेविगेशन और लेबल हिंदी में दिखाई देंगे।
              </p>
            )}
          </fieldset>
        </Card>

        <Card className="p-5">
          <h3 className="text-[16px] font-semibold text-[#111111] mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive updates via email' },
              { key: 'qcoAlerts', label: 'QCO deadline alerts', desc: 'Get alerted 30 days before enforcement dates' },
              { key: 'amendmentAlerts', label: 'Standard amendment alerts', desc: 'Alert when saved standards are amended' },
            ].map(n => (
              <div key={n.key} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] font-medium text-[#111111]">{n.label}</p>
                  <p className="text-[12px] text-[#4B4845]">{n.desc}</p>
                </div>
                <button
                  role="switch" aria-checked={form[n.key]}
                  onClick={() => set(n.key, !form[n.key])}
                  className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#16294D] focus:ring-offset-2 shrink-0
                    ${form[n.key] ? 'bg-[#16294D]' : 'bg-[#C8C4BB]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                    ${form[n.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-[16px] font-semibold text-[#111111] mb-4">About MANAK-AI</h3>
          <dl className="space-y-2 text-[13px]">
            <div className="flex gap-4"><dt className="text-[#4B4845] w-32 shrink-0">Version</dt><dd className="font-medium text-[#111111]">1.0.0</dd></div>
            <div className="flex gap-4"><dt className="text-[#4B4845] w-32 shrink-0">Standards DB</dt><dd className="font-medium text-[#111111]">63 Indian Standards · 8 categories</dd></div>
            <div className="flex gap-4"><dt className="text-[#4B4845] w-32 shrink-0">QCO Products</dt><dd className="font-medium text-[#111111]">35 products · 31 mandatory</dd></div>
            <div className="flex gap-4"><dt className="text-[#4B4845] w-32 shrink-0">Data last updated</dt><dd className="font-medium text-[#111111]">August 2026</dd></div>
          </dl>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave}>Save settings</Button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </Layout>
  )
}
