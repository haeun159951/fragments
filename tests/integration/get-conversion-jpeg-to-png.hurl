# tests/integration/get-conversion-image.hurl

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# user1@email.com:password1
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
# We're sending a jpeg image fragment
Content-Type: image/jpeg
file,testfile/dogg.jpeg;

# 2. We expect to get back an HTTP 201
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "image/jpeg"

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 3. Try to GET the fragment we just posted by its URL
GET {{url}}.webp
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# 4. Return 200 and check contents
HTTP/1.1 200
Content-Type: image/webp