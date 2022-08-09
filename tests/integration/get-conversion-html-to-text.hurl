# tests/integration/get-conversion-html-to-text.hurl

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a html fragment
Content-Type: text/html
# Body of the request goes in ```...``` when it's a string
<h1>This is html</h1>

# We expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check 
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/html"

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# Try to convert that fragment to text
GET {{url}}.txt
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
[Asserts]
header "Content-Type" startsWith "text/plain"
body contains "<h1>This is html</h1>"


