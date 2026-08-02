/**
 * M1.1 — Shared ZATCA-compliant accounting types
 */

// Unified ZATCA-format address
export interface Address {
  buildingNo?: string;
  street?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string; // ISO 3166-1 alpha-2 (default 'SA')
}

// Tax categories per ZATCA
export type TaxCategory = 'S' | 'Z' | 'E' | 'O'; // Standard/Zero/Exempt/OutOfScope

// ZATCA invoice type codes
export type InvoiceTypeCode = '388' | '381' | '383'; // Tax/Credit/Debit

// Payment means codes (UN/ECE 4461)
export type PaymentMeansCode = '10' | '30' | '42' | '48'; // Cash/Credit/BankTransfer/Card

// Tax settings document
export interface TaxSettings {
  vatRate: number; // default 0.15
  categories: TaxCategoryConfig[];
  exemptionReasons: TaxExemptionReason[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface TaxCategoryConfig {
  code: TaxCategory;
  nameAr: string;
  nameEn: string;
  rate: number;
}

export interface TaxExemptionReason {
  code: string; // e.g. VATDEC-G20-01
  descriptionAr: string;
  descriptionEn: string;
}

// Fiscal period
export interface FiscalPeriod {
  id: string;
  fiscalYearId: string;
  periodId: string; // e.g. P06-2026
  from: string;
  to: string;
  isClosed: boolean;
}

// Allowance/Charge for line items (Z2)
export interface AllowanceCharge {
  isCharge: boolean;
  amount: number;
  baseAmount?: number;
  rate?: number;
  reason?: string;
}
