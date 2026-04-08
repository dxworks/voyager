#!/bin/bash

set +e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

uname_s="$(uname -s)"
uname_m="$(uname -m)"

v2_binary=""
mission_path=""

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

if [[ -n "${v2_binary}" && -f "${v2_binary}" ]]; then
    chmod +x "${v2_binary}" 2>/dev/null
    if [[ $# -eq 0 ]]; then
        "${v2_binary}" run
    elif [[ "$1" == "run" ]]; then
        "${v2_binary}" "$@"
    else
        "${v2_binary}" run "$@"
    fi
    v2_exit_code=$?
    if [[ ${v2_exit_code} -eq 0 ]]; then
        exit 0
    fi
    echo "Voyager2 failed (exit ${v2_exit_code}). Falling back to Voyager1..."
else
    echo "Voyager2 binary not found for this platform. Falling back to Voyager1..."
fi

args=("$@")
for ((i=0; i<${#args[@]}; i++)); do
    if [[ "${args[$i]}" == "-m" || "${args[$i]}" == "--missionPath" ]]; then
        if (( i + 1 < ${#args[@]} )); then
            mission_path="${args[$((i + 1))]}"
        fi
        break
    fi
done

if [[ -n "${mission_path}" ]]; then
    java -Xmx8g -jar "${SCRIPT_DIR}/dx-voyager.jar" "${mission_path}"
else
    java -Xmx8g -jar "${SCRIPT_DIR}/dx-voyager.jar"
fi
exit $?
