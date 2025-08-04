#!/bin/bash

# Exit on any error
set -e

echo "📊 Starting performance monitoring..."

# Check if adb is installed
if ! command -v adb &> /dev/null; then
    echo "Error: ADB is not installed or not in PATH."
    echo "Please install Android SDK Platform-Tools:"
    echo "  - macOS: brew install android-platform-tools"
    echo "  - Ubuntu/Debian: sudo apt-get install android-sdk-platform-tools"
    echo "  - Windows: Install via Android Studio SDK Manager"
    exit 1
fi

# Check if a device is connected
if ! adb devices | grep -w "device" &> /dev/null; then
    echo "No Android device found. Please connect a device or start an emulator."
    echo "List of connected devices:"
    adb devices
    exit 1
fi

# Get package name from build.gradle
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="${PROJECT_DIR}/android"
PACKAGE_NAME=$(grep "applicationId" "${ANDROID_DIR}/app/build.gradle" | sed "s/.*applicationId \"\(.*\)\"/\1/" | head -n 1 | tr -d '[:space:]')

if [ -z "${PACKAGE_NAME}" ]; then
    echo "❌ Error: Could not determine package name."
    exit 1
fi

# Create logs directory
LOG_DIR="${PROJECT_DIR}/performance_logs"
mkdir -p "${LOG_DIR}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="${LOG_DIR}/performance_${TIMESTAMP}.csv"

# Write CSV header
echo "timestamp,cpu_usage(%),memory_usage(MB),frames_rendered,fps,threads,network_rx(kB/s),network_tx(kB/s)" > "${LOG_FILE}"

echo "📈 Monitoring performance for package: ${PACKAGE_NAME}"
echo "📝 Logging to: ${LOG_FILE}"
echo "Press Ctrl+C to stop monitoring..."

# Function to get CPU usage for a process
get_cpu_usage() {
    local pid=$1
    # Get CPU usage in percentage (user + system)
    local cpu_usage=$(adb shell top -n 1 -b -o %CPU -p ${pid} | grep ${pid} | awk '{print $9}' | tr -d '%')
    echo "${cpu_usage:-0}"
}

# Function to get memory usage for a process
get_memory_usage() {
    local pid=$1
    # Get memory usage in MB
    local mem_usage=$(adb shell dumpsys meminfo ${PACKAGE_NAME} | grep -E "TOTAL.*:|TOTAL" | head -1 | awk '{print $2}' | awk '{printf "%.1f", $1/1024}')
    echo "${mem_usage:-0}"
}

# Function to get FPS and frame stats
get_frame_stats() {
    local stats=$(adb shell dumpsys gfxinfo ${PACKAGE_NAME} | grep -A 128 "Profile data in ms")
    local frames=$(echo "${stats}" | grep -o "[0-9.]\+" | wc -l)
    local total_ms=$(echo "${stats}" | grep -o "[0-9.]\+" | awk '{s+=$1} END {print s}')
    
    local fps="0"
    if [ "${total_ms}" != "0" ]; then
        fps=$(echo "scale=1; ${frames}*1000/${total_ms}" | bc)
    fi
    
    echo "${frames},${fps}"
}

# Function to get network usage
get_network_usage() {
    local pid=$1
    # Get network stats in kB/s
    local net_stats=$(adb shell cat /proc/net/xt_qtaguid/stats | grep ${pid} | tail -1)
    
    if [ -z "${net_stats}" ]; then
        echo "0,0"
        return
    fi
    
    local rx_bytes=$(echo ${net_stats} | awk '{print $6}')
    local tx_bytes=$(echo ${net_stats} | awk '{print $8}')
    
    # Convert to kB/s (this is a simple implementation, real monitoring would track over time)
    local rx_kbps=$(echo "scale=1; ${rx_bytes}/1024" | bc)
    local tx_kbps=$(echo "scale=1; ${tx_bytes}/1024" | bc)
    
    echo "${rx_kbps:-0},${tx_kbps:-0}"
}

# Main monitoring loop
while true; do
    # Get process ID
    PID=$(adb shell pidof -s ${PACKAGE_NAME} || echo "")
    
    if [ -z "${PID}" ]; then
        echo "App not running. Waiting for process to start..."
        sleep 2
        continue
    fi
    
    # Get current timestamp
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    
    # Get CPU usage
    CPU_USAGE=$(get_cpu_usage ${PID})
    
    # Get memory usage
    MEM_USAGE=$(get_memory_usage ${PID})
    
    # Get frame stats
    FRAME_STATS=$(get_frame_stats)
    FRAMES_RENDERED=$(echo ${FRAME_STATS} | cut -d, -f1)
    FPS=$(echo ${FRAME_STATS} | cut -d, -f2)
    
    # Get thread count
    THREADS=$(adb shell ls -1 /proc/${PID}/task/ | wc -l)
    
    # Get network usage
    NETWORK_STATS=$(get_network_usage ${PID})
    NET_RX=$(echo ${NETWORK_STATS} | cut -d, -f1)
    NET_TX=$(echo ${NETWORK_STATS} | cut -d, -f2)
    
    # Write to CSV
    echo "${TIMESTAMP},${CPU_USAGE},${MEM_USAGE},${FRAMES_RENDERED},${FPS},${THREADS},${NET_RX},${NET_TX}" >> "${LOG_FILE}"
    
    # Display current stats
    echo -ne "\r[${TIMESTAMP}] CPU: ${CPU_USAGE}% | MEM: ${MEM_USAGE}MB | FPS: ${FPS} | Threads: ${THREADS} | Net: ↓${NET_RX}kB/s ↑${NET_TX}kB/s"
    
    # Wait before next measurement
    sleep 1
done
