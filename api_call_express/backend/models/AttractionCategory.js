const AttractionCategory = Object.freeze({
  Historical: "historic",
  Cultural: "cultural",
  Architecture: "architecture",
  Natural: "natural",
  Religion: "religion",
  Sport: "sport",
});

const ReverseAttractionCategory = Object.freeze(
  Object.fromEntries(
    Object.entries(AttractionCategory).map(([key, value]) => [value, key])
  )
);

const allAttractionCategories = Object.values(AttractionCategory);

module.exports = { 
  AttractionCategory, 
  ReverseAttractionCategory, 
  allAttractionCategories };
