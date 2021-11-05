# memento_sync_server

REST API for memento client synchronise.
Server create rest API that allows to synchronize memento client with database.
Aplication download template of database schame from google sheets. With this functionality there is not need to change server code for adding new synchronize library from memento client.
Server automaticlly detect which version of data is newer and based on it insert/update/delte data in database or client.

### Used technologies

- typescript
- node.js
- express
- mssql
- googleapis
- jest
- superTest

### Development

Install all the required packages/dependecies

`$ npm install`

start

`npm start`
