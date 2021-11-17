# Installation & Usage
Install Voyenv either as a global npm package or download the latest release from Github.

## NPM Installation
Install Voyenv through the NPM package manager.
We have created a wrapper around the voyenv jar (using [jdeploy](https://github.com/shannah/jdeploy)) to easily install and upgrade the tool.

```shell
npm install @dx-works/voyenv -g
```

Verify the installation by running:
```shell
voyenv -version
```

### Usage
To generate a Voyager release, open a command line in the folder you want to generate the release in.
Before running the command you have to create a `yml` file described in the [Configuration](#Configuration) section, e.g. `my-voyenv.yml`.

Run the following command in a terminal window:
```yaml
voyenv [path/to/voyenv/file]
```

The path to the voyenv.yml file is optional. If none is specified voyenv will search for a file named `voyenv.yml` in the current working directory.
The voyager release will also be created in the current working directory.

## Github Release Download

Download the latest release from [Github](https://github.com/dxworks/voyenv/releases). Unpack the zip file to a folder and open a terminal window in the newly extracted folder.

Run the following command to verify the installation:

```shell
java -jar voyenv.jar -version
```

### Usage
From the voyenv installation folder run:
```shell
java -jar  voyenv.jar [path/to/voyenv/file.yml]
```
The path to the voyenv.yml file is optional. If none is specified voyenv will search for a file named `voyenv.yml` in the current working directory.
The voyager release will also be created in the current working directory.
