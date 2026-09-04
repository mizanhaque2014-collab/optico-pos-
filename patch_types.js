const fs = require('fs');
let code = fs.readFileSync('lib/types.ts', 'utf-8');

// Patch Customer
code = code.replace(
  `export type Customer = {
  id: string;`,
  `export type Customer = {
  id: string;
  companyId?: string;
  branchId?: string;`
);

// Patch Prescription
code = code.replace(
  `export type Prescription = {
  id: string;`,
  `export type Prescription = {
  id: string;
  companyId?: string;
  branchId?: string;`
);

// Patch Invoice
code = code.replace(
  `export type Invoice = {
  id: string;`,
  `export type Invoice = {
  id: string;
  companyId?: string;
  branchId?: string;`
);

// Patch StockItem
code = code.replace(
  `export type StockItem = {
  id: string;`,
  `export type StockItem = {
  id: string;
  companyId?: string;
  branchId?: string;`
);

fs.writeFileSync('lib/types.ts', code);
console.log("Patched types.ts successfully.");
