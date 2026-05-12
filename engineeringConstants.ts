/**
 * Engineering Utilities for BOQ & Pricing Conversions
 */

export const engineeringConstants = {
    concreteDensity: 2500,
    steelDensity: 7850,
};

export function slabAreaToVolume(area: number, slabType: string, thickness: number = 0.25): number {
    let equivalentThickness = thickness;
    switch (slabType) {
        case 'solid': equivalentThickness = thickness; break;
        case 'hordi': equivalentThickness = thickness * 0.6; break;
        case 'flat': equivalentThickness = thickness; break;
        case 'waffle': equivalentThickness = thickness * 0.5; break;
    }
    return area * equivalentThickness;
}

export function m3PriceToM2(pricePerM3: number, slabType: string, thickness: number = 0.25): number {
    const volumeForOneM2 = slabAreaToVolume(1, slabType, thickness);
    return pricePerM3 * volumeForOneM2;
}

export function m2PriceToM3(pricePerM2: number, slabType: string, thickness: number = 0.25): number {
    const volumeForOneM2 = slabAreaToVolume(1, slabType, thickness);
    if (volumeForOneM2 === 0) return 0;
    return pricePerM2 / volumeForOneM2;
}