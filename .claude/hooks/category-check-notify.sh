#!/bin/bash

# Claude Code Hook: 카테고리/타입 관련 파일 수정 시 알림
# PostToolUse (Edit, Write) 훅에서 호출됨

# stdin에서 JSON 읽기
INPUT=$(cat)

# tool_input에서 file_path 추출
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# 파일 경로가 없으면 종료
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# 카테고리/타입 관련 파일 패턴 체크
CATEGORY_PATTERNS=(
  "types/index.ts"
  "lib/constants.ts"
  "CategorySelect"
  "SeasonSelect"
  "FilterBar"
  "AddClothesModal"
  "OutfitSaveSection"
  "useFilter"
  "useAddClothes"
)

MATCHED=false

for pattern in "${CATEGORY_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    MATCHED=true
    break
  fi
done

# 매칭되면 알림 표시
if [ "$MATCHED" = true ]; then
  osascript -e "display notification \"$FILE_PATH 수정됨\ncategory-tag-checker 실행을 권장합니다\" with title \"Category/Type 변경 감지\" sound name \"Pop\""
fi

exit 0
