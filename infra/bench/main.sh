#!/usr/bin/env bash
set -euo pipefail

HOST="${HOST:-jopka-rpi3.lan}"
PORT="${PORT:-3000}"
PASSPHRASE="${PASSPHRASE:-$(openssl rand -hex 4)}"
BOARD_TAG="${BOARD_TAG:-rnd}"
THREADS_HEAVY_OFFSET="${THREADS_HEAVY_OFFSET:-50}"
BASE="http://${HOST}:${PORT}"
BOARDS_URL="${BASE}/api/v2/boards"
THREADS_URL="${BASE}/api/v2/board/${BOARD_TAG}/threads"
THREADS_HEAVY_URL="${THREADS_URL}?offset=${THREADS_HEAVY_OFFSET}"

if [[ -t 1 ]]; then
  RESET='\033[0m'
  BOLD='\033[1m'
  DIM='\033[2m'
  CYAN='\033[36m'
  GREEN='\033[32m'
  YELLOW='\033[33m'
  RED='\033[31m'
  BLUE='\033[34m'
  MAGENTA='\033[35m'
else
  RESET='' BOLD='' DIM='' CYAN='' GREEN='' YELLOW='' RED='' BLUE='' MAGENTA=''
fi

hr() {
  printf '%b\n' "${DIM}────────────────────────────────────────────────────────${RESET}"
}

title() {
  printf '\n%b\n' "${BOLD}${CYAN}$1${RESET}"
  hr
}

kv() {
  printf '  %b%-22s%b %s\n' "${DIM}" "$1" "${RESET}" "$2"
}

metric_color() {
  local label="$1"
  local value="$2"
  case "$label" in
    failed)
      if [[ "$value" != "0" ]]; then printf '%b' "${RED}${value}${RESET}"
      else printf '%b' "${GREEN}${value}${RESET}"
      fi
      ;;
    rps)
      printf '%b' "${GREEN}${value}${RESET}"
      ;;
    p99)
      printf '%b' "${YELLOW}${value}${RESET}"
      ;;
    *)
      printf '%s' "$value"
      ;;
  esac
}

extract_ab_metric() {
  local pattern="$1"
  local file="$2"
  grep -E "$pattern" "$file" | head -1 | sed -E 's/^[^:]*:[[:space:]]*//'
}

extract_percentile() {
  local pct="$1"
  local file="$2"
  grep -E "^[[:space:]]*${pct}%[[:space:]]" "$file" | awk '{print $2 " ms"}'
}

run_bench() {
  local name="$1"
  local desc="$2"
  local target="$3"
  shift 3

  title "${name}"
  kv "Target" "$target"
  kv "Profile" "$desc"
  printf '\n'

  local outfile
  outfile="$(mktemp)"

  if ! ab "$@" >"$outfile" 2>&1; then
    printf '%b\n' "${RED}ab failed:${RESET}"
    cat "$outfile"
    rm -f "$outfile"
    return 1
  fi

  local concurrency complete failed duration rps time_per_req transfer p50 p95 p99 p100
  concurrency="$(extract_ab_metric 'Concurrency Level:' "$outfile")"
  complete="$(extract_ab_metric 'Complete requests:' "$outfile")"
  failed="$(extract_ab_metric 'Failed requests:' "$outfile")"
  duration="$(extract_ab_metric 'Time taken for tests:' "$outfile")"
  rps="$(extract_ab_metric 'Requests per second:' "$outfile" | sed -E 's/[[:space:]]*\[#\/sec\].*//')"
  time_per_req="$(grep -E 'Time per request:' "$outfile" | head -1 | sed -E 's/^[^:]*:[[:space:]]*//')"
  transfer="$(extract_ab_metric 'Transfer rate:' "$outfile")"
  p50="$(extract_percentile 50 "$outfile")"
  p95="$(extract_percentile 95 "$outfile")"
  p99="$(extract_percentile 99 "$outfile")"
  p100="$(extract_percentile 100 "$outfile")"

  printf '%b\n' "${BOLD}Results${RESET}"
  kv "Concurrency" "$concurrency"
  kv "Complete requests" "$complete"
  kv "Failed requests" "$(metric_color failed "$failed")"
  kv "Duration" "$duration"
  kv "RPS" "$(metric_color rps "${rps} req/s")"
  kv "Latency (mean)" "$time_per_req"
  kv "Transfer rate" "$transfer"
  kv "p50" "$p50"
  kv "p95" "$p95"
  kv "p99" "$(metric_color p99 "$p99")"
  kv "p100 (max)" "$p100"

  # stash for summary
  BENCH_NAMES+=("$name")
  BENCH_RPS+=("$rps")
  BENCH_P50+=("$p50")
  BENCH_P99+=("$p99")
  BENCH_FAILED+=("$failed")

  rm -f "$outfile"
}

BENCH_NAMES=()
BENCH_RPS=()
BENCH_P50=()
BENCH_P99=()
BENCH_FAILED=()

printf '%b\n' "${BOLD}${MAGENTA}╔══════════════════════════════════════════════════════╗${RESET}"
printf '%b\n' "${BOLD}${MAGENTA}║${RESET}  ${BOLD}UMe-chan API benchmark${RESET}                             ${BOLD}${MAGENTA}║${RESET}"
printf '%b\n' "${BOLD}${MAGENTA}╚══════════════════════════════════════════════════════╝${RESET}"
kv "Backend" "${BASE}"
kv "Board" "${BOARD_TAG}"
kv "Tool" "ApacheBench (ab)"
printf '\n'

title "Setup"
kv "Passphrase" "$PASSPHRASE"
printf '%b\n' "${DIM}Requesting chat profile token...${RESET}"
TOKEN="$(curl -sf -X POST "${BASE}/api/v2/chat/identify" \
  -H 'Content-Type: application/json' \
  -d "$(jq -nc --arg passphrase "$PASSPHRASE" '{passphrase: $passphrase}')" \
  | jq -er '.profileToken')"

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  printf '%b\n' "${RED}Failed to obtain profileToken. Is the backend running?${RESET}" >&2
  exit 1
fi

kv "profileToken" "${TOKEN:0:8}…${TOKEN: -4}"

run_bench "Boards light" "no profile (boards only)" "${BOARDS_URL}" \
  -n 200 -c 1 -k "${BOARDS_URL}"

run_bench "Threads light" "first page (offset=0)" "${THREADS_URL}" \
  -n 200 -c 1 -k "${THREADS_URL}"

run_bench "Boards heavy" "with chat profile + unread counts" "${BOARDS_URL}" \
  -n 3000 -c 20 -k \
  -H "Cookie: umechan_chat_profile=${TOKEN}" \
  "${BOARDS_URL}"

run_bench "Threads heavy" "offset=${THREADS_HEAVY_OFFSET}, high concurrency" "${THREADS_HEAVY_URL}" \
  -n 3000 -c 20 -k "${THREADS_HEAVY_URL}"

title "Summary"
printf '  %b%-16s %12s %12s %12s %8s%b\n' "${BOLD}" "Bench" "RPS" "p50" "p99" "Failed" "${RESET}"
hr
for i in "${!BENCH_NAMES[@]}"; do
  printf '  %-16s %12s %12s %12s %8s\n' \
    "${BENCH_NAMES[$i]}" \
    "${BENCH_RPS[$i]}" \
    "${BENCH_P50[$i]}" \
    "${BENCH_P99[$i]}" \
    "${BENCH_FAILED[$i]}"
done
printf '\n'
