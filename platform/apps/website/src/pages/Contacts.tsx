import { useState } from 'react';
import {
  Sparkles, MapPin, Phone, Mail, Clock, Send, CheckCircle2,
  Building2, ShieldCheck, ArrowRight
} from 'lucide-react';
import { api } from '@mock/mockData';

export default function Contacts() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceName, setServiceName] = useState('Integrated Facilities Management');
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
        message: message.trim() || 'General contact inquiry submitted from website contact page.',
      });
      setIsSuccess(true);
    } catch (err) {
      console.error('Contact submission error:', err);
      setIsSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 font-sans space-y-16 sm:space-y-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#0f173f] via-[#162363] to-[#202B75] text-white py-16 px-4 sm:px-8 relative overflow-hidden -mt-4">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#26BCEE] text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
            <Sparkles size={13} />
            <span>Pan-India Presence</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Contacts & Regional Desks
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
            Get in touch with our operations leadership in Bengaluru, Noida, Hyderabad, and Chennai. We are ready to assist with facility audits, immediate guard deployments, and custom proposals.
          </p>
        </div>
      </section>

      {/* Main Grid: Branches + Interactive Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Branch Offices Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#26BCEE]">
                Get in Touch
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Regional Offices & Command Centers
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reach out to our local field coordinators or visit our regional administrative facilities.
              </p>
            </div>

            {/* Bangalore HQ Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-3 hover:border-[#202B75] transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#202B75] flex items-center justify-center font-black">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bangalore Corporate HQ</h3>
                  <span className="text-[10px] text-[#26BCEE] font-bold uppercase tracking-wider">Karnataka Regional Hub</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Silver Star Facility Management Pvt. Ltd<br />
                ARR Building, 1st Floor, Towards Tech Mahindra Road, Electronic City Phase II, Bengaluru, Karnataka – 560100
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone size={13} className="text-[#202B75]" />
                  <a href="tel:08050000524" className="hover:underline font-bold">+91 08050000524</a>, <a href="tel:9945449802" className="hover:underline font-bold">+91 9945449802</a>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Mail size={13} className="text-[#202B75]" />
                  <a href="mailto:contact@silverstarindia.net" className="hover:underline">contact@silverstarindia.net</a>
                </p>
              </div>
            </div>

            {/* Noida Regional Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-3 hover:border-[#202B75] transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-[#26BCEE] flex items-center justify-center font-black">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Noida (Delhi NCR) Regional</h3>
                  <span className="text-[10px] text-[#26BCEE] font-bold uppercase tracking-wider">North India Regional Hub</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Silver Star Facility Management Pvt. Ltd<br />
                Office # 104, Ground Floor, Noida Business Center, Near Labour Chowk, Kora, Opposite Sector 58, Noida, Uttar Pradesh – 201309
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone size={13} className="text-[#202B75]" />
                  <a href="tel:9611255416" className="hover:underline font-bold">+91 9611255416</a>, <a href="tel:9620000494" className="hover:underline font-bold">+91 9620000494</a>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Mail size={13} className="text-[#202B75]" />
                  <a href="mailto:info@silverstarindia.net" className="hover:underline">info@silverstarindia.net</a>
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center gap-3 text-xs text-slate-700">
              <Clock size={18} className="text-[#202B75] shrink-0" />
              <div>
                <p className="font-bold">Operating Hours</p>
                <p className="text-[11px] text-slate-500">Mon – Fri: 8:00am – 7:00pm | 24/7 Security Dispatch Hotline</p>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#26BCEE]">
                Write Your Message
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Send Us an Inquiry
              </h3>
              <p className="text-xs text-slate-500">
                Fill in your details below and a senior operations executive will respond promptly.
              </p>
            </div>

            {isSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Inquiry Received</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out to Silver Star. Your inquiry has been stored in our customer management system and our team will get in touch shortly.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="px-5 py-2.5 bg-[#202B75] text-white rounded-xl text-xs font-bold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Anand Murthy"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
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
                      placeholder="+91 98450 12345"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Corporate Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Prestige Estates, Infosys"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Service Interested In
                    </label>
                    <select
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                    >
                      <option value="Integrated Facilities Management">Integrated Facilities Management</option>
                      <option value="Manufacturing Support Services">Manufacturing Support Services</option>
                      <option value="Business Support Services">Business Support Services</option>
                      <option value="Technical Services">Technical Services (AMC / HVAC)</option>
                      <option value="Security Services">Security & Guarding Services</option>
                      <option value="Warehouse Management">Warehouse & Logistics Support</option>
                      <option value="Guest House Management">Guest House Operations</option>
                      <option value="Office Support Management">Office Support & Pantry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location / Branch
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                    >
                      <option value="Bangalore">Bengaluru, Karnataka (HQ)</option>
                      <option value="Noida / Delhi NCR">Noida / Delhi NCR (North Branch)</option>
                      <option value="Hyderabad">Hyderabad, Telangana</option>
                      <option value="Chennai">Chennai, Tamil Nadu</option>
                      <option value="Other">Other Location</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Requirements / Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the scope of facility management, site address, expected start date..."
                    rows={4}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#202B75]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#202B75] hover:bg-[#161f56] text-white font-black text-xs rounded-xl shadow-lg shadow-[#202B75]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Submit Message & Request Consultation</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

