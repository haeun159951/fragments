#Confirm that posting an unsupported Content-Type produces a 415 error
# tests/integration/post-fragments-unauthenticated.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments

# We're sending a plain text fragment
Content-Type: text/plain
# Body of the request goes in ```...``` when it's a string
```This is a fragment!```

# We expect to get back an HTTP 401
HTTP/1.1 401
# We have various assertions about the response that we want to check
[Asserts]
header "Content-type" startsWith "application/json"
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 401
jsonpath "$.error.message" isString



