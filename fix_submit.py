import re

with open('components/InvoiceFormView.tsx', 'r') as f:
    content = f.read()

# Replace handleSubmit
old_handleSubmit_pattern = r'const handleSubmit = async \(\) => \{.*?(?=  if \(savedInvoice\) \{)'
new_handleSubmit = """const handleSubmit = async () => {
    if (!customer) return;
    if (isSaving || isInvoiceSaved) return;

    setIsSaving(true);
    setSaveStatus('Saving Sales Order...');

    const finalAdvance = type === 'Direct Sale' ? grandTotal : advanceAmount;
    const finalBalance = grandTotal - finalAdvance;

    const newInvoice = {
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(),
      type,
      customerId: customer.id,
      prescriptionId: prescription?.id,
      items,
      subTotal,
      totalDiscount,
      grandTotal,
      paymentMode,
      paymentDetail,
      advanceAmount: finalAdvance,
      balanceAmount: finalBalance,
      status: type === 'Direct Sale' ? 'Delivered' : 'Ordered',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      await invoiceService.createInvoice(newInvoice as any);
      setIsInvoiceSaved(true);
      setSavedInvoice(newInvoice);
    } catch (err) {
      console.error(err);
      alert('Failed to save Sales Order');
    } finally {
      setIsSaving(false);
      setShowConfirmation(false);
    }
  };

"""
content = re.sub(old_handleSubmit_pattern, new_handleSubmit, content, flags=re.DOTALL)

with open('components/InvoiceFormView.tsx', 'w') as f:
    f.write(content)

