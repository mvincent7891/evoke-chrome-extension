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

export const chromeNotification = options => {
  const defaultOptions = {
    type: 'basic',
    title: 'EVOKE',
    iconUrl:'./favicon.ico',
    priority: 1
  };

  const notificationOptions = {
    ...defaultOptions,
    ...options
  }
  const notificationID = newID()

  chrome.notifications.create(notificationID, notificationOptions, () => {
    console.log("Last error:", chrome.runtime.lastError); 
  })

  return notificationID;
}

// build tooltipText for each keyword; keywords point to a list of their tooltipTexts
// note that one keyword may have many tooltipTexts (included in multiple Collections, synonym and antonym, etc.)
export const parseKeywordResponse = res => {
  const keywordMap = {}
  let tooltipText
  for (const keyword of res.data.keywords) {
    if (keyword.keyword_type == 'Definition') {
      tooltipText = `/${keyword.keyword}/ is contained in your ${keyword.related} collection.`
    } else {
      const kType = keyword.keyword_type
      tooltipText = `/${keyword.keyword}/ is a${kType == 'Antonym' ? 'n' : ''} ${kType.toLowerCase()} of ${keyword.related}`
    }
    keyword.tooltipText = tooltipText

    if (keywordMap[keyword.keyword]) {
      keywordMap[keyword.keyword].push(keyword)
    } else {
      keywordMap[keyword.keyword] = [keyword]
    }
  }
  return keywordMap
}