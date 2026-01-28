# Instrument YAML File

The **instrument YAML file** defines an instrument, its metadata, and the actions it can execute.

This document describes:
- the supported YAML structure,
- each supported field,
- how the instrument definition is interpreted at runtime.

---

## Top-Level Fields

### `name`

**Type:** `string`  
**Required:** Yes

```yaml
name: instrument_name
```

**Description:**  
Human-readable name of the instrument. It is used for identification in logs, reports, and runtime context.

---

### `id`

**Type:** `string`  
**Required:** Yes

```yaml
id: instrument_id
```

**Description:**  
Unique identifier of the instrument. This value is used internally to reference the instrument, including variable scoping and configuration lookup.

---

### `version`

**Type:** `string`  
**Required:** No (recommended)

```yaml
version: X.X.X
```

**Description:**  
Version string of the instrument, used for informational and reporting purposes.

---

### `actions`

**Type:** `map<string, ActionConfig>`  
**Required:** Yes

```yaml
actions:
  start:
    commands:
      - id: run
        command: echo "Hello"
```

**Description:**  
Defines the set of actions supported by the instrument. Each action represents a logical execution step and may define commands, parameters, environment variables, and additional execution configuration.

#### Runtime behavior

Actions determine how an instrument is executed. When an instrument runs, its actions are invoked and their associated commands are executed in sequence. Some action names correspond to built-in default actions (such as `verify`, `pack`, `unpack`, and `clean`) and support additional configuration specific to their purpose.

---
