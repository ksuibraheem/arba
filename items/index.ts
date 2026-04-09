/**
 * Central Index — Exports all project-specific items + shared suppliers
 * مركز تصدير جميع البنود الخاصة بكل نوع مشروع
 */

// Shared Suppliers
export * from './suppliers';

// Project-Specific Items — Original 11 types
export { VILLA_ITEMS } from './villaItems';
export { REST_HOUSE_ITEMS } from './restHouseItems';
export { TOWER_ITEMS } from './towerItems';
export { FACTORY_ITEMS } from './factoryItems';
export { HOSPITAL_ITEMS } from './hospitalItems';
export { SCHOOL_ITEMS } from './schoolItems';
export { MOSQUE_ITEMS } from './mosqueItems';
export { HOTEL_ITEMS } from './hotelItems';
export { RESIDENTIAL_ITEMS } from './residentialItems';
export { SPORTS_ITEMS } from './sportsItems';
export { FARM_ITEMS } from './farmItems';

// Project-Specific Items — New 7 types
export { GAS_STATION_ITEMS } from './gasStationItems';
export { MALL_ITEMS } from './mallItems';
export { RESTAURANT_ITEMS } from './restaurantItems';
export { CAR_WASH_ITEMS } from './carWashItems';
export { WAREHOUSE_ITEMS } from './warehouseItems';
export { GOVERNMENT_ITEMS } from './governmentItems';
export { CLINIC_ITEMS } from './clinicItems';

import { BaseItem } from '../types';
import { VILLA_ITEMS } from './villaItems';
import { REST_HOUSE_ITEMS } from './restHouseItems';
import { TOWER_ITEMS } from './towerItems';
import { FACTORY_ITEMS } from './factoryItems';
import { HOSPITAL_ITEMS } from './hospitalItems';
import { SCHOOL_ITEMS } from './schoolItems';
import { MOSQUE_ITEMS } from './mosqueItems';
import { HOTEL_ITEMS } from './hotelItems';
import { RESIDENTIAL_ITEMS } from './residentialItems';
import { SPORTS_ITEMS } from './sportsItems';
import { FARM_ITEMS } from './farmItems';
import { GAS_STATION_ITEMS } from './gasStationItems';
import { MALL_ITEMS } from './mallItems';
import { RESTAURANT_ITEMS } from './restaurantItems';
import { CAR_WASH_ITEMS } from './carWashItems';
import { WAREHOUSE_ITEMS } from './warehouseItems';
import { GOVERNMENT_ITEMS } from './governmentItems';
import { CLINIC_ITEMS } from './clinicItems';

/**
 * All project-specific items merged into a single array.
 * These are ADDITIONAL items beyond the base ITEMS_DATABASE in constants.ts.
 * The base ITEMS_DATABASE contains items with type: 'all' that apply to every project.
 * Total: ~18 project types
 */
export const ALL_PROJECT_SPECIFIC_ITEMS: BaseItem[] = [
    ...VILLA_ITEMS,
    ...REST_HOUSE_ITEMS,
    ...TOWER_ITEMS,
    ...FACTORY_ITEMS,
    ...HOSPITAL_ITEMS,
    ...SCHOOL_ITEMS,
    ...MOSQUE_ITEMS,
    ...HOTEL_ITEMS,
    ...RESIDENTIAL_ITEMS,
    ...SPORTS_ITEMS,
    ...FARM_ITEMS,
    ...GAS_STATION_ITEMS,
    ...MALL_ITEMS,
    ...RESTAURANT_ITEMS,
    ...CAR_WASH_ITEMS,
    ...WAREHOUSE_ITEMS,
    ...GOVERNMENT_ITEMS,
    ...CLINIC_ITEMS,
];
