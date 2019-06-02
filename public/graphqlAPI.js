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

const LOOKUP_QUERY = `query LookupTerm($term: String!) {
  lookup(term: $term) {
    term
    definition
    lexical_category
    source
  }
}`

export const KEYWORDS_REQUEST_PAYLOAD = {
  operationName: null,
  query: KEYWORDS_QUERY,
  variables: {}
};

export const lookupQueryPayload = term => ({
  operationName: "LookupTerm",
  query: LOOKUP_QUERY,
  variables: { term }
})

export const API_URL = 'http://localhost:3000';
export const APP_URL = 'http://localhost:3003';

export const fetchKeywords = () => {
  return fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(KEYWORDS_REQUEST_PAYLOAD),
  })
  .then(response => response.json());
}

export const fetchDefinition = term => {
  const body = JSON.stringify(lookupQueryPayload(term))
  return fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body,
  })
  .then(response => response.json());
}
