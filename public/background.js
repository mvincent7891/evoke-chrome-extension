const KEYWORDS_QUERY = `{ 
  keywords {
    keyword
    keyword_type
    keyword_id
    related
    related_type
    related_id
  }
}`;


const REQUEST_PAYLOAD = {
  operationName: null,
  query: KEYWORDS_QUERY,
  variables: {}
};

const URL = 'http://localhost:3000/graphql';

const fetchKeywords = () => {
  return fetch(URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(REQUEST_PAYLOAD),
  })
  .then(response => response.json());
}

// chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
//   if (changeInfo.status == 'complete') {
//     fetchKeywords().then(data => {
//       chrome.storage.local.set({ data: data.keywords }, function() {
//         console.log('Data saved', data);
//       });
//     })
//   }
// })

const sendToEvoke = selection => {
  const query = selection.selectionText;
  console.log('SEND: ', query)
  // return fetch(URL, {
  //   method: 'POST',
  //   headers: {
  //       'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(REQUEST_PAYLOAD),
  // })
  // .then(response => response.json());
}

chrome.contextMenus.create({
  title: "Send to EVOKE",
  contexts:["selection"],
  onclick: sendToEvoke
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.fetchReady == true) {
      sendResponse({fetching: true});

      chrome.storage.local.remove('keywords', function() {
        console.log('Keywords cleared.');
      });

      fetchKeywords().then(res => {
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
        
        chrome.storage.local.set({ keywords: keywordMap }, function() {
          console.log('Keywords saved.') 
        });
      })
    }
  });