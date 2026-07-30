const fs = require('fs');
let code = fs.readFileSync('components/SalesOrderDetailCard.tsx', 'utf-8');

// 1. Parsing Items
const oldItems = `  const frames = inv.items.filter(item => item.itemType === 'frame' && item.productType !== 'Sunglass');
  const lenses = inv.items.filter(item => item.itemType === 'lens');
  const sunglasses = inv.items.filter(item => item.itemType === 'frame' && item.productType === 'Sunglass');
  const accessories = inv.items.filter(item => item.itemType === 'manual');`;

const newItems = `  const parsedItems = Array.isArray(inv.items) ? inv.items : (typeof inv.items === 'string' ? JSON.parse(inv.items) : []);
  const frames = parsedItems.filter((item: any) => (item.itemType?.toLowerCase() === 'frame' || item.type?.toLowerCase() === 'frame') && item.productType !== 'Sunglass');
  const lenses = parsedItems.filter((item: any) => item.itemType?.toLowerCase() === 'lens' || item.type?.toLowerCase() === 'lens');
  const sunglasses = parsedItems.filter((item: any) => (item.itemType?.toLowerCase() === 'frame' || item.type?.toLowerCase() === 'frame') && item.productType === 'Sunglass');
  const accessories = parsedItems.filter((item: any) => item.itemType?.toLowerCase() === 'manual' || item.type?.toLowerCase() === 'manual');
  
  const productTotal = parsedItems.reduce((sum: number, item: any) => sum + (Number(item.finalAmount) || 0), 0);
  const taxAmount = 0; // Tax is 0 based on current requirements
  const grandTotal = productTotal - (Number(inv.totalDiscount) || 0) + taxAmount;
  const balanceAmount = grandTotal - (Number(inv.advanceAmount) || 0);
  const discountAmount = Number(inv.totalDiscount) || 0;
  const advanceAmount = Number(inv.advanceAmount) || 0;
`;
code = code.replace(oldItems, newItems);


// 2. Frame Details Block
const oldFrameBlock = `                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{(frame as any).brand || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Name</span><span className="font-bold text-white">{(frame as any).frameName || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Code</span><span className="font-bold text-white">{(frame as any).frameCode || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Model Number</span><span className="font-bold text-white">{(frame as any).modelNumber || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Size</span><span className="font-bold text-white">{(frame as any).frameSize || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Colour</span><span className="font-bold text-white">{(frame as any).color || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Shape</span><span className="font-bold text-white">{(frame as any).frameShape || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Material</span><span className="font-bold text-white">{(frame as any).frameMaterial || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{(frame as any).frameCategory || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">SKU / Barcode</span><span className="font-bold text-white">{(frame as any).barcode || 'N/A'}</span></div>`;

const newFrameBlock = `                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{(frame as any).brand || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Model</span><span className="font-bold text-white">{(frame as any).modelNumber || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Code</span><span className="font-bold text-white">{(frame as any).frameCode || (frame as any).itemCode || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{(frame as any).frameCategory || (frame as any).productType || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Color</span><span className="font-bold text-white">{(frame as any).color || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Size</span><span className="font-bold text-white">{(frame as any).frameSize || (frame as any).size || 'N/A'}</span></div>`;
code = code.replace(oldFrameBlock, newFrameBlock);


// 3. Lens Details Block
const oldLensBlock = `                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{(lens as any).lensBrand || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Name</span><span className="font-bold text-white">{(lens as any).lensName || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Type</span><span className="font-bold text-white">{(lens as any).lensType || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{(lens as any).lensCategory || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Index</span><span className="font-bold text-white">{(lens as any).lensIndex || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Material</span><span className="font-bold text-white">{(lens as any).lensMaterial || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Coating</span><span className="font-bold text-white">{(lens as any).lensCoating || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Warranty</span><span className="font-bold text-white">{(lens as any).warranty || 'N/A'}</span></div>`;

const newLensBlock = `                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{(lens as any).lensBrand || (lens as any).brand || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{(lens as any).lensCategory || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Type</span><span className="font-bold text-white">{(lens as any).lensType || (lens as any).type || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Index</span><span className="font-bold text-white">{(lens as any).lensIndex || 'N/A'}</span></div>
                 <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Coating</span><span className="font-bold text-white">{(lens as any).lensCoating || 'N/A'}</span></div>
                 <div className="col-span-2 md:col-span-3"><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Features</span><span className="font-bold text-white">{(lens as any).lensFeatures?.join(', ') || 'N/A'}</span></div>`;
code = code.replace(oldLensBlock, newLensBlock);

// Remove the hardcoded features section which takes up a lot of space
const lensFeaturesRegex = /<div className="col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 bg-white\/5 p-3 rounded-lg border border-white\/5">.*?<\/div>/s;
code = code.replace(lensFeaturesRegex, '');

// 4. Sunglass Details Block
// Since I couldn't find a Sunglass Details block in the old code, maybe it was sharing Frame block?
// Ah wait! Let's check if sunglasses are rendered. The current UI has accessories but maybe not sunglasses.
// Let's replace the accessories and sunglasses area entirely.
fs.writeFileSync('components/SalesOrderDetailCard.tsx', code);
