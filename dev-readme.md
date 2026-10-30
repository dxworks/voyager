# Local Setup & Run Instructions

This document describes the exact steps required to build and run the
CLI application locally.

## Prerequisites

-   Node.js **25** (`nvm use` reads it from `.nvmrc`; building the
    single-file programs with `npm run build:sea` needs Node 25)
-   npm (bundled with Node)

## Install dependencies

Two dependencies (`@dxworks/cli-common` and `@dxworks/ktextensions`) come
from GitHub Packages (see `.npmrc`), which needs a login even for reading.
Create a GitHub token with the `read:packages` scope and add it once to your
npm user config:

``` bash
npm config set //npm.pkg.github.com/:_authToken=<your-token>
```

If the GitHub CLI is logged in with that scope
(`gh auth refresh -s read:packages`), `$(gh auth token)` can be used as the
token.

From the project root directory:

``` bash
npm install
```

## Build the project

Compile the TypeScript sources to JavaScript:

``` bash
npm run build
```

This generates the compiled output in the `dist/` directory.

## Run the CLI

After a successful build, execute the CLI using Node:

``` bash
node dist/src/voyager.js <action> <parameters>
```

Replace `<action>` and `<parameters>` with the desired command and
arguments.

### Example

``` bash
node dist/src/voyager.js run -m <path_to_mission>
```
