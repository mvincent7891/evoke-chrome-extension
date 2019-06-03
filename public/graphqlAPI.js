export const API_URL = 'http://localhost:3000';
export const APP_URL = 'http://localhost:3003';

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

const CREATE_MANY_DEFINITIONS_MUTATION = `
  mutation(
    $definitions: [DefinitionInputType]
  ) {
    create_many_definitions(
      definitions :$definitions
    ) {
      id
    }
  }
`

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


export const createManyDefinitionsPayload = definitions => ({
  operationName: null,
  query: CREATE_MANY_DEFINITIONS_MUTATION,
  variables: { definitions }
})

export const fetchKeywords = () => {
  const body = JSON.stringify(KEYWORDS_REQUEST_PAYLOAD)
  return fetchGraphql(body).then(response => response.json());
}

export const fetchDefinition = term => {
  const body = JSON.stringify(lookupQueryPayload(term))
  return fetchGraphql(body).then(response => response.json());
}

export const createManyDefinitions = definitions => {
  const body = JSON.stringify(createManyDefinitionsPayload(definitions))
  return fetchGraphql(body).then(response => response.json());
}

const fetchGraphql = body => (
  fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body
  })
)