# Mission YAML File

The **mission YAML file** defines the configuration and execution structure of a mission.

This document describes:
- the supported YAML structure,
- each supported parameter,
- where and how each value is accessible inside the application.

---

## Overview

The mission file controls:
- the mission target (repository or archive path),
- mission-level environment variables,
- mission execution flags.

---

## Top-Level Fields

### `mission`

**Type:** `string`  
**Required:** Yes

```yaml
mission: test-mission
```

**Description:** Defines the name of the mission

#### Runtime behavior

| Variable  | Value                                  |
|-----------|----------------------------------------|
| `mission` | Normalized target path                 |

---

### `target`

**Type:** `string`  
**Required:** Yes

```yaml
target: C:\path\to\project_to_be_analysed
```

**Description:** Defines the path to the target folder or archive that the mission operates on.

#### Runtime behavior
The parser:
- normalizes the path,
- derives and stores the following variables in `missionContext`:

| Variable   | Value                                  |
|------------|----------------------------------------|
| `target`   | Normalized target path                 |
| `repo`     | Same as `TARGET`                       |
| `repoName` | Basename of the target path            |

---


### `instrumentsDir`

**Type:** `string`  
**Required:** No

```yaml
instrumentsDir: C:\path\to\instrument_folder
```

**Description:** Defines the path to the instrument folder that the mission will use. 

#### Runtime behavior

If absent, defaults to ./instruments

| Variable         | Value                           |
|------------------|---------------------------------|
| `instrumentsDir` | Normalized instruments dir path |

---

### `environment`

**Type:** `map<string, string>`  
**Required:** No

```yaml
environment:
  JAVA_HOME: /usr/lib/jvm
  TIMEOUT: "30"
```
---

### `mapping`

**Type:** `map<string, list<MappingEntry>>`  
**Required:** No

```yaml
mapping:
  depminer:
    - source: index
      destination: ./dx/init/index
      prefix: ${initialMissionName}
```

**Description:** Defines how files produced by an instrument are selected, renamed, and copied during the unpack action.
The mapping field is evaluated only when running an unpack action.
It allows the mission to specify, per instrument, which files from that instrument’s produced results should be copied into the final results structure, where they should be placed, and how they should be named.

####    Structure

- The top-level keys represent instrument names.
- Each instrument maps to a list of mapping entries.
- Each mapping entry describes how a single produced file should be handled.

A `MappingEntry` contains:

| Field         | Type   | Required | Description                                                                                                                                                              |
|---------------|--------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `source`      | string | Yes      | The file identifier (`fileId`) of a file produced by the instrument action. This value is matched against the keys defined in the action’s `produces` section.           |
| `destination` | string | Yes      | Target directory where the produced file will be copied. The directory is created if it does not exist. Relative paths are resolved using the current working directory. |
| `prefix`      | string | No       | Prefix or template used when building the destination file name. It may contain variables (for example `${initialMissionName}`) which are resolved at runtime.           |

#### Runtime behavior

When the `mapping` field is present, the unpack action uses it to select specific files produced by an instrument and copy them into the final results structure.
For each mapped file, the configuration defines where the file is placed and how it is named.
Produced files that are not referenced in `mapping` are not included in the final results.

---

### `instruments`

**Type:** `map<string, InstrumentConfig>`  
**Required:** No

```yaml
instruments:
  depminer:
    actions:
      analyze:
        parameters:
          level: deep
        environment:
          DEBUG: "true"
        commands:
          run:
            parameters:
              threads: 4
            environment:
              LOG_LEVEL: info
```

**Description:**

Defines which instruments are explicitly configured for the mission and allows mission-specific customization of their execution.

When this field is present:
- If `runsAll` is set to `false`, only the instruments listed here are executed as part of the mission.
- For each listed instrument, the mission can provide instrument-specific configuration that customizes how its actions and commands run, such as parameters and environment variables.

This field does not define new instruments; it only selects existing ones and overrides or supplements their default configuration for the scope of the mission.

---

### `resultsPath`

**Type:** `string`  
**Required:** No

```yaml
resultsPath: C:\path\to\future_result_dir
```

**Description:** Defines the path where the results archive will be generated.

#### Runtime behavior

If absent defaults to ./${mission_path}-voyager-results.zip

| Variable     | Value                       |
|--------------|-----------------------------|
| `resultsDir` | Normalized results dir path |

---

### `resultsUnpackTarget`

**Type:** `string`  
**Required:** No

```yaml
resultsUnpackTarget: C:\path\to\unpacked_results
```

**Description:** Defines the path where the results archive will be unpacked during an unpack mission.

#### Runtime behavior

If absent defaults to ./${mission_path}-voyager-results

| Variable     | Value                       |
|--------------|-----------------------------|
| `resultsDir` | Normalized results dir path |

---

### `runsAll`

**Type:** `boolean`  
**Required:** No

```yaml
runsAll: False
```

**Description:** This parameter controls if the mission runs all the instruments present in the instrumentsDir or only the one mentioned in the instruments field in the mission yaml.

---

### `missionNameInZipFile`

**Type:** `boolean`  
**Required:** No

```yaml
missionNameInZipFile: true
```

**Description:** Controls the name of the result folder generated by the unpack action.

---

### Variable override precedence

The mission supports two types of variables:
- command parameters
- environment variables

Both are resolved using a hierarchical precedence model, but their resolution order is different.

---

#### Command parameters precedence

When the same parameter is defined at multiple levels, values are resolved in the following order (from highest to lowest priority):

1. Mission command
2. Mission action
3. Instrument command
4. Instrument action

The first value found in this order is used, and any lower-priority definitions are ignored.

---

#### Environment variables precedence

Environment variables follow a similar hierarchy, with an additional mission-level scope:

1. Mission command
2. Mission action
3. Mission environment
4. Instrument command
5. Instrument action

As with parameters, the most specific applicable value takes precedence.
