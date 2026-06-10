#!/bin/bash
# 云枢工作流初始化脚本
# 用法: eval "$(git rev-parse --show-toplevel)/workflow/init.sh"

set -euo pipefail

# 定位脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"

# 加载配置
if [ -f "$SCRIPT_DIR/config" ]; then
  source "$SCRIPT_DIR/config"
else
  echo "错误: 找不到配置文件 $SCRIPT_DIR/config" >&2
  exit 1
fi

# 确保产物目录存在
mkdir -p "$WORKFLOW_OUTPUT_DIR"/{screenshots,reports,qa,reviews,designs,plans,docs}

# 向后兼容：YUNSHU_HOME 作为 STATE_DIR 的别名
export YUNSHU_HOME="${YUNSHU_HOME:-$STATE_DIR}"

# 导出所有变量
export PROJECT_ROOT WORKFLOW_OUTPUT_DIR STATE_DIR AUTO_UPGRADE
export ADAPTER_OPENDCODE_DIR ADAPTER_CLAUDE_DIR ADAPTER_CURSOR_DIR
export ADAPTER_TRAE_DIR ADAPTER_CODEBUDDY_DIR
