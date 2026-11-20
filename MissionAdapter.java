import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import java.io.File;
import java.nio.file.Files;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Turns a V2 mission into one V1 accepts, for the launchers' fallback to V1.
 * V1 stops on any mission field it doesn't know, so only its fields are kept.
 * Runs with V1's jar on the class path (it brings the YAML reader):
 * java -cp dx-voyager.jar MissionAdapter.java <mission>
 * Prints the mission V1 should run: the same path when nothing had to change,
 * otherwise an adapted copy (same file name, in a temp folder). Notes go to stderr.
 */
public class MissionAdapter {
    private static final List<String> V1_MISSION_FIELDS =
            List.of("mission", "target", "resultsPath", "instruments", "environment", "instrumentsDir");
    private static final List<String> V1_INSTRUMENT_FIELDS = List.of("commands", "parameters", "thread");

    private static final ObjectMapper yaml = new ObjectMapper(new YAMLFactory());

    public static void main(String[] args) throws Exception {
        File missionFile = new File(args[0]).getAbsoluteFile();
        Map<String, Object> mission = asMap(yaml.readValue(missionFile, Object.class));
        if (mission == null) {
            System.out.println(args[0]);
            return;
        }

        Map<String, Object> adapted = new LinkedHashMap<>();
        Map<String, Object> variables = asMap(mission.get("variables"));
        for (Map.Entry<String, Object> field : mission.entrySet()) {
            String key = field.getKey();
            if (V1_MISSION_FIELDS.contains(key))
                adapted.put(key, field.getValue());
            else if ((key.equals("runAll") || key.equals("runsAll")) && Boolean.FALSE.equals(field.getValue()))
                note(key + ": false is not read by V1 (V1 takes runsAll from .config.yml): V1 runs every instrument");
            else if (!key.equals("variables") && !key.equals("runAll") && !key.equals("runsAll"))
                note(key + " is read only by V2: left out");
        }

        File instrumentsDir = instrumentsDir(adapted, missionFile);
        Map<String, Object> instruments = asMap(adapted.get("instruments"));
        if (instruments != null)
            adapted.put("instruments", adaptInstruments(instruments, v1Names(instrumentsDir)));
        if (variables != null)
            adapted = asMap(fillVariables(adapted, variables));

        if (adapted.equals(mission)) {
            System.out.println(args[0]);
            return;
        }
        // V1 looks for ./instruments next to the mission file; the copy lives elsewhere
        if (adapted.get("instrumentsDir") == null && globalInstrumentsDir() == null)
            adapted.put("instrumentsDir", instrumentsDir.getPath());
        File adaptedFile = Files.createTempDirectory("voyager-v1-mission").resolve(missionFile.getName()).toFile();
        yaml.writeValue(adaptedFile, adapted);
        System.out.println(adaptedFile.getPath());
    }

    // V2: instruments.<id>.actions.<action>.parameters; V1: instruments.<name>.parameters
    private static Map<String, Object> adaptInstruments(Map<String, Object> instruments, Map<String, String> v1Names) {
        Map<String, Object> adapted = new LinkedHashMap<>();
        instruments.forEach((id, value) -> {
            Map<String, Object> config = asMap(value);
            Map<String, Object> v1Config = new LinkedHashMap<>();
            if (config != null) {
                Map<String, Object> parameters = new LinkedHashMap<>();
                Map<String, Object> actions = asMap(config.get("actions"));
                if (actions != null) {
                    actions.forEach((action, actionValue) -> {
                        Map<String, Object> actionConfig = asMap(actionValue);
                        if (actionConfig == null) return;
                        Map<String, Object> actionParameters = asMap(actionConfig.get("parameters"));
                        if (actionParameters != null) parameters.putAll(actionParameters);
                        if (actionConfig.get("environment") != null || actionConfig.get("commands") != null)
                            note(id + ": the environment and commands of action " + action + " are read only by V2: left out");
                    });
                }
                for (Map.Entry<String, Object> field : config.entrySet()) {
                    if (V1_INSTRUMENT_FIELDS.contains(field.getKey()))
                        v1Config.put(field.getKey(), field.getValue());
                    else if (!field.getKey().equals("actions"))
                        note(id + ": " + field.getKey() + " is read only by V2: left out");
                }
                Map<String, Object> v1Parameters = asMap(v1Config.get("parameters"));
                if (v1Parameters != null) parameters.putAll(v1Parameters);
                if (!parameters.isEmpty()) v1Config.put("parameters", parameters);
            }
            adapted.put(v1Names.getOrDefault(id, id), config == null ? value : v1Config);
        });
        return adapted;
    }

    // V2 names an instrument by the id in instrument.v2.yml, V1 by the name in instrument.yml
    private static Map<String, String> v1Names(File instrumentsDir) {
        Map<String, String> names = new LinkedHashMap<>();
        File[] dirs = instrumentsDir.listFiles(File::isDirectory);
        if (dirs == null) return names;
        for (File dir : dirs) {
            try {
                Map<String, Object> v2 = asMap(yaml.readValue(new File(dir, "instrument.v2.yml"), Object.class));
                Map<String, Object> v1 = asMap(yaml.readValue(new File(dir, "instrument.yml"), Object.class));
                if (v2 != null && v1 != null && v2.get("id") != null && v1.get("name") != null)
                    names.put(v2.get("id").toString(), v1.get("name").toString());
            } catch (Exception ignored) {
                // a V2-only instrument (no instrument.yml): V1 doesn't run it
            }
        }
        return names;
    }

    // Where V1 will look for the instruments: the mission's instrumentsDir, .config.yml's, or next to the mission
    private static File instrumentsDir(Map<String, Object> mission, File missionFile) {
        Object dir = mission.get("instrumentsDir");
        if (dir == null) dir = globalInstrumentsDir();
        if (dir != null) return new File(dir.toString()).getAbsoluteFile();
        return new File(missionFile.getParentFile(), "instruments");
    }

    private static Object globalInstrumentsDir() {
        File globalConfig = new File(".config.yml");
        if (!globalConfig.exists()) return null;
        try {
            Map<String, Object> config = asMap(yaml.readValue(globalConfig, Object.class));
            return config == null ? null : config.get("instrumentsDir");
        } catch (Exception e) {
            return null;
        }
    }

    // V2 replaces ${name} with the mission's variables; V1 has no variables, so the values are written in
    private static Object fillVariables(Object value, Map<String, Object> variables) {
        if (value instanceof String) {
            String text = (String) value;
            for (Map.Entry<String, Object> variable : variables.entrySet())
                text = text.replace("${" + variable.getKey() + "}", Objects.toString(variable.getValue(), "null"));
            return text;
        }
        if (value instanceof Map) {
            Map<String, Object> filled = new LinkedHashMap<>();
            asMap(value).forEach((key, item) -> filled.put(key, fillVariables(item, variables)));
            return filled;
        }
        if (value instanceof List)
            return ((List<?>) value).stream().map(item -> fillVariables(item, variables)).collect(Collectors.toList());
        return value;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object value) {
        return value instanceof Map ? (Map<String, Object>) value : null;
    }

    private static void note(String message) {
        System.err.println("V1 mission adapter: " + message);
    }
}
