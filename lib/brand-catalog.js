// Product counts per ClearDeals brand library (Brand Catalog Library, checked
// Sept 23, 2026). Keys are the library names the ClearDeals import uses, and
// they travel to ClearDeals verbatim in Checkout metadata `brands`.
//
// Mirrored in checkout/sales-start.html (BRANDS) — keep the two in sync when a
// library is added or its count changes.
const BRAND_PRODUCT_COUNTS = {
  Culligan: 25,
  Kinetico: 15,
  RainSoft: 10,
  EcoWater: 13,
  Hague: 18,
  WaterCare: 16,
  Aerus: 11,
  Puronics: 15,
  Hellenbrand: 21,
  'Water-Right': 15,
  Canopus: 5,
  // Independent dealers with no single OEM get the generic library.
  Generic: 22,
};

module.exports = { BRAND_PRODUCT_COUNTS };
