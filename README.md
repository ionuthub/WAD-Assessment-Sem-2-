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

note: there is no discoverhealth.db file included in this project zip. the assessor should run the init-db and seed steps above to create it. do not expect the db file to be present.
