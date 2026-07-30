import re

with open('components/InvoiceFormView.tsx', 'r') as f:
    content = f.read()

# Replace button content for Save Customer
content = re.sub(
    r'<button \s*onClick=\{handleSaveCustomerOnly\}\s*className="flex-1 bg-\[\#1E293B\] border border-white/10 hover:bg-\[\#1E293B\]/80 hover:border-blue-500/50 text-white font-bold py-4 text-sm rounded-xl transition-colors shadow-lg uppercase tracking-wider flex items-center justify-center gap-2"\s*>',
    '''<button 
                 onClick={handleSaveCustomerOnly}
                 disabled={isSaving}
                 className={`flex-1 bg-[#1E293B] border border-white/10 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1E293B]/80 hover:border-blue-500/50'} text-white font-bold py-4 text-sm rounded-xl transition-colors shadow-lg uppercase tracking-wider flex items-center justify-center gap-2`}
               >''',
    content
)

content = re.sub(
    r'<span>💾</span> Save Customer & Prescription',
    '''{isSaving ? (
                   <>
                     <span className="animate-spin">⏳</span> {saveStatus || "Saving..."}
                   </>
                 ) : (
                   <>
                     <span>💾</span> Save Customer & Prescription
                   </>
                 )}''',
    content
)

content = re.sub(
    r'<button \s*onClick=\{handleSaveCustomerOnly\}\s*className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 text-sm rounded-xl transition-colors shadow-lg shadow-blue-900/20 uppercase tracking-wider flex items-center justify-center gap-2"\s*>',
    '''<button 
                 onClick={handleSaveCustomerOnly}
                 disabled={isSaving}
                 className={`flex-1 bg-blue-600 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'} text-white font-bold py-4 text-sm rounded-xl transition-colors shadow-lg shadow-blue-900/20 uppercase tracking-wider flex items-center justify-center gap-2`}
               >''',
    content
)

content = re.sub(
    r'<span>🧾</span> Continue To Billing',
    '''{isSaving ? (
                   <>
                     <span className="animate-spin">⏳</span> Continuing...
                   </>
                 ) : (
                   <>
                     <span>🧾</span> Continue To Billing
                   </>
                 )}''',
    content
)


# Replace confirm button
content = re.sub(
    r'<button \s*onClick=\{\(\) => \{ setShowConfirmation\(false\); handleSubmit\(\); \}\}\s*className="flex-\[2\] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 text-xs rounded-xl shadow-lg shadow-emerald-900/20 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"\s*>',
    '''<button 
                onClick={(e) => { e.preventDefault(); if (!isSaving && !isInvoiceSaved) handleSubmit(); }}
                disabled={isSaving || isInvoiceSaved}
                className={`flex-[2] bg-emerald-600 ${isSaving || isInvoiceSaved ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500'} text-white font-black py-3 text-xs rounded-xl shadow-lg shadow-emerald-900/20 transition-colors uppercase tracking-widest flex items-center justify-center gap-2`}
              >''',
    content
)

content = re.sub(
    r'<span>✅</span> Confirm & Create Invoice',
    '''{isSaving ? (
                  <>
                    <span className="animate-spin">⏳</span> {saveStatus || "Saving..."}
                  </>
                ) : isInvoiceSaved ? (
                  <>
                    <span>✅</span> Saved Successfully
                  </>
                ) : (
                  <>
                    <span>✅</span> Confirm & Create Invoice
                  </>
                )}''',
    content
)

# And action bar buttons
content = re.sub(
    r'<button \s*onClick=\{handleInitiateSubmit\}\s*className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 text-xs rounded-lg shadow-lg shadow-emerald-900/20 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 shrink-0"\s*>',
    '''<button 
             onClick={handleInitiateSubmit}
             disabled={isSaving || isInvoiceSaved}
             className={`bg-emerald-600 ${isSaving || isInvoiceSaved ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-500'} text-white font-black px-6 py-3 text-xs rounded-lg shadow-lg shadow-emerald-900/20 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 shrink-0`}
           >''',
    content
)


with open('components/InvoiceFormView.tsx', 'w') as f:
    f.write(content)

