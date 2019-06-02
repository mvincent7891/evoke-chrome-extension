
const KEYWORDS_QUERY = `keywords {
  keyword
  keyword_type
  keyword_id
  related
  related_type
  related_id
}`;

const REQUEST_PAYLOAD = {
  operationName: null,
  query: KEYWORDS_QUERY,
  variables: {}
};


const fetchKeywords = () => {
  return fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(REQUEST_PAYLOAD),
  })
  .then(response => response.json().then(data => console.log(data)));
}

export default fetchKeywords;
