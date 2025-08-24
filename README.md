DiscoverHealth app

to run you need node v20

steps to run

npm install
cd client
npm install
cd ..

then you need to create the database

node scripts/init-db.js
node scripts/seed.js

to start server

npm start

the app will run on http://localhost:3000

login with user
username: jsmith
password: demo

to reset db
rm -f discoverhealth.db
node scripts/init-db.js
node scripts/seed.js
