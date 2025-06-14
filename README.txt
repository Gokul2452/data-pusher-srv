Steps to Test the Flow Using Postman and Docker (Queue & Logging)
1.	Import Postman Collection
    - Import the provided Postman collection into your Postman application.
2.	Register a New User
    - Go to the Registration API and send a POST request with the required user details (e.g., name, email, password).
3.	Login to Get Admin Token
    - Use the Login API with the registered credentials.
    - Copy the admin token from the response.
4.	Save Admin Token in Postman Environment
    - In Postman Environment settings, create a new variable (e.g., admin_token) and store the token there.
    - Use this token for authenticated admin requests.
5.	Create an Account
    - Use the Create Account API (ensure Authorization header has the Bearer {{admin_token}}).
    - Copy the account_id from the response.
6.	Create a Destination for the Account
    - Use the Create Destination API and provide the account_id in the request body.
    - A webhook URL is typically needed here.
7.	Start Redis with Docker
    - Run Redis using Docker:
    docker run --name redis -p 6379:6379 -d redis
    - Ensure Redis is running; it's essential for queue processing (e.g., using Bull or similar library).
8.	Hit /server/incoming_data API
    - Prepare a valid request body and headers.
    - In the headers, pass:
    app_secret_token: <your_app_secret_token>
    - This token should match the one generated during account creation.
9.	Check Logger List to Confirm Data Push
    - Use the Logger List API to verify that the data sent to /server/incoming_data was successfully pushed to the destination webhook.
10.	Run Unit & Integration Tests
    - To verify that all test cases pass successfully, run:
    npm test


