import re

with open('components/InvoiceFormView.tsx', 'r') as f:
    content = f.read()

# Add isSaving, saveStatus, isInvoiceSaved states
state_injection = """  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isInvoiceSaved, setIsInvoiceSaved] = useState(false);"""
content = re.sub(r'const \[showConfirmation, setShowConfirmation\] = useState\(false\);', state_injection, content)

# Replace handleSaveCustomerOnly
old_handleSaveCustomerOnly_pattern = r'const handleSaveCustomerOnly = async \(\) => \{.*?(?=  const handleInitiateSubmit)'
new_handleSaveCustomerOnly = """const handleSaveCustomerOnly = async () => {
    if (!customer) {
      alert('Please select a customer.');
      return;
    }
    
    if (isSaving) return;
    setIsSaving(true);
    setSaveStatus('Checking records...');

    const updatedCustomer = { ...customer };
    if (prescription && prescription.source === 'Eye Test Performed In Shop') {
      updatedCustomer.status = 'Eye Test Only';
    } else if (prescription && prescription.source !== 'No Prescription') {
      updatedCustomer.status = 'Prescription Only';
    }

    const isNewCustomer = !customer.id || customer.id.includes('local') || customer.id.includes('temp');
    const isNewPrescription = prescription && prescription.source !== 'No Prescription' && (!prescription.id || !prescription.id.startsWith('PRE-'));

    if (!isNewCustomer && !isNewPrescription) {
       // Both exist, skip saving
       setIsSaving(false);
       setContinueToBilling(true);
       return;
    }

    setSaveStatus('Saving Customer and Prescription...');
    const tasks = [];
    let finalCustomer = customer;
    let finalPrescription = prescription;

    if (isNewCustomer) {
       tasks.push(
         saveCustomer(updatedCustomer)
           .then(res => { finalCustomer = res || updatedCustomer; })
           .catch(err => { console.warn(err); finalCustomer = updatedCustomer; })
       );
    }

    if (isNewPrescription) {
       tasks.push(
         prescriptionService.savePrescription(customer.id, prescription)
           .then(res => { finalPrescription = res ? mapPascalToStandard(res) : prescription; })
           .catch(err => { console.warn(err); finalPrescription = prescription; })
       );
       
       if (prescription.source === 'Eye Test Performed In Shop' || prescription.eyeTestDetails) {
          const eyeTestPayload = {
              id: `et-${Date.now()}`,
              companyId: 'COMP-default',
              branchId: 'BR-default',
              customerId: customer.id,
              eyeTestDate: prescription.eyeTestDetails?.eyeTestDate || new Date().toISOString().split('T')[0],
              optometristName: prescription.eyeTestDetails?.optometristName || 'Optometrist',
              sphOd: prescription.rightEye?.sph || '',
              cylOd: prescription.rightEye?.cyl || '',
              axisOd: prescription.rightEye?.axis || '',
              sphOs: prescription.leftEye?.sph || '',
              cylOs: prescription.leftEye?.cyl || '',
              axisOs: prescription.leftEye?.axis || '',
              addPower: prescription.rightEye?.add || prescription.leftEye?.add || '',
              pdDistance: prescription.pdDistance || '',
              pdNear: prescription.pdNear || '',
              segmentHeight: '',
              lensRecommendation: prescription.remarks || '',
              remarks: prescription.remarks || '',
              createdAt: Date.now()
          };
          tasks.push(
             eyeTestService.saveEyeTest(eyeTestPayload).catch(e => console.warn(e))
          );
       }
    }

    if (tasks.length > 0) {
       await Promise.all(tasks);
       setCustomer(finalCustomer);
       if (finalPrescription) setPrescription(finalPrescription);
       alert('Customer and Prescription Saved Successfully');
    }

    setIsSaving(false);
    setContinueToBilling(true);
  };
"""
content = re.sub(old_handleSaveCustomerOnly_pattern, new_handleSaveCustomerOnly, content, flags=re.DOTALL)

# Replace handleSubmit
old_handleSubmit_pattern = r'const handleSubmit = async \(\) => \{.*?(?=  const renderContent)'
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
      await invoiceService.saveInvoice(newInvoice);
      setIsInvoiceSaved(true);
      alert('Sales Order Saved Successfully');
      
      // Update local context/store if needed, but do NOT trigger multiple saves.
      const invoiceDataForState = {
         ...newInvoice,
         customerName: customer?.fullName || 'Walk-in Customer',
         customerMobile: customer?.mobile || ''
      };
      // Delay navigation slightly if desired, or let user click 'Print' manually
      onSave(invoiceDataForState);
      
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

