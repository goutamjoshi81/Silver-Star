import { useState, useEffect } from 'react'
import { DEPARTMENTS, api } from '@mock/mockData'
import {
  FileText, CheckCircle, Clock, XCircle, Download, Search,
  ChevronDown, ChevronUp, Eye, Check, X, ShieldCheck
} from 'lucide-react'

export default function Documents() {
  const [employees, setEmployees] = useState<any[]>([])
  const [docsState, setDocsState] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Approved' | 'Pending'>('All')
  const [expandedEmpId, setExpandedEmpId] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [empList, docList] = await Promise.all([
        api.getEmployees(),
        api.getDocuments()
      ])
      setEmployees(empList)
      setDocsState(docList)
      if (empList.length > 0 && !expandedEmpId) {
        setExpandedEmpId(empList[0].id)
      }
    } catch (err) {
      console.error('Failed to load documents from database:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const approved = docsState.filter(d => d.status === 'Approved').length
  const pending = docsState.filter(d => d.status === 'Pending').length
  const rejected = docsState.filter(d => d.status === 'Rejected').length

  const handleApprove = async (docId: string, empName: string, docType: string) => {
    try {
      await api.reviewDocument(docId, 'Approved')
      setDocsState(prev => prev.map(d => d.id === docId ? { ...d, status: 'Approved' } : d))
      setActionFeedback(`Approved ${docType} for ${empName} (Saved to PostgreSQL)`)
    } catch (err: any) {
      setActionFeedback(`Error approving: ${err.message}`)
    }
    setTimeout(() => setActionFeedback(null), 3000)
  }

  const handleReject = async (docId: string, empName: string, docType: string) => {
    try {
      await api.reviewDocument(docId, 'Rejected', 'Document invalid or illegible')
      setDocsState(prev => prev.map(d => d.id === docId ? { ...d, status: 'Rejected' } : d))
      setActionFeedback(`Rejected ${docType} for ${empName} (Saved to PostgreSQL)`)
    } catch (err: any) {
      setActionFeedback(`Error rejecting: ${err.message}`)
    }
    setTimeout(() => setActionFeedback(null), 3000)
  }

  // Categorize documents by Employee
  const employeesWithDocs = employees.map(emp => {
    const empDocs = docsState.filter(d => d.employeeId === emp.id)
    const dept = DEPARTMENTS.find(d => d.id === emp.departmentId)
    const approvedCount = empDocs.filter(d => d.status === 'Approved').length
    const pendingCount = empDocs.filter(d => d.status === 'Pending').length
    return {
      ...emp,
      departmentName: dept?.name || 'Operations',
      docs: empDocs,
      approvedCount,
      pendingCount,
      totalDocs: empDocs.length,
    }
  }).filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (selectedStatus === 'Approved') {
      return emp.pendingCount === 0 && emp.totalDocs > 0
    }
    if (selectedStatus === 'Pending') {
      return emp.pendingCount > 0
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#202B75]">Document Review by Employee Dossier</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Centralized document governance categorized by employee: Aadhaar, PAN, Police Verification & Bank Passbooks
          </p>
        </div>
        <span className="text-xs font-bold text-[#202B75] bg-[#202B75]/10 px-3 py-1.5 rounded-lg">
          {employeesWithDocs.length} Employee Dossiers
        </span>
      </div>

      {actionFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between animate-in fade-in">
          <span className="font-semibold flex items-center gap-2">
            <Check size={14} className="text-emerald-600" /> {actionFeedback}
          </span>
          <button onClick={() => setActionFeedback(null)} className="text-[11px] underline">Close</button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{approved}</p>
            <p className="text-xs text-emerald-700 font-semibold">Approved Documents</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{pending}</p>
            <p className="text-xs text-amber-700 font-semibold">Pending Review</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{rejected}</p>
            <p className="text-xs text-red-600 font-semibold">Rejected / Resubmit</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search employee by name, code or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#202B75]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-semibold">Status:</span>
          <div className="flex gap-1.5">
            {(['All', 'Pending', 'Approved'] as const).map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedStatus === status
                    ? 'bg-[#202B75] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'All' && 'All Staff'}
                {status === 'Pending' && 'Pending Verification'}
                {status === 'Approved' && 'Fully Approved'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categorized Employee Dossiers */}
      <div className="space-y-4">
        {employeesWithDocs.map(emp => {
          const isExpanded = expandedEmpId === emp.id
          return (
            <div
              key={emp.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all"
            >
              {/* Employee Category Header */}
              <div
                onClick={() => setExpandedEmpId(isExpanded ? null : emp.id)}
                className="p-4 bg-gray-50/70 hover:bg-gray-100/70 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#202B75] text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                    {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-gray-900">{emp.name}</h3>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-gray-200 rounded text-gray-800">
                        {emp.employeeCode}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">({emp.departmentName})</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="font-mono">📞 {emp.phone}</span>
                      <span>•</span>
                      <span>Joining: {emp.joiningDate || '2024-01-15'}</span>
                      <span>•</span>
                      <span className={`font-semibold ${emp.kycStatus === 'Verified' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        KYC: {emp.kycStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                      {emp.approvedCount} Approved
                    </span>
                    {emp.pendingCount > 0 && (
                      <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                        <Clock size={12} /> {emp.pendingCount} Pending
                      </span>
                    )}
                    <span className="text-gray-400 font-medium">({emp.totalDocs} files total)</span>
                  </div>

                  <button className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Categorized Documents for This Employee */}
              {isExpanded && (
                <div className="p-4 bg-white">
                  {emp.docs.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 italic">No uploaded documents on record for this employee.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {emp.docs.map(doc => (
                        <div
                          key={doc.id}
                          className="border border-gray-200 rounded-xl p-3.5 flex flex-col justify-between gap-3 hover:border-[#202B75]/40 transition-colors bg-white shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <div className="p-2 rounded-lg bg-[#202B75]/10 text-[#202B75] mt-0.5">
                                <FileText size={18} />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-900">{doc.documentType}</h4>
                                <p className="text-[11px] font-mono text-gray-500 truncate max-w-[200px]">
                                  {doc.fileName}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  Uploaded: {doc.uploadDate}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                doc.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : doc.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              {doc.status === 'Approved' ? <Check size={10} /> : doc.status === 'Pending' ? <Clock size={10} /> : <X size={10} />}
                              {doc.status}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                            <button
                              onClick={() => alert(`Super Admin Preview: Opening encrypted copy of ${doc.documentType} (${doc.fileName})`)}
                              className="flex items-center gap-1 text-gray-600 hover:text-[#202B75] font-semibold text-[11px]"
                            >
                              <Eye size={13} /> View File
                            </button>

                            <div className="flex items-center gap-1.5">
                              {doc.status !== 'Approved' && (
                                <button
                                  onClick={() => handleApprove(doc.id, emp.name, doc.documentType)}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[11px] font-bold hover:bg-emerald-700 flex items-center gap-1"
                                >
                                  <Check size={11} /> Approve
                                </button>
                              )}
                              {doc.status !== 'Rejected' && (
                                <button
                                  onClick={() => handleReject(doc.id, emp.name, doc.documentType)}
                                  className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-[11px] font-semibold hover:bg-red-100 flex items-center gap-1"
                                >
                                  <X size={11} /> Reject
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
