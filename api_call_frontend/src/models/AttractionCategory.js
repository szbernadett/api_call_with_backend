const AttractionCategory = Object.freeze({
  Historical: "historic",
  Cultural: "cultural",
  Architecture: "architecture",
  Natural: "natural",
  Religion: "religion",
  Sport: "sport",
});

export const ReverseAttractionCategory = Object.freeze(
  Object.fromEntries(
    Object.entries(AttractionCategory).map(([key, value]) => [value, key])
  )
);
export default AttractionCategory;
