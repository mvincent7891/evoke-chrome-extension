chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    console.log('COMPLETED', tabId, changeInfo, tab)
  }
})