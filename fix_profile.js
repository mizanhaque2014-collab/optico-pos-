const fs = require('fs');

let code = fs.readFileSync('components/CustomerProfileView.tsx', 'utf8');

code = code.replace("import { InvoiceDetailCard } from './InvoiceDetailCard';", "import { InvoiceDetailCard } from './InvoiceDetailCard';\nimport { SalesOrderDetailCard } from './SalesOrderDetailCard';");

const salesOrdersOld = `{salesOrders.map(inv => (
                  <InvoiceDetailCard
                    key={inv.id}
                    inv={inv}
                    customer={customer}
                    prescription={prescriptions.find(p => p.id === inv.prescriptionId)}
                    onViewPrescription={setViewingPrescription}
                    onViewInvoice={setViewingInvoice}
                    onPrintA5={setPrintingInvoice}
                  />
                ))}`;

const salesOrdersNew = `{salesOrders.map(inv => (
                  <SalesOrderDetailCard
                    key={inv.id}
                    inv={inv}
                    customer={customer}
                    prescription={prescriptions.find(p => p.id === inv.prescriptionId)}
                    onViewPrescription={setViewingPrescription}
                    onPrintA5={setPrintingInvoice}
                    onEditOrder={() => {}}
                    onContinueBilling={(inv) => {
                       if (onNavigateTo) onNavigateTo('delivery_collection', customer, inv);
                    }}
                  />
                ))}`;

code = code.replace(salesOrdersOld, salesOrdersNew);

fs.writeFileSync('components/CustomerProfileView.tsx', code);
