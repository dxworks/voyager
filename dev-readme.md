# Local Setup & Run Instructions

This document describes the exact steps required to build and run the
CLI application locally.

## Prerequisites

-   Node.js **24.13.0**
-   npm (bundled with Node)

## Install dependencies

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
