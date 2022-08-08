# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a markdown fragment
Content-Type: text/markdown
# Body of the request goes in ```...``` when it's a string
```# hello!```

# We expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check 
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/markdown"

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# Try to GET the fragment we just posted by its URL
GET {{url}}
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==


# GET the fragment by converting markdown to html
GET {{url}}.html
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 200
Content-Length: 16
[Asserts]
header "Content-Type" startsWith "text/html"
body contains "<h1>hello!</h1>"

# If the extension used represents an unknown or unsupported type, or if the fragment cannot be converted to this type, 
# an HTTP 415 error is returned instead, with an appropriate message. For example, a plain text fragment cannot be returned as a PNG.
GET {{url}}.png
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

HTTP/1.1 415

