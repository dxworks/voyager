#!/bin/bash

set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
orig_args=("$@")

uname_s="$(uname -s)"
uname_m="$(uname -m)"

v2_binary=""
mode="default_run"
v2_args=()

case "${uname_s}" in
    Linux*)
        v2_binary="${SCRIPT_DIR}/dx-voyager-linux-x64"
        ;;
    Darwin*)
        if [[ "${uname_m}" == "arm64" ]]; then
            v2_binary="${SCRIPT_DIR}/dx-voyager-macos-arm64"
        else
            v2_binary="${SCRIPT_DIR}/dx-voyager-macos-x64"
        fi
        ;;
esac

extract_run_mission_path() {
    local args=("$@")
    local in_actions=0

    for ((i=0; i<${#args[@]}; i++)); do
        if [[ "${args[$i]}" == "-m" || "${args[$i]}" == "--missionPath" ]]; then
            if (( i + 1 < ${#args[@]} )); then
                echo "${args[$((i + 1))]}"
                return
            fi
        elif [[ "${args[$i]}" == "-a" || "${args[$i]}" == "--actions" ]]; then
            # -a, --actions <actions...>: the words after it are action names, not the mission
            in_actions=1
        elif [[ "${args[$i]}" == "run" ]]; then
            continue
        elif [[ "${args[$i]}" != -* ]]; then
            if (( in_actions )); then
                continue
            fi
            echo "${args[$i]}"
            return
        else
            in_actions=0
        fi
    done
}

if [[ $# -eq 0 ]]; then
    mode="default_run"
    v2_args=(run)
elif [[ "$1" == "doctor" ]]; then
    mode="verify"
    shift
    v2_args=(verify "$@")
elif [[ "$1" == "verify" ]]; then
    mode="verify"
    v2_args=("$@")
elif [[ "$1" == "run" ]]; then
    mode="default_run"
    v2_args=("$@")
elif [[ "$1" == "clean" || "$1" == "pack" || "$1" == "unpack" || "$1" == "summary" || "$1" == "help" || "$1" == "--help" || "$1" == "-h" || "$1" == "--version" || "$1" == "-V" ]]; then
    mode="explicit"
    v2_args=("$@")
elif [[ "$1" != -* ]]; then
    # A bare mission path (V1's form): V2 takes a mission only with -m
    mode="default_run"
    v2_args=(run -m "$@")
else
    mode="default_run"
    v2_args=(run "$@")
fi

if [[ -n "${v2_binary}" && -f "${v2_binary}" ]]; then
    chmod +x "${v2_binary}" 2>/dev/null
    "${v2_binary}" "${v2_args[@]}"
    v2_exit_code=$?
    if [[ ${v2_exit_code} -eq 0 ]]; then
        exit 0
    fi
    echo "Voyager2 failed (exit ${v2_exit_code})."
else
    echo "Voyager2 binary not found for this platform."
    v2_exit_code=1
fi

if [[ "${mode}" == "verify" ]]; then
    echo "Falling back to Voyager1 doctor command..."
    # V1's doctor takes a check list, not a mission: it uses its own .doctor.yml
    java -Xmx8g -jar "${SCRIPT_DIR}/dx-voyager.jar" doctor
    exit $?
fi

if [[ "${mode}" == "default_run" ]]; then
    echo "Falling back to Voyager1 mission run..."
    mission_path="$(extract_run_mission_path "${orig_args[@]}")"
    # V1 stops on fields only V2 reads: give it an adapted copy of the mission (V1's default is ./mission.yml)
    adapter_input="${mission_path:-mission.yml}"
    adapted_path=""
    if [[ -f "${adapter_input}" ]]; then
        adapter_output="$(java -cp "${SCRIPT_DIR}/dx-voyager.jar" "${SCRIPT_DIR}/MissionAdapter.java" "${adapter_input}")"
        if [[ $? -eq 0 && -n "${adapter_output}" && "${adapter_output}" != "${adapter_input}" ]]; then
            adapted_path="${adapter_output}"
            mission_path="${adapted_path}"
        fi
    fi
    if [[ -n "${mission_path}" ]]; then
        java -Xmx8g -jar "${SCRIPT_DIR}/dx-voyager.jar" "${mission_path}"
    else
        java -Xmx8g -jar "${SCRIPT_DIR}/dx-voyager.jar"
    fi
    v1_exit_code=$?
    adapted_dir="$(dirname "${adapted_path}")"
    if [[ -n "${adapted_path}" && "$(basename "${adapted_dir}")" == voyager-v1-mission* ]]; then
        rm -rf "${adapted_dir}"
    fi
    exit ${v1_exit_code}
fi

exit ${v2_exit_code}
