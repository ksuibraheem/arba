import { PROJECT_DEFAULTS } from '../constants';
import { calculateProjectCosts } from '../utils/calculations';
import { AppState } from '../types';

const defaultState: AppState = {
  language: 'ar',
  viewMode: 'pricing',
  projectType: 'villa',
  location: 'riyadh',
  soilType: 'sandy',
  executionMethod: 'in_house',
  globalPriceAdjustment: 0,
  metadata: {
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientIdNumber: '',
    projectName: 'مشروع جديد',
    projectAddress: '',
    deedNumber: '',
    plotNumber: '',
    planNumber: '',
    buildingPermitNumber: '',
    tenderNumber: '',
    quotationNumber: '',
    quotationDate: new Date().toISOString().split('T')[0],
    quotationValidityDays: 30,
    scopeOfWork: 'turnkey',
    companyName: '',
    companyLicense: '',
    companyClassification: '3',
    companyPhone: '',
    companyEmail: '',
    vatNumber: '',
    preparedBy: '',
    confirmationCode: '',
    vatPercentage: 15,
    paymentTerms: 'دفعات حسب الإنجاز',
    pricingDate: new Date().toISOString().split('T')[0],
    executionStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    projectDurationMonths: 12,
    warrantyYearsStructure: 10,
    warrantyYearsFinish: 2,
    warrantyYearsMEP: 5,
  },
  pricingStrategy: 'fixed_margin',
  profitMargin: 15,
  targetROI: 20,
  totalInvestment: 1000000,
  fixedOverhead: 50000,
  landArea: 300,
  buildArea: 450,
  floors: 2,
  sbcOccupancyGroup: 'R-3',
  constructionType: 'VB',
  foundationType: 'isolated_footings',
  structuralSystem: 'frame',
  seismicZone: '1',
  windSpeed: 130,
  buildingRatio: 60,
  fireRating: 1,
  concreteGrade: 'C30',
  steelGrade: 'Grade 60',
  exposureCategory: 'normal',
  hasBasement: false,
  parkingType: 'surface',
  hasElevator: false,
  elevatorCount: 0,
  insulationType: 'eps',
  rooms: PROJECT_DEFAULTS['villa'].rooms,
  facades: PROJECT_DEFAULTS['villa'].facades,
  team: PROJECT_DEFAULTS['villa'].team,
  blueprint: PROJECT_DEFAULTS['villa'].blueprint,
  interiorFinishes: [],
  customItems: [],
  itemOverrides: {},
  registeredSuppliers: [],
  supplierProducts: [],
  deliveryScope: 'turnkey',
  enabledSections: ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17'],
};

// We need to initialize the brain to get the real brain prices
import { initializeBrain } from '../services/brainDataLoader';
initializeBrain();

const result = calculateProjectCosts(defaultState);
console.log('--- Calculation Result ---');
console.log('Total Direct Cost:', result.totalDirect);
console.log('Total Overhead:', result.totalOverhead);
console.log('Total Profit:', result.totalProfit);
console.log('Final Price:', result.finalPrice);
console.log('Total Concrete Volume:', result.totalConcreteVolume);
console.log('Total Labor Cost:', result.totalLaborCost);
console.log('Total Material Cost:', result.totalMaterialCost);

console.log('\nTop 15 Expensive Items:');
const sortedItems = [...result.items].sort((a, b) => b.totalLinePrice - a.totalLinePrice);
sortedItems.slice(0, 15).forEach(item => {
  console.log(` - ID: ${item.id} | Name: ${item.displayName} | Qty: ${item.qty} ${item.unit} | UnitPrice: ${item.finalUnitPrice} | Total: ${item.totalLinePrice}`);
});
