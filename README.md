# node-react-ui
Use an existing Chrome or Chromium Edge installation to show a React UI for a Node.js application.

## Getting started
### Install
1. Node.js 12.13 or newer
2. Yarn
3. `yarn`

### Build
1. `yarn run build`
2. `target/app/app.exe`

### Develop
1. `yarn run start:renderer`
2. - `yarn run start:main`
   - Create an IntelliJ Node.js run configuration with Node parameters: `-r ts-node/register`, Javascript file: `src\main\main.ts` and environment variables:`NODE_ENV=development`

## Notes
#### Why not Electron?
This avoids having to ship yet another copy of Chrome, and enforces a model where the UI is completely sandboxed and a normal web application.

#### Why not `carlo`?
It is no longer maintained and has an overly complex RPC system.

#### What about Puppeteer's warning that only the bundled version of Chromium is supported?
`puppeteer-core` v1.7.0 that targets Chrome 70 still works with Chrome 80 a year and a half later. So with only limited use of Puppeteer's features it does not seem that risky.

#### Why not `better-sqlite3`?
Its native module does not appear to be compatible with a bundled application that does not maintain the node_modules folder structure.
