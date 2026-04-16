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

extract_verify_mission_path() {
    local args=("$@")
    local start=0

    if [[ ${#args[@]} -gt 0 && ( "${args[0]}" == "verify" || "${args[0]}" == "doctor" ) ]]; then
        start=1
    fi

    for ((i=start; i<${#args[@]}; i++)); do
        if [[ "${args[$i]}" == "-m" || "${args[$i]}" == "--missionPath" ]]; then
            if (( i + 1 < ${#args[@]} )); then
                echo "${args[$((i + 1))]}"
                return
            fi
        elif [[ "${args[$i]}" != -* ]]; then
            echo "${args[$i]}"
            return
        fi
    done
}

extract_run_mission_path() {
    local args=("$@")

    for ((i=0; i<${#args[@]}; i++)); do
        if [[ "${args[$i]}" == "-m" || "${args[$i]}" == "--missionPath" ]]; then
            if (( i + 1 < ${#args[@]} )); then
                echo "${args[$((i + 1))]}"
                return
            fi
        elif [[ "${args[$i]}" == "run" ]]; then
            continue
        elif [[ "${args[$i]}" != -* ]]; then
            echo "${args[$i]}"
            return
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
elif [[ "$1" == "run" || "$1" == "clean" || "$1" == "pack" || "$1" == "unpack" || "$1" == "summary" || "$1" == "help" || "$1" == "--help" || "$1" == "-h" || "$1" == "--version" || "$1" == "-V" ]]; then
    mode="explicit"
    v2_args=("$@")
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
    mission_path="$(extract_verify_mission_path "${orig_args[@]}")"
    if [[ -n "${mission_path}" ]]; then
        java -Xmx8g -jar "${SCRIPT_DIR}/dx-voyager.jar" doctor "${mission_path}"
    else
        java -Xmx8g -jar "${SCRIPT_DIR}/dx-voyager.jar" doctor
    fi
    exit $?
fi

if [[ "${mode}" == "default_run" ]]; then
    echo "Falling back to Voyager1 mission run..."
    mission_path="$(extract_run_mission_path "${orig_args[@]}")"
    if [[ -n "${mission_path}" ]]; then
        java -Xmx8g -jar "${SCRIPT_DIR}/dx-voyager.jar" "${mission_path}"
    else
        java -Xmx8g -jar "${SCRIPT_DIR}/dx-voyager.jar"
    fi
    exit $?
fi

exit ${v2_exit_code}
