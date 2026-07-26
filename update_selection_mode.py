import re

with open('src/pages/ApplicantsViewer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add selectionMode state
state_vars = """
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
"""
content = content.replace("  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());", state_vars)

# 2. Update renderApplicantCard to only show checkboxes if selectionMode is true
old_card_checkbox = """        {(app.status === 'pending' || app.status === 'shortlisted') && (
          <div className="absolute top-4 right-4 z-10">
            <input type="checkbox" checked={selectedAppIds.has(app._id)} onChange={() => handleSelectApplicant(app._id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
          </div>
        )}"""
new_card_checkbox = """        {selectionMode && (app.status === 'pending' || app.status === 'shortlisted') && (
          <div className="absolute top-4 right-4 z-10">
            <input type="checkbox" checked={selectedAppIds.has(app._id)} onChange={() => handleSelectApplicant(app._id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
          </div>
        )}"""
content = content.replace(old_card_checkbox, new_card_checkbox)

# 3. Update Bulk Actions rendering
old_bulk = """        {/* Bulk Actions */}
        {filteredApplicants.length > 0 && activeTab !== 'rejected' && activeTab !== 'approved' && (
          <div className="bg-white border border-blue-200 rounded-lg p-3 mb-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 ml-2">
              <Button size="sm" variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50" onClick={handleSelectAll}>
                {selectedAppIds.size === filteredApplicants.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedAppIds.size > 0 && (
                <span className="text-sm font-medium text-slate-700">
                  <span className="font-bold text-blue-600">{selectedAppIds.size}</span> selected
                </span>
              )}
            </div>
            
            {selectedAppIds.size > 0 && (
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
            )}
          </div>
        )}"""

new_bulk = """        {/* Bulk Actions */}
        {filteredApplicants.length > 0 && activeTab !== 'rejected' && activeTab !== 'approved' && (
          <div className="bg-white border border-blue-200 rounded-lg p-3 mb-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
            {!selectionMode ? (
              <div className="flex items-center gap-3 ml-2 w-full justify-between">
                <span className="text-sm text-slate-500 font-medium">Select applicants to perform bulk actions</span>
                <Button size="sm" variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50" onClick={() => setSelectionMode(true)}>
                  Select
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 ml-2">
                  <Button size="sm" variant="outline" className="text-blue-700 border-blue-200 hover:bg-blue-50" onClick={handleSelectAll}>
                    {selectedAppIds.size === filteredApplicants.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-sm font-medium text-slate-700">
                    <span className="font-bold text-blue-600">{selectedAppIds.size}</span> selected
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-slate-600" onClick={() => {
                    setSelectionMode(false);
                    setSelectedAppIds(new Set());
                  }}>Cancel</Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled={selectedAppIds.size === 0} onClick={() => {
                    Array.from(selectedAppIds).forEach(id => handleUpdateApplicantStatus(id, 'rejected'));
                    setSelectedAppIds(new Set());
                    setSelectionMode(false);
                  }}>Bulk Decline</Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={selectedAppIds.size === 0} onClick={() => setApprovalModal({ isOpen: true, appIds: Array.from(selectedAppIds), message: 'Welcome aboard! Here are your next steps...' })}>
                    Bulk Approve
                  </Button>
                </div>
              </>
            )}
          </div>
        )}"""

content = content.replace(old_bulk, new_bulk)

with open('src/pages/ApplicantsViewer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
