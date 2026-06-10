#!/usr/bin/env bash
# scripts/os-detect.sh
# 报告当前环境对 skill 的支持情况，给出补全建议。
# 用法：os-detect.sh

set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# shellcheck source=_lib.sh
source "$SCRIPT_DIR/_lib.sh"

_os_report
