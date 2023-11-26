

BACKEND DOMAIN
http://localhost:3001

API VERSION
0

API BASE URL
http://localhost:3001/api/v0

Routes HTTP

Auth

POST /auth/register
Create a user using credentials (email, password, username)

POST /auth/login
Login a user using credentials (email, password, username)

GET /auth/42/callback
callback for 42 oauth, where 42 redirects to after successful login


GET /auth/session
Return current session info

POST /auth/logout
Logout current user

POST /auth/update
Update current user info (email, password, username, avatar, )