DiscoverHealth app

need node v20

how to run

npm install
cd client
npm install
cd ..

create database (fresh install)
node scripts/init-db.js
node scripts/seed.js

start server
npm start

open in browser
http://localhost:3000

login details
username: jsmith
password: demo

reset database (delete and recreate)
mac/linux:
rm -f discoverhealth.db
node scripts/init-db.js
node scripts/seed.js

windows powershell:
Remove-Item -Force .\discoverhealth.db
node scripts/init-db.js
node scripts/seed.js

note about database
a discoverhealth.db file will appear after you run init-db and seed. you may also find one included in this project zip. the assessor can either use the included db file directly or run the init-db and seed steps to recreate a fresh one. both options will work with the code.