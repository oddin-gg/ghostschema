$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

if (-not (Get-Command k6 -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: k6 is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "$PSScriptRoot\bragi_proto")) {
    Write-Host "ERROR: bragi_proto/ not found. Run 'bash setup_protos.sh' in Git Bash (or WSL) to fetch bragi proto definitions." -ForegroundColor Red
    exit 1
}

$tests = @(
    "ghost_match_status.js",
    "ghost_match_info.js"
)

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host "    Ghost gRPC - K6 Test Suite" -ForegroundColor Cyan
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host ""

$results = @()
$allFailures = @()
$total = $tests.Count
$idx = 0

foreach ($test in $tests) {
    $idx++
    Write-Host "  [$idx/$total] Running $test ..." -ForegroundColor Gray

    $output = & k6 run $test 2>&1 | Out-String
    $exitCode = $LASTEXITCODE

    $passed = ([regex]::Matches($output, [char]0x2713)).Count
    $failed = ([regex]::Matches($output, [char]0x2717)).Count
    $checkTotal = $passed + $failed

    $failedLines = $output -split "`n" | Where-Object { $_ -match [char]0x2717 -and $_ -notmatch "rate=" }

    $result = [PSCustomObject]@{
        File = $test
        Passed = $passed
        Total = $checkTotal
        Status = if ($exitCode -eq 0) { "PASS" } else { "FAIL" }
    }
    $results += $result

    foreach ($line in $failedLines) {
        $trimmed = $line.Trim()
        if ($trimmed) {
            $allFailures += "    $test : $trimmed"
        }
    }
}

Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host "    GHOST TEST RESULTS" -ForegroundColor Cyan
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($r in $results) {
    $color = if ($r.Status -eq "PASS") { "Green" } else { "Red" }
    $icon = if ($r.Status -eq "PASS") { "PASS" } else { "FAIL" }
    Write-Host ("  {0}  {1,-45} [{2}/{3}]" -f $icon, $r.File, $r.Passed, $r.Total) -ForegroundColor $color
}

$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host ""
Write-Host "  ------------------------------------------" -ForegroundColor Cyan
Write-Host "   $passCount passed, $failCount failed out of $total" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host "  ------------------------------------------" -ForegroundColor Cyan

if ($allFailures.Count -gt 0) {
    Write-Host ""
    Write-Host "  FAILED CHECKS:" -ForegroundColor Red
    Write-Host ""
    foreach ($f in $allFailures) {
        Write-Host $f -ForegroundColor Red
    }
    Write-Host ""
}

if ($failCount -gt 0) {
    exit 1
}
