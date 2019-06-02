export const newID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
};

export const formatDefinition = def => {
  // definition: {term: "movement", definition: "an act of defecation.", lexical_category: "noun", source: "oxford"}
  // <term> (<lexical_category>): <definition> [<source>]
  return`${def.term} (${def.lexical_category}): ${def.definition} [${def.source}]`
}