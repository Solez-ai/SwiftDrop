#!/bin/bash

# Exit on any error
set -e

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHANGELOG_FILE="${PROJECT_DIR}/CHANGELOG.md"

# Get current version from package.json
CURRENT_VERSION=$(grep '"version"' "${PROJECT_DIR}/package.json" | cut -d '"' -f 4)

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: Git is not installed."
    exit 1
fi

# Get the previous tag
PREV_TAG=$(git describe --tags --abbrev=0 --always 2>/dev/null || echo "")

# Create a temporary file for the new changelog
TEMP_FILE=$(mktemp)

echo "# Changelog" > "${TEMP_FILE}"
echo "" >> "${TEMP_FILE}"
echo "## [${CURRENT_VERSION}] - $(date +'%Y-%m-%d')" >> "${TEMP_FILE}"
echo "" >> "${TEMP_FILE}"

# Get commit messages since the last tag
if [ -z "${PREV_TAG}" ]; then
    # No previous tag, get all commits
    COMMIT_RANGE=""
else
    # Get commits since the last tag
    COMMIT_RANGE="${PREV_TAG}..HEAD"
fi

echo "### Added" >> "${TEMP_FILE}"
git log ${COMMIT_RANGE} --grep='^feat(' --pretty=format:'- %s' | sort -u >> "${TEMP_FILE}" 2>/dev/null || echo "- No new features" >> "${TEMP_FILE}"
echo "" >> "${TEMP_FILE}"

echo "### Changed" >> "${TEMP_FILE}"
git log ${COMMIT_RANGE} --grep='^refactor(' --pretty=format:'- %s' | sort -u >> "${TEMP_FILE}" 2>/dev/null || echo "- No changes" >> "${TEMP_FILE}"
echo "" >> "${TEMP_FILE}"

echo "### Fixed" >> "${TEMP_FILE}"
git log ${COMMIT_RANGE} --grep='^fix(' --pretty=format:'- %s' | sort -u >> "${TEMP_FILE}" 2>/dev/null || echo "- No bug fixes" >> "${TEMP_FILE}"
echo "" >> "${TEMP_FILE}"

# Add previous changelog if it exists
if [ -f "${CHANGELOG_FILE}" ]; then
    echo "" >> "${TEMP_FILE}"
    echo "---" >> "${TEMP_FILE}"
    echo "" >> "${TEMP_FILE}"
    tail -n +2 "${CHANGELOG_FILE}" >> "${TEMP_FILE}"
fi

# Replace the old changelog with the new one
mv "${TEMP_FILE}" "${CHANGELOG_FILE}"

echo "✅ Changelog generated successfully!"
echo "📝 Path: ${CHANGELOG_FILE}"
