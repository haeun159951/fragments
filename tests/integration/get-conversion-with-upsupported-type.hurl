# tests/integration/get-conversion-with-upsupported-type.hurl

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a text/plain
Content-Type: text/plain
# Body of the request goes in ```...``` when it's a string
```This is text```

# We expect to get back an HTTP 201
HTTP/1.1 201
[Captures]
url: header "Location"

# Try to convert that fragment to text/markdown
GET {{url}}.md
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# We expect to get back an HTTP 415
HTTP/1.1 415

# Try to convert that fragment to text/html
GET {{url}}.html
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# We expect to get back an HTTP 415
HTTP/1.1 415

