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
   - Create an IntelliJ Node.js run configuration with Node parameters: `-r ts-node/register/transpile-only`, Javascript file: `src\main\main.ts` and environment variables:`NODE_ENV=development`

## Notes
#### Why not Electron?
This avoids having to ship yet another copy of Chrome, and enforces a model where the UI is completely sandboxed and a normal web application.

#### Why not `carlo`?
It is no longer maintained and has an overly complex RPC system.

#### What about Puppeteer's warning that only the bundled version of Chromium is supported?
`puppeteer-core` v1.7.0 that targets Chrome 70 still works with Chrome 80 a year and a half later. So with only limited use of Puppeteer's features it does not seem that risky.

#### Native modules
Native modules are a massive pain to deal with. They cannot be bundled into the executable like the other files, so they have to be distributed together with it. And the js script then needs to refer to these paths and not the paths during the build process.
Unfortunately some libraries load their native modules via overly clever indirections that cannot be determined at build time meaning they won't work for the time being.
