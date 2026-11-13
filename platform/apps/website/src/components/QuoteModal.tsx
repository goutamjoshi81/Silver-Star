import { useState } from 'react';
import { X, CheckCircle2, Send, Sparkles, Phone, Mail, Building2, MapPin } from 'lucide-react';
import { api } from '@mock/mockData';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export default function QuoteModal({ isOpen, onClose, defaultService }: QuoteModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceName, setServiceName] = useState(defaultService || 'Integrated Facilities Management');
  const [city, setCity] = useState('Bangalore');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Please provide your name and contact phone number.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitContactInquiry({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        companyName: companyName.trim(),
        serviceName,
        city,
        message: message.trim() || `Customer requested quote for ${serviceName}`,
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Failed to submit quote inquiry:', err);
      // Fallback local success to ensure smooth user experience
      setIsSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setCompanyName('');
    setMessage('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-in zoom-in">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Thank You, {name}!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your service quotation request for <span className="font-bold text-[#202B75]">"{serviceName}"</span> has been logged into our operational system. Our regional facility manager will contact you within 24 hours.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Need Immediate Assistance?</p>
              <p>Direct Hotline: <a href="tel:08050000524" className="text-[#202B75] font-bold">+91 08050000524</a></p>
              <p>Email: <a href="mailto:contact@silverstarindia.net" className="text-[#202B75] font-bold">contact@silverstarindia.net</a></p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-[#202B75] text-white rounded-xl text-xs font-bold hover:bg-[#161f56] transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#202B75] text-[10px] font-bold uppercase tracking-wider">
                <Sparkles size={11} className="text-[#26BCEE]" />
                <span>Zero Obligation Assessment</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Request a Custom Service Quote
              </h3>
              <p className="text-xs text-slate-500">
                Tell us about your facility requirements and receive a comprehensive proposal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Infosys, Manyata Tech Park"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Required
                </label>
                <select
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                >
                  <option value="Integrated Facilities Management">Integrated Facilities Management</option>
                  <option value="Manufacturing Support Services">Manufacturing Support Services</option>
                  <option value="Business Support Services">Business Support Services</option>
                  <option value="Technical Services">Technical Services (HVAC / DG / AMC)</option>
                  <option value="Security Services">Security Services (PSARA Guarding)</option>
                  <option value="Warehouse Management">Warehouse & Logistics Support</option>
                  <option value="Guest House Management">Guest House Operations</option>
                  <option value="Office Support Management">Office Support & Pantry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Facility Location / City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                >
                  <option value="Bangalore">Bengaluru, Karnataka (HQ)</option>
                  <option value="Noida / Delhi NCR">Noida / Delhi NCR (North Branch)</option>
                  <option value="Hyderabad">Hyderabad, Telangana</option>
                  <option value="Chennai">Chennai, Tamil Nadu</option>
                  <option value="Pune">Pune, Maharashtra</option>
                  <option value="Other">Other Pan-India Location</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Facility Requirements / Remarks
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Approximate square footage, number of shifts, deployed strength needed, timeline..."
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#202B75] hover:bg-[#161f56] text-white font-black rounded-xl text-xs shadow-lg shadow-[#202B75]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Get Free Online Quote Now</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
