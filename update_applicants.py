import re

with open('src/pages/ApplicantsViewer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variables
state_vars = """
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());
  const [approvalModal, setApprovalModal] = useState<{ isOpen: boolean, appIds: string[], message: string }>({ isOpen: false, appIds: [], message: 'Welcome aboard! Here are your next steps...' });
  const [isApproving, setIsApproving] = useState(false);

  const handleSelectApplicant = (id: string) => {
    const newSet = new Set(selectedAppIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedAppIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedAppIds.size === filteredApplicants.length) {
      setSelectedAppIds(new Set());
    } else {
      setSelectedAppIds(new Set(filteredApplicants.map(a => a._id)));
    }
  };

  const handleConfirmApproval = async () => {
    setIsApproving(true);
    try {
      for (const appId of approvalModal.appIds) {
         await handleUpdateApplicantStatus(appId, 'approved');
         // We can integrate actual message sending later using the message field
      }
      setApprovalModal({ isOpen: false, appIds: [], message: '' });
      setSelectedAppIds(new Set());
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsApproving(false);
    }
  };
"""
content = content.replace("  const API_BASE =", state_vars + "\n  const API_BASE =")

# 2. Update renderApplicantCard container
old_card_start = '      <div key={app._id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative flex flex-col h-full shrink-0">'
new_card_start = """      <div key={app._id} className={`bg-white p-4 rounded-lg border shadow-sm relative flex flex-col h-full shrink-0 ${selectedAppIds.has(app._id) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}>
        {(app.status === 'pending' || app.status === 'shortlisted') && (
          <div className="absolute top-4 right-4 z-10">
            <input type="checkbox" checked={selectedAppIds.has(app._id)} onChange={() => handleSelectApplicant(app._id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
          </div>
        )}"""
content = content.replace(old_card_start, new_card_start)

# 3. Update applicant actions
old_actions = """        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid gap-2 w-full grid-cols-3">
          <Button variant="outline" size="sm" className="w-full text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-sm" onClick={() => setChatApplicantEmail(app.applicantEmail)}>
            <Mail className="w-4 h-4 mr-1.5" /> Chat
          </Button>
          <Button variant="outline" size="sm" className="w-full text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 shadow-sm" onClick={() => setSlidingApplicant({ email: app.applicantEmail, app, post })}>
            View Profile
          </Button>
          
          {/* Third slot for status actions */}
          <div className="w-full h-full">
            {(app.status === 'pending' || !app.status) && (
              <Button variant="outline" size="sm" className="w-full h-full text-purple-700 border-purple-200 hover:bg-purple-50 shadow-sm" onClick={() => handleUpdateApplicantStatus(app._id, 'shortlisted')}>
                Mark
              </Button>
            )}
            {app.status === 'shortlisted' && (
              <Button variant="outline" size="sm" className="w-full h-full text-slate-600 border-slate-300 hover:bg-slate-100 shadow-sm" onClick={() => handleUpdateApplicantStatus(app._id, 'pending')}>
                Unmark
              </Button>
            )}
            {(app.status === 'rejected' || app.status === 'approved' || app.status === 'paid' || app.status === 'disputed') && (
              <Button variant="outline" size="sm" disabled className="w-full h-full text-slate-400 border-slate-200 shadow-sm opacity-50 cursor-not-allowed">
                Mark
              </Button>
            )}
          </div>
        </div>"""

new_actions = """        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2 w-full">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="w-full h-full">
              {(app.status === 'pending' || !app.status) && (
                <Button variant="outline" size="sm" className="w-full h-full text-purple-700 border-purple-200 hover:bg-purple-50 shadow-sm" onClick={() => handleUpdateApplicantStatus(app._id, 'shortlisted')}>
                  Mark
                </Button>
              )}
              {app.status === 'shortlisted' && (
                <Button variant="outline" size="sm" className="w-full h-full text-slate-600 border-slate-300 hover:bg-slate-100 shadow-sm" onClick={() => handleUpdateApplicantStatus(app._id, 'pending')}>
                  Unmark
                </Button>
              )}
              {(app.status === 'rejected' || app.status === 'approved' || app.status === 'paid' || app.status === 'disputed') && (
                <Button variant="outline" size="sm" disabled className="w-full h-full text-slate-400 border-slate-200 shadow-sm opacity-50 cursor-not-allowed">
                  Mark
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-sm" onClick={() => setChatApplicantEmail(app.applicantEmail)}>
              <Mail className="w-4 h-4 mr-1.5" /> Chat
            </Button>
            <Button variant="outline" size="sm" className="w-full text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 shadow-sm" onClick={() => setSlidingApplicant({ email: app.applicantEmail, app, post })}>
              View
            </Button>
          </div>
          
          {/* Row 2: Approve / Decline */}
          {(app.status === 'pending' || app.status === 'shortlisted') && (
            <div className="grid grid-cols-2 gap-2 w-full mt-1">
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm" onClick={() => setApprovalModal({ isOpen: true, appIds: [app._id], message: 'Welcome aboard! Here are your next steps...' })}>
                Approve
              </Button>
              <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm" onClick={() => handleUpdateApplicantStatus(app._id, 'rejected')}>
                Decline
              </Button>
            </div>
          )}
        </div>"""

content = content.replace(old_actions, new_actions)


# 4. Add Bulk Actions & Modal above the grid
bulk_actions_html = """
        {/* Bulk Actions */}
        {selectedAppIds.size > 0 && activeTab !== 'rejected' && activeTab !== 'approved' && (
          <div className="bg-white border border-blue-200 rounded-lg p-3 mb-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
            <span className="text-sm font-medium text-slate-700 ml-2">
              <span className="font-bold text-blue-600">{selectedAppIds.size}</span> selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-slate-600" onClick={() => setSelectedAppIds(new Set())}>Cancel</Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
                Array.from(selectedAppIds).forEach(id => handleUpdateApplicantStatus(id, 'rejected'));
                setSelectedAppIds(new Set());
              }}>Bulk Decline</Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setApprovalModal({ isOpen: true, appIds: Array.from(selectedAppIds), message: 'Welcome aboard! Here are your next steps...' })}>
                Bulk Approve
              </Button>
            </div>
          </div>
        )}

        {/* Approved Tab Bulk Escrow */}
        {activeTab === 'approved' && filteredApplicants.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-blue-900 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" /> Ready to Hire!</h3>
              <p className="text-sm text-blue-700 mt-1">You have {filteredApplicants.length} approved applicants. Fund escrow to finalize hiring.</p>
            </div>
            <Button className="mt-3 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-5 rounded-xl shadow-md flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Bulk Escrow & Hire All (KES {(filteredApplicants.length * (post?.escrowAmount || post?.opportunity?.escrowAmount || 0)).toLocaleString()})
            </Button>
          </div>
        )}
"""

# Replace the start of the list rendering block
target_str = "{loadingApplicants ?"
content = content.replace(target_str, bulk_actions_html + "\n        " + target_str)


# 5. Add the Approval Modal at the end of the return statement
modal_html = """
      {/* Approval Modal */}
      {approvalModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Confirm Approval</h3>
              <Button variant="ghost" size="icon" onClick={() => setApprovalModal({ ...approvalModal, isOpen: false })} className="h-8 w-8 rounded-full">
                <X className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                You are about to approve <strong>{approvalModal.appIds.length}</strong> applicant{approvalModal.appIds.length > 1 ? 's' : ''}. 
                Send them an automated onboarding message:
              </p>
              <textarea 
                className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={approvalModal.message}
                onChange={e => setApprovalModal({ ...approvalModal, message: e.target.value })}
                placeholder="Write your onboarding instructions here..."
              ></textarea>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setApprovalModal({ ...approvalModal, isOpen: false })}>Cancel</Button>
              <Button onClick={handleConfirmApproval} disabled={isApproving} className="bg-green-600 hover:bg-green-700 text-white font-medium">
                {isApproving ? 'Approving...' : `Approve & Send Message`}
              </Button>
            </div>
          </div>
        </div>
      )}
"""
content = content.replace("    </div>\n  );\n}", modal_html + "\n    </div>\n  );\n}")

with open('src/pages/ApplicantsViewer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
