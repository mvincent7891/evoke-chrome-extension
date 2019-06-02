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

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.fetchReady == true) {
      sendResponse({fetching: true});

      chrome.storage.local.remove('keywords', function() {
        console.log('Keywords cleared.');
      });

      fetchKeywords().then(res => {
        chrome.storage.local.set({ keywords: res.data.keywords }, function() {
          console.log('Keywords saved.')
        });
      })
    }
  });