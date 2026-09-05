#!/usr/bin/env pwsh
<#
  一键同步脚本 sync-update.ps1
  ============================================================
  用途：把本地技能改动一次性同步到 GitHub 仓库 + DSH 技能根。
  这是"源目录 = DSH 技能根"的更新入口：
    1) 在 DSH 技能根做 git add/commit/push（推 GitHub）
    2) （可选）把改动复制到项目工作副本/或反向拉取 —— 见配置区

  用法：
    powershell -ExecutionPolicy Bypass -File sync-update.ps1
    powershell -ExecutionPolicy Bypass -File sync-update.ps1 "v1.1 新增换肤"
    （无参数则提交信息用 "update: <时间戳>"）

  前置：
    - git 已安装且在 PATH
    - 已配置 remote（origin 指向 GitHub 仓库）
    - 凭据已就绪（credential helper 或已存 token；首次会提示）
#>
[CmdletBinding()]
param(
  [string]$Message = ""
)
$ErrorActionPreference = 'Stop'

# ───────────── 配置区（按需改）─────────────
# 技能源根 = 本脚本所在目录（通常就是 DSH 技能根 / 仓库根）
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
# 本地 git 身份（首次提交前需存在；没有会提示你配置）
# 可选：把改动同步到的另一份项目副本（留空 = 不复制）
$MirrorCopy = ""        # 例: "E:\some\other\copy"
# ───────────────────────────────────────────

Set-Location $RepoRoot
Write-Host "== 同步技能: $RepoRoot ==" -ForegroundColor Cyan

# 0) 是否 git 仓库
if (-not (Test-Path (Join-Path $RepoRoot '.git'))) {
  Write-Host "[x] 不是 git 仓库，请先: git init" -ForegroundColor Red
  exit 1
}

# 1) 检查状态
Write-Host "`n-- 当前状态 --" -ForegroundColor Yellow
git -C $RepoRoot status --short

$changes = git -C $RepoRoot status --porcelain
if (-not $changes) {
  Write-Host "`n没有未提交改动，无需同步。" -ForegroundColor Green
} else {
  # 2) 提交信息
  if (-not $Message) { $Message = "update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
  Write-Host "`n提交信息: $Message"

  # 3) add + commit
  git -C $RepoRoot add -A
  git -C $RepoRoot commit -m $Message
  if ($LASTEXITCODE -ne 0) { Write-Host "[x] commit 失败" -ForegroundColor Red; exit 1 }

  # 4) push（自动设上游；token 已存凭据管理器则免密）
  Write-Host "`n-- 推送 GitHub --" -ForegroundColor Yellow
  git -C $RepoRoot push
  if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[x] push 失败。可能是网络(GitHub被扰)或凭据问题。" -ForegroundColor Red
    Write-Host "    网络恢复后重跑本脚本即可；commit 已生成不会丢。" -ForegroundColor Yellow
    exit 1
  }
  Write-Host "[✓] 已推送到 GitHub" -ForegroundColor Green
}

# 5) 可选：镜像复制到另一目录（如你的项目内使用副本）
if ($MirrorCopy -and (Test-Path $MirrorCopy)) {
  Write-Host "`n-- 同步副本: $MirrorCopy --" -ForegroundColor Yellow
  # 复制除 .git、examples/out 外的全部（示例可留）
  robocopy $RepoRoot $MirrorCopy /E /XD .git examples\out /NFL /NDL /NJH /NJS /NC /NS | Out-Null
  Write-Host "[✓] 副本已更新" -ForegroundColor Green
}

# 6) 完成提示
$url = git -C $RepoRoot remote get-url origin 2>$null
if ($url) {
  $page = $url -replace '\.git$','' -replace '^git@github.com:','https://github.com/'
  Write-Host "`n完成。仓库: $page" -ForegroundColor Cyan
}
Write-Host "提示: 若改动影响 HTML 产物,记得通知使用者 Ctrl+F5 强刷。" -ForegroundColor DarkGray
exit 0
