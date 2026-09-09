"use client";

import { useMemo, useState } from "react";

type TopologyMode = "shared" | "dedicated";
type PresetKey = "lab" | "ha4" | "enterprise" | "custom";
type IndexPartitionMode = "auto" | "manual";

type FarmConfig = {
  version: "se" | "2019" | "2016";
  topology: TopologyMode;
  users: number;
  contentTb: number;
  expectedIndexedItemsMillions: number;
  indexPartitionMode: IndexPartitionMode;
  indexPartitions: number;
  indexReplicas: number;
  ha: boolean;
  faultDomains: boolean;
  dr: boolean;
  search: boolean;
  oos: boolean;
  workflow: boolean;
  wfe: number;
  cache: number;
  app: number;
  searchNodes: number;
  sql: number;
  oosNodes: number;
  workflowNodes: number;
};

type IconName = "brand" | "download" | "print" | "reset" | "users" | "database" | "shield" | "server" | "traffic" | "search" | "app" | "check" | "alert" | "info" | "chevron" | "code";

const iconPaths: Record<IconName, React.ReactNode> = {
  brand: <><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></>,
  download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
  print: <><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/></>,
  reset: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></>,
  server: <><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6h.01M7 17h.01"/></>,
  traffic: <><path d="M4 17h16"/><path d="M6 17V9h12v8"/><path d="M9 9V5h6v4"/><path d="M12 2v3"/></>,
  search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
  app: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 17.5h7M17.5 14v7"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  alert: <><path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
  info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  code: <><path d="m8 9-3 3 3 3"/><path d="m16 9 3 3-3 3"/><path d="m14 5-4 14"/></>,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>;
}

const baseConfig: FarmConfig = {
  version: "se", topology: "shared", users: 5000, contentTb: 2, ha: true,
  expectedIndexedItemsMillions: 5, indexPartitionMode: "auto", indexPartitions: 1, indexReplicas: 2,
  faultDomains: true, dr: false, search: true, oos: true, workflow: false,
  wfe: 2, cache: 2, app: 2, searchNodes: 2, sql: 2, oosNodes: 2, workflowNodes: 0,
};

const presets: Record<Exclude<PresetKey, "custom">, FarmConfig> = {
  lab: { ...baseConfig, users: 250, contentTb: .25, expectedIndexedItemsMillions: .5, indexReplicas: 1, ha: false, faultDomains: false, oos: false, wfe: 1, cache: 1, app: 1, searchNodes: 1, sql: 1, oosNodes: 0 },
  ha4: baseConfig,
  enterprise: { ...baseConfig, topology: "dedicated", users: 15000, contentTb: 8, expectedIndexedItemsMillions: 40, indexPartitions: 2, wfe: 2, cache: 2, app: 2, searchNodes: 2, sql: 2, oosNodes: 2 },
};

const presetLabels: { key: PresetKey; label: string; meta: string }[] = [
  { key: "lab", label: "Lab", meta: "2 SP + 1 SQL" },
  { key: "ha4", label: "4-Server HA", meta: "Shared MinRole" },
  { key: "enterprise", label: "Enterprise", meta: "Dedicated roles" },
  { key: "custom", label: "Custom", meta: "Manual design" },
];

const roleMeta = {
  wfe: { label: "Front-end", short: "WFE", icon: "traffic" as IconName, color: "blue", cpu: 8, ram: 24 },
  cache: { label: "Distributed Cache", short: "DC", icon: "server" as IconName, color: "cyan", cpu: 8, ram: 24 },
  app: { label: "Application", short: "APP", icon: "app" as IconName, color: "violet", cpu: 8, ram: 24 },
  search: { label: "Search", short: "SRCH", icon: "search" as IconName, color: "teal", cpu: 12, ram: 32 },
  sql: { label: "SQL Server", short: "SQL", icon: "database" as IconName, color: "amber", cpu: 16, ram: 64 },
  oos: { label: "Office Online", short: "OOS", icon: "server" as IconName, color: "rose", cpu: 8, ram: 16 },
  workflow: { label: "Workflow Manager", short: "WFM", icon: "app" as IconName, color: "slate", cpu: 8, ram: 16 },
};

function Stepper({ value, min = 0, max = 8, onChange, label }: { value: number; min?: number; max?: number; onChange: (value: number) => void; label: string }) {
  return <div className="stepper" aria-label={`${label} server count`}><button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Decrease ${label}`}>−</button><span>{value}</span><button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Increase ${label}`}>+</button></div>;
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button type="button" className={`switch ${checked ? "is-on" : ""}`} role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}><span /></button>;
}

function ServerCard({ type, index, combinedWith, faultDomains }: { type: keyof typeof roleMeta; index: number; combinedWith?: keyof typeof roleMeta; faultDomains: boolean }) {
  const meta = roleMeta[type];
  const combined = combinedWith ? roleMeta[combinedWith] : null;
  return <article className={`server-card server-${meta.color}`}><div className="server-icon"><Icon name={meta.icon} size={17} /></div><div className="server-copy"><strong>SP-{meta.short}-{String(index + 1).padStart(2, "0")}</strong><span>{meta.label}{combined ? ` + ${combined.label}` : ""}</span></div><span className={`zone-tag ${faultDomains ? "" : "zone-off"}`} title="Infrastructure planning label only; SharePoint does not configure or track this value.">{faultDomains ? (index % 2 === 0 ? "Failure group 1" : "Failure group 2") : "Single group"}</span></article>;
}

function NodeGroup({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <section className="node-group"><div className="node-group-title"><span>{eyebrow}</span><strong>{title}</strong></div><div className="node-list">{children}</div></section>;
}

function psQuote(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

const INDEX_ITEMS_PER_PARTITION_MILLIONS = 20;
const MAX_INDEX_PARTITIONS = 25;
const MAX_INDEX_REPLICAS = 3;
const MAX_INDEX_COMPONENTS = 60;
const MAX_INDEX_COMPONENTS_PER_SERVER = 4;
const MAX_NON_CRAWL_SEARCH_COMPONENTS = 64;

function recommendedIndexPartitions(expectedIndexedItemsMillions: number) {
  return Math.max(1, Math.ceil(expectedIndexedItemsMillions / INDEX_ITEMS_PER_PARTITION_MILLIONS));
}

function selectedIndexPartitions(config: FarmConfig) {
  return config.indexPartitionMode === "auto"
    ? recommendedIndexPartitions(config.expectedIndexedItemsMillions)
    : config.indexPartitions;
}

function searchPlacementCounts(searchServerCount: number) {
  if (searchServerCount <= 2) {
    return { bulkCount: searchServerCount, queryCount: searchServerCount, adminCount: Math.min(2, searchServerCount) };
  }

  return {
    bulkCount: Math.ceil(searchServerCount / 2),
    queryCount: Math.ceil(searchServerCount / 2),
    adminCount: Math.min(2, searchServerCount),
  };
}

function recommendedSearchServerCount(partitions: number, replicas: number, highAvailability: boolean) {
  const requiredIndexHosts = Math.max(replicas, Math.ceil((partitions * replicas) / MAX_INDEX_COMPONENTS_PER_SERVER));
  const minimumServers = highAvailability ? 2 : 1;
  return Math.min(16, Math.max(minimumServers, requiredIndexHosts <= 2 ? requiredIndexHosts : (requiredIndexHosts * 2) - 1));
}

export function buildSearchPowerShell(config: FarmConfig, searchServers: string[]) {
  const versionLabel = config.version === "se" ? "SharePoint Server Subscription Edition" : `SharePoint Server ${config.version}`;
  const topologyLabel = config.topology === "shared" ? "Shared MinRole (Application + Search)" : "Dedicated Search MinRole";
  const partitionCount = selectedIndexPartitions(config);
  const replicaCount = config.indexReplicas;
  const indexComponentCount = partitionCount * replicaCount;
  const serverLines = searchServers.map((server, index) => `        ${psQuote(server)}${index < searchServers.length - 1 ? "," : ""}`);

  return [
    "#requires -Version 5.1",
    "#requires -RunAsAdministrator",
    "<#",
    ".SYNOPSIS",
    "    Creates a SharePoint Search Service Application and a highly available Search topology.",
    ".DESCRIPTION",
    `    Farm Studio selection: ${versionLabel} | ${topologyLabel} | ${searchServers.length} Search node(s).`,
    `    Index design: ${config.expectedIndexedItemsMillions} million expected items | ${partitionCount} partition(s) | ${replicaCount} replica(s) per partition | ${indexComponentCount} index component(s).`,
    "    The script uses safe defaults for a new or empty Search Service Application.",
    "    If components already exist in the active topology, it stops without making changes to protect the live environment.",
    ".NOTES",
    "    1. Run in SharePoint Management Shell as a Farm Administrator.",
    "    2. Replace CONTOSO\\sp_search, SQL-LISTENER, and the server names for your environment.",
    "    3. Run with -WhatIf first; verify backup and rollback plans before production use.",
    "    4. The planning baseline is one partition per 20 million indexed items with the recommended index-server resources.",
    "    5. SharePoint Server 2016 with less than 500 GB index storage, 32 GB RAM, or eight CPU cores should use 10 million items per partition.",
    "    6. The script places replicas of the same partition on distinct Search servers.",
    "    7. SharePoint does not configure or track fault-domain labels. For high availability, deploy redundant Search servers on separate physical hosts, racks, storage or power failure groups, or availability zones, and verify that placement with the infrastructure team.",
    "",
    "    Microsoft references:",
    "    https://learn.microsoft.com/sharepoint/search/redesign-for-specific-performance-requirements",
    "    https://learn.microsoft.com/powershell/module/sharepointserver/new-spenterprisesearchserviceapplication",
    "    https://learn.microsoft.com/powershell/module/sharepointserver/new-spenterprisesearchtopology",
    "    https://learn.microsoft.com/powershell/module/sharepointserver/set-spenterprisesearchtopology",
    "#>",
    "",
    "[CmdletBinding(SupportsShouldProcess = $true)]",
    "param(",
    "    [string]$SearchServiceApplicationName = 'Search Service Application',",
    "    [string]$SearchServiceApplicationProxyName = 'Search Service Application Proxy',",
    "    [string]$ApplicationPoolName = 'SharePoint Search Service App Pool',",
    "    [string]$SearchServiceAccount = 'CONTOSO\\sp_search',",
    "    [string]$DatabaseServer = 'SQL-LISTENER',",
    "    [string]$DatabaseName = 'SP_Search_Service',",
    "    [string]$IndexRoot = 'D:\\SharePointIndex',",
    "    [string[]]$SearchServers = @(",
    ...serverLines,
    "    ),",
    "    [ValidateRange(0.5, 500)]",
    `    [double]$ExpectedIndexedItemsMillions = ${config.expectedIndexedItemsMillions},`,
    `    [ValidateRange(1, ${MAX_INDEX_PARTITIONS})]`,
    `    [int]$IndexPartitionCount = ${partitionCount},`,
    `    [ValidateRange(1, ${MAX_INDEX_REPLICAS})]`,
    `    [int]$IndexReplicasPerPartition = ${replicaCount},`,
    "    [System.Management.Automation.PSCredential]$DefaultContentAccessCredential = $null,",
    "    [string]$ContentSourceName = 'Local SharePoint sites',",
    "    [string[]]$ContentSourceStartAddresses = @(),",
    "    [switch]$EnableContinuousCrawls,",
    "    [switch]$StartFullCrawl",
    ")",
    "",
    "Set-StrictMode -Version Latest",
    "$ErrorActionPreference = 'Stop'",
    "",
    "function Write-Step {",
    "    param([string]$Message)",
    "    Write-Host ('[Farm Studio] ' + $Message) -ForegroundColor Cyan",
    "}",
    "",
    "function Wait-SearchServiceInstanceOnline {",
    "    param(",
    "        [Parameter(Mandatory = $true)]$Instance,",
    "        [int]$TimeoutMinutes = 10",
    "    )",
    "",
    "    $deadline = (Get-Date).AddMinutes($TimeoutMinutes)",
    "    do {",
    "        $current = Get-SPEnterpriseSearchServiceInstance -Identity $Instance.Id",
    "        if ($current.Status -eq 'Online') { return $current }",
    "        if ((Get-Date) -ge $deadline) {",
    "            throw \"Search service instance '$($Instance.Server)' did not become Online within the configured timeout.\"",
    "        }",
    "        Start-Sleep -Seconds 10",
    "    } while ($true)",
    "}",
    "",
    "if (-not (Get-PSSnapin -Name 'Microsoft.SharePoint.PowerShell' -ErrorAction SilentlyContinue)) {",
    "    Add-PSSnapin 'Microsoft.SharePoint.PowerShell'",
    "}",
    "",
    "if ($SearchServers.Count -lt 1) { throw 'Specify at least one Search server.' }",
    "if (($SearchServers | Select-Object -Unique).Count -ne $SearchServers.Count) { throw 'The SearchServers list contains duplicate server names.' }",
    "$recommendedPartitionCount = [int][Math]::Ceiling($ExpectedIndexedItemsMillions / 20.0)",
    "if ($IndexPartitionCount -lt $recommendedPartitionCount) {",
    "    Write-Warning \"The selected $IndexPartitionCount partition(s) are below the planning baseline of $recommendedPartitionCount for $ExpectedIndexedItemsMillions million expected items. Validate this override with load testing.\"",
    "}",
    "$requiredIndexComponents = $IndexPartitionCount * $IndexReplicasPerPartition",
    `if ($requiredIndexComponents -gt ${MAX_INDEX_COMPONENTS}) { throw "The design requires $requiredIndexComponents index components; the supported limit is ${MAX_INDEX_COMPONENTS} per Search Service Application." }`,
    "if ($SearchServiceAccount -eq 'CONTOSO\\sp_search' -or $DatabaseServer -eq 'SQL-LISTENER') {",
    "    throw 'Safety stop: replace the SearchServiceAccount and DatabaseServer placeholders for your environment.'",
    "}",
    "",
    "$targetDescription = \"$SearchServiceApplicationName on $($SearchServers -join ', ')\"",
    "if (-not $PSCmdlet.ShouldProcess($targetDescription, 'Provision SharePoint Search topology')) { return }",
    "",
    "Write-Step 'Running farm and account pre-checks'",
    "$null = Get-SPFarm",
    "$managedAccount = Get-SPManagedAccount | Where-Object { $_.UserName -ieq $SearchServiceAccount } | Select-Object -First 1",
    "if ($null -eq $managedAccount) {",
    "    throw \"$SearchServiceAccount is not a registered SharePoint managed account. Run Register-SPManagedAccount first.\"",
    "}",
    "",
    "$instanceByServer = @{}",
    "",
    "foreach ($serverName in $SearchServers) {",
    "    $farmServer = Get-SPServer -Identity $serverName -ErrorAction SilentlyContinue",
    "    if ($null -eq $farmServer) { throw \"Server '$serverName' was not found in the SharePoint farm. Check its NetBIOS or FQDN name.\" }",
    "",
    "    $instance = Get-SPEnterpriseSearchServiceInstance -Identity $serverName -ErrorAction SilentlyContinue",
    "    if ($null -eq $instance) { throw \"No SharePoint Server Search service instance was found on $serverName. Check MinRole and installation status.\" }",
    "",
    "    if ($instance.Status -ne 'Online') {",
    "        Write-Step \"Starting Search service instance: $serverName\"",
    "        Start-SPEnterpriseSearchServiceInstance -Identity $instance -Confirm:$false | Out-Null",
    "        $instance = Wait-SearchServiceInstanceOnline -Instance $instance",
    "    }",
    "    $instanceByServer[$serverName] = $instance",
    "}",
    "",
    "Write-Step 'Preparing the Service Application Pool'",
    "$applicationPool = Get-SPServiceApplicationPool -Identity $ApplicationPoolName -ErrorAction SilentlyContinue",
    "if ($null -eq $applicationPool) {",
    "    $applicationPool = New-SPServiceApplicationPool -Name $ApplicationPoolName -Account $SearchServiceAccount",
    "}",
    "",
    "Write-Step 'Preparing the Search Service Application and proxy'",
    "$ssa = Get-SPEnterpriseSearchServiceApplication -Identity $SearchServiceApplicationName -ErrorAction SilentlyContinue",
    "if ($null -eq $ssa) {",
    "    $ssa = New-SPEnterpriseSearchServiceApplication -Name $SearchServiceApplicationName -ApplicationPool $applicationPool -DatabaseServer $DatabaseServer -DatabaseName $DatabaseName",
    "}",
    "",
    "$ssaProxy = Get-SPEnterpriseSearchServiceApplicationProxy | Where-Object { $_.Name -eq $SearchServiceApplicationProxyName } | Select-Object -First 1",
    "if ($null -eq $ssaProxy) {",
    "    $ssaProxy = New-SPEnterpriseSearchServiceApplicationProxy -Name $SearchServiceApplicationProxyName -SearchApplication $ssa",
    "}",
    "",
    "if ($null -ne $DefaultContentAccessCredential) {",
    "    Write-Step 'Assigning a separate Default Content Access Account'",
    "    Set-SPEnterpriseSearchServiceApplication -Identity $ssa -DefaultContentAccessAccountName $DefaultContentAccessCredential.UserName -DefaultContentAccessAccountPassword $DefaultContentAccessCredential.Password",
    "} else {",
    "    Write-Warning 'Best practice: use -DefaultContentAccessCredential to specify a least-privileged crawl account separate from the Search service account.'",
    "}",
    "",
    "Write-Step 'Checking the current active Search topology'",
    "$activeTopology = Get-SPEnterpriseSearchTopology -SearchApplication $ssa -Active",
    "$activeComponents = @(Get-SPEnterpriseSearchComponent -SearchTopology $activeTopology -SearchApplication $ssa)",
    "if ($activeComponents.Count -gt 0) {",
    "    $activeComponents | Select-Object Name, ServerName | Format-Table -AutoSize",
    "    throw 'Safety stop: the active topology already contains components. This script does not modify a live topology automatically. Prepare a separate migration plan.'",
    "}",
    "",
    "# Components are combined in small topologies; with 3+ nodes, bulk and real-time workloads are separated.",
    "if ($SearchServers.Count -le 2) {",
    "    $bulkServers = @($SearchServers)",
    "    $queryServers = @($SearchServers)",
    "} else {",
    "    $bulkCount = [int][Math]::Ceiling($SearchServers.Count / 2.0)",
    "    $queryStart = [int][Math]::Floor($SearchServers.Count / 2.0)",
    "    $bulkServers = @($SearchServers[0..($bulkCount - 1)])",
    "    $queryServers = @($SearchServers[$queryStart..($SearchServers.Count - 1)])",
    "}",
    "$adminServers = @($SearchServers | Select-Object -First ([Math]::Min(2, $SearchServers.Count)))",
    "$indexServers = @($queryServers)",
    "if ($IndexReplicasPerPartition -gt $indexServers.Count) {",
    "    throw \"$IndexReplicasPerPartition replicas per partition require at least $IndexReplicasPerPartition distinct index hosts; only $($indexServers.Count) real-time Search host(s) are selected.\"",
    "}",
    `if ($requiredIndexComponents -gt ($indexServers.Count * ${MAX_INDEX_COMPONENTS_PER_SERVER})) {`,
    `    throw "The design requires $requiredIndexComponents index components, but $($indexServers.Count) real-time Search host(s) support at most ${MAX_INDEX_COMPONENTS_PER_SERVER} each. Add Search servers or reduce partitions/replicas."`,
    "}",
    "$nonCrawlSearchComponents = $adminServers.Count + (2 * $bulkServers.Count) + $queryServers.Count + $requiredIndexComponents",
    `if ($nonCrawlSearchComponents -gt ${MAX_NON_CRAWL_SEARCH_COMPONENTS}) { throw "The generated topology contains $nonCrawlSearchComponents non-crawl Search components; the supported limit is ${MAX_NON_CRAWL_SEARCH_COMPONENTS} per Search Service Application." }`,
    "Write-Host \"Admin components : $($adminServers -join ', ')\" -ForegroundColor DarkCyan",
    "Write-Host \"Bulk components  : $($bulkServers -join ', ')\" -ForegroundColor DarkCyan",
    "Write-Host \"Query components : $($queryServers -join ', ')\" -ForegroundColor DarkCyan",
    "Write-Host \"Index design     : $IndexPartitionCount partition(s) x $IndexReplicasPerPartition replica(s) = $requiredIndexComponents component(s)\" -ForegroundColor DarkCyan",
    "Write-Host \"Index hosts      : $($indexServers -join ', ')\" -ForegroundColor DarkCyan",
    "",
    "$newTopology = $null",
    "try {",
    "    Write-Step 'Creating a new inactive topology'",
    "    $newTopology = New-SPEnterpriseSearchTopology -SearchApplication $ssa",
    "",
    "    foreach ($serverName in $adminServers) {",
    "        New-SPEnterpriseSearchAdminComponent -SearchTopology $newTopology -SearchServiceInstance $instanceByServer[$serverName] -SearchApplication $ssa | Out-Null",
    "    }",
    "",
    "    foreach ($serverName in $bulkServers) {",
    "        $instance = $instanceByServer[$serverName]",
    "        New-SPEnterpriseSearchCrawlComponent -SearchTopology $newTopology -SearchServiceInstance $instance -SearchApplication $ssa | Out-Null",
    "        New-SPEnterpriseSearchContentProcessingComponent -SearchTopology $newTopology -SearchServiceInstance $instance -SearchApplication $ssa | Out-Null",
    "        New-SPEnterpriseSearchAnalyticsProcessingComponent -SearchTopology $newTopology -SearchServiceInstance $instance -SearchApplication $ssa | Out-Null",
    "    }",
    "",
    "    foreach ($serverName in $queryServers) {",
    "        New-SPEnterpriseSearchQueryProcessingComponent -SearchTopology $newTopology -SearchServiceInstance $instanceByServer[$serverName] -SearchApplication $ssa | Out-Null",
    "    }",
    "",
    "    $indexAssignments = @{}",
    "    foreach ($serverName in $indexServers) { $indexAssignments[$serverName] = 0 }",
    "",
    "    for ($partition = 0; $partition -lt $IndexPartitionCount; $partition++) {",
    "        $partitionServers = @()",
    "        for ($replica = 0; $replica -lt $IndexReplicasPerPartition; $replica++) {",
    `            $availableCandidates = @($indexServers | Where-Object { $partitionServers -notcontains $_ -and $indexAssignments[$_] -lt ${MAX_INDEX_COMPONENTS_PER_SERVER} })`,
    "            if ($availableCandidates.Count -eq 0) { throw \"No valid index host remains for partition $partition replica $replica.\" }",
    "",
    "            $serverName = $availableCandidates | Sort-Object @{ Expression = { $indexAssignments[$_] } }, @{ Expression = { [Array]::IndexOf($indexServers, $_) } } | Select-Object -First 1",
    "            New-SPEnterpriseSearchIndexComponent -SearchTopology $newTopology -SearchServiceInstance $instanceByServer[$serverName] -SearchApplication $ssa -IndexPartition $partition -RootDirectory $IndexRoot | Out-Null",
    "            $indexAssignments[$serverName]++",
    "            $partitionServers += $serverName",
    "            Write-Host \"Index partition $partition replica $($replica + 1) -> $serverName\" -ForegroundColor Gray",
    "        }",
    "    }",
    "",
    "    Write-Step 'Activating the topology'",
    "    Set-SPEnterpriseSearchTopology -Identity $newTopology -SearchApplication $ssa -Confirm:$false",
    "} catch {",
    "    if ($null -ne $newTopology) {",
    "        $topologyState = (Get-SPEnterpriseSearchTopology -SearchApplication $ssa -Identity $newTopology).State",
    "        if ($topologyState -eq 'Inactive') {",
    "            Remove-SPEnterpriseSearchTopology -Identity $newTopology -SearchApplication $ssa -Confirm:$false -ErrorAction SilentlyContinue",
    "        }",
    "    }",
    "    throw",
    "}",
    "",
    "if ($ContentSourceStartAddresses.Count -gt 0) {",
    "    Write-Step 'Configuring the Local SharePoint content source'",
    "    $contentSource = Get-SPEnterpriseSearchCrawlContentSource -Identity $ContentSourceName -SearchApplication $ssa -ErrorAction SilentlyContinue",
    "    if ($null -eq $contentSource) { throw \"Content source '$ContentSourceName' was not found. Its localized name may be different.\" }",
    "    Set-SPEnterpriseSearchCrawlContentSource -Identity $contentSource -SearchApplication $ssa -StartAddresses ($ContentSourceStartAddresses -join ',') -EnableContinuousCrawls ([bool]$EnableContinuousCrawls)",
    "    if ($StartFullCrawl) {",
    "        $contentSource = Get-SPEnterpriseSearchCrawlContentSource -Identity $ContentSourceName -SearchApplication $ssa",
    "        $contentSource.StartFullCrawl()",
    "    }",
    "}",
    "",
    "Write-Step 'Validating the active topology'",
    "$verifiedTopology = Get-SPEnterpriseSearchTopology -SearchApplication $ssa -Active",
    "$verifiedComponents = @(Get-SPEnterpriseSearchComponent -SearchTopology $verifiedTopology -SearchApplication $ssa)",
    "$verifiedComponents | Select-Object Name, ServerName | Sort-Object ServerName, Name | Format-Table -AutoSize",
    "",
    "Write-Host \"Search topology is active. TopologyId: $($verifiedTopology.TopologyId) | Components: $($verifiedComponents.Count)\" -ForegroundColor Green",
    "Write-Warning 'Infrastructure check: SharePoint does not track fault domains. Verify that redundant Search servers are placed on separate physical hosts, racks, storage or power failure groups, or availability zones.'",
    "Write-Warning 'Before the first crawl, verify crawl account permissions, Search database HA, index disk capacity, and antivirus exclusions.'",
    "",
  ].join("\r\n");
}

export default function Home() {
  const [config, setConfig] = useState<FarmConfig>(baseConfig);
  const [activePreset, setActivePreset] = useState<PresetKey>("ha4");
  const [notice, setNotice] = useState<{ kind: "success" | "warning"; title: string; detail: string } | null>(null);

  const setField = <K extends keyof FarmConfig>(key: K, value: FarmConfig[K]) => {
    setConfig((current) => ({ ...current, [key]: value }));
    setActivePreset("custom");
  };
  const choosePreset = (key: PresetKey) => { setActivePreset(key); if (key !== "custom") setConfig({ ...presets[key] }); };
  const applyRecommended = () => {
    const recommendedPartitions = recommendedIndexPartitions(config.expectedIndexedItemsMillions);
    const recommendedReplicas = config.ha ? 2 : 1;
    const dedicated = config.users > 10000 || config.contentTb >= 5 || config.expectedIndexedItemsMillions > INDEX_ITEMS_PER_PARTITION_MILLIONS;
    const searchCount = config.search ? recommendedSearchServerCount(recommendedPartitions, recommendedReplicas, config.ha) : 0;
    const scale = config.users > 25000 ? 4 : config.ha ? 2 : 1;
    setConfig((current) => ({
      ...current,
      topology: dedicated ? "dedicated" : "shared",
      faultDomains: current.ha,
      indexPartitionMode: "auto",
      indexPartitions: recommendedPartitions,
      indexReplicas: recommendedReplicas,
      wfe: scale,
      cache: current.ha ? 2 : 1,
      app: dedicated ? (current.users > 25000 ? 4 : current.ha ? 2 : 1) : Math.max(current.users > 25000 ? 4 : current.ha ? 2 : 1, searchCount),
      searchNodes: searchCount,
      sql: current.ha ? 2 : 1,
      oosNodes: current.oos ? (current.ha ? 2 : 1) : 0,
      workflowNodes: current.workflow ? (current.ha ? 3 : 1) : 0,
    }));
    setActivePreset("custom");
  };

  const metrics = useMemo(() => {
    const spCount = config.topology === "shared" ? config.wfe + config.app : config.wfe + config.cache + config.app + (config.search ? config.searchNodes : 0);
    const ancillary = (config.oos ? config.oosNodes : 0) + (config.workflow ? config.workflowNodes : 0);
    const total = spCount + config.sql + ancillary;
    const searchCount = config.search ? (config.topology === "shared" ? config.app : config.searchNodes) : 0;
    const recommendedPartitionCount = recommendedIndexPartitions(config.expectedIndexedItemsMillions);
    const indexPartitionCount = selectedIndexPartitions(config);
    const indexReplicaCount = config.indexReplicas;
    const indexComponentCount = indexPartitionCount * indexReplicaCount;
    const placement = searchPlacementCounts(searchCount);
    const indexHostCount = placement.queryCount;
    const indexHostSlotCount = indexHostCount * MAX_INDEX_COMPONENTS_PER_SERVER;
    const partitionSizingReady = !config.search || indexPartitionCount >= recommendedPartitionCount;
    const replicaHostReady = !config.search || indexReplicaCount <= indexHostCount;
    const indexComponentLimitReady = !config.search || indexComponentCount <= MAX_INDEX_COMPONENTS;
    const indexHostCapacityReady = !config.search || indexComponentCount <= indexHostSlotCount;
    const nonCrawlSearchComponentCount = placement.adminCount + (2 * placement.bulkCount) + placement.queryCount + indexComponentCount;
    const overallSearchComponentLimitReady = !config.search || nonCrawlSearchComponentCount <= MAX_NON_CRAWL_SEARCH_COMPONENTS;
    const replicaFaultDomainsReady = !config.search || indexReplicaCount === 1 || (config.faultDomains && indexHostCount >= 2);
    const indexCapacityReady = replicaHostReady && indexComponentLimitReady && indexHostCapacityReady && overallSearchComponentLimitReady;
    const indexRedundancyReady = !config.search || !config.ha || indexReplicaCount >= 2;
    const searchExportReady = config.search && indexCapacityReady;
    const wfeReady = config.wfe >= (config.ha ? 2 : 1), appReady = config.app >= (config.ha ? 2 : 1), searchReady = !config.search || searchCount >= (config.ha ? 2 : 1), sqlReady = config.sql >= (config.ha ? 2 : 1), zonesReady = !config.ha || config.faultDomains;
    const criteria = [wfeReady, appReady, searchReady, sqlReady, zonesReady, partitionSizingReady, indexCapacityReady, indexRedundancyReady];
    const score = Math.round((criteria.filter(Boolean).length / criteria.length) * 100);
    const roles = config.topology === "shared"
      ? [{ count: config.wfe, cpu: 8, ram: 24 }, { count: config.app, cpu: 12, ram: 32 }]
      : [{ count: config.wfe, ...roleMeta.wfe }, { count: config.cache, ...roleMeta.cache }, { count: config.app, ...roleMeta.app }, { count: config.search ? config.searchNodes : 0, ...roleMeta.search }];
    const totals = roles.map(({ count, cpu, ram }) => ({ count, cpu, ram }));
    totals.push({ count: config.sql, cpu: roleMeta.sql.cpu, ram: roleMeta.sql.ram });
    if (config.oos) totals.push({ count: config.oosNodes, cpu: roleMeta.oos.cpu, ram: roleMeta.oos.ram });
    if (config.workflow) totals.push({ count: config.workflowNodes, cpu: roleMeta.workflow.cpu, ram: roleMeta.workflow.ram });
    const vcpu = totals.reduce((sum, item) => sum + item.count * item.cpu, 0), ram = totals.reduce((sum, item) => sum + item.count * item.ram, 0);
    const findings: { level: "warning" | "info" | "ok"; title: string; detail: string }[] = [];
    if (config.ha && !wfeReady) findings.push({ level: "warning", title: "Front-end is a single point of failure", detail: "Use at least two Front-end instances to meet the HA objective." });
    if (config.ha && !appReady) findings.push({ level: "warning", title: "Application tier has no redundancy", detail: "Add a second Application node for service applications." });
    if (config.search && config.ha && !searchReady) findings.push({ level: "warning", title: "Search components have no redundancy", detail: "Distribute Index, Query, Crawl, and Content Processing components across two fault domains." });
    if (config.ha && !sqlReady) findings.push({ level: "warning", title: "Data tier has no redundancy", detail: "Consider a synchronous two-node SQL availability group for supported databases." });
    if (config.ha && !config.faultDomains) findings.push({ level: "warning", title: "Fault-domain separation is disabled", detail: "Place redundant servers on separate hosts, racks, or availability zones." });
    if (config.search && !partitionSizingReady) findings.push({ level: "warning", title: "Partition override is below the sizing baseline", detail: `${recommendedPartitionCount} partitions are recommended for ${config.expectedIndexedItemsMillions.toLocaleString("en-US")} million expected indexed items. Validate the manual override with load testing.` });
    if (config.search && !indexCapacityReady) findings.push({ level: "warning", title: "Search index placement exceeds capacity", detail: `${indexPartitionCount} partitions × ${indexReplicaCount} replicas require ${indexComponentCount} index components. The selected ${indexHostCount} real-time Search host${indexHostCount === 1 ? "" : "s"} provide ${indexHostSlotCount} component slots, subject to the farm-wide Search limits.` });
    if (config.search && indexReplicaCount > 1 && !replicaFaultDomainsReady) findings.push({ level: "warning", title: "Index replicas are not fault-domain ready", detail: "Enable two fault domains and provide at least two real-time Search hosts so each partition can keep redundant replicas on separate hosts." });
    if (config.search && config.ha && !indexRedundancyReady) findings.push({ level: "warning", title: "Index partitions have no redundant replica", detail: "Use at least two replicas per index partition for the selected high-availability target." });
    if (config.users > 10000 && config.topology === "shared") findings.push({ level: "info", title: "Consider dedicated roles", detail: "Separating Search and Distributed Cache roles makes scaling easier for larger user populations." });
    if (config.contentTb >= 5 && config.search && searchCount < 2) findings.push({ level: "info", title: "Validate Search capacity", detail: "Plan a dedicated load test using index size, item count, and query traffic." });
    if (config.oos && config.ha && config.oosNodes < 2) findings.push({ level: "warning", title: "Office Online has no redundancy", detail: "Add a second OOS node for resilient browser-based document viewing." });
    if (config.workflow && config.ha && config.workflowNodes < 3) findings.push({ level: "info", title: "Validate Workflow quorum", detail: "Validate a three-node Workflow Manager farm and load-balancing approach." });
    if (!findings.length) findings.push({ level: "ok", title: "Baseline HA checks passed", detail: "Before production, validate capacity, backup restoration, and failover scenarios." });
    return {
      total, spCount, searchCount, score, vcpu, ram, findings,
      recommendedPartitionCount, indexPartitionCount, indexReplicaCount, indexComponentCount,
      indexHostCount, indexHostSlotCount, nonCrawlSearchComponentCount,
      partitionSizingReady, indexCapacityReady, replicaFaultDomainsReady, searchExportReady,
    };
  }, [config]);

  const exportDesign = () => {
    const payload = {
      title: "SharePoint Farm Architecture Design",
      generatedAt: new Date().toISOString(),
      assumptions: { users: config.users, contentTb: config.contentTb, expectedIndexedItemsMillions: config.expectedIndexedItemsMillions, highAvailability: config.ha },
      configuration: config,
      searchIndexDesign: config.search ? { partitions: metrics.indexPartitionCount, replicasPerPartition: metrics.indexReplicaCount, indexComponents: metrics.indexComponentCount, plannedIndexHosts: metrics.indexHostCount } : null,
      sizingDraft: { totalServers: metrics.total, estimatedVcpu: metrics.vcpu, estimatedRamGb: metrics.ram },
      notes: metrics.findings,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "sharepoint-farm-architecture.json"; anchor.click(); URL.revokeObjectURL(url);
  };

  const exportSearchPowerShell = () => {
    if (!config.search) {
      setNotice({ kind: "warning", title: "Search configuration is disabled", detail: "Enable Search Service Application under Goals and services before exporting the script." });
      return;
    }

    if (!metrics.searchExportReady) {
      setNotice({ kind: "warning", title: "Resolve the Search index design first", detail: `The selected ${metrics.indexPartitionCount} × ${metrics.indexReplicaCount} design cannot be placed safely on ${metrics.indexHostCount} real-time Search host${metrics.indexHostCount === 1 ? "" : "s"}. Review the capacity findings or use Recommend for this workload.` });
      return;
    }

    const count = config.topology === "shared" ? config.app : config.searchNodes;
    const prefix = config.topology === "shared" ? "SP-APP" : "SP-SRCH";
    const searchServers = Array.from({ length: count }, (_, index) => `${prefix}-${String(index + 1).padStart(2, "0")}`);
    const script = buildSearchPowerShell(config, searchServers);
    const blob = new Blob(["\uFEFF", script], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `configure-sharepoint-search-${config.version}-${config.topology}-${count}-nodes-${metrics.indexPartitionCount}p-${metrics.indexReplicaCount}r.ps1`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice({ kind: "success", title: "PowerShell script downloaded", detail: `Created ${metrics.indexPartitionCount} partition${metrics.indexPartitionCount === 1 ? "" : "s"} with ${metrics.indexReplicaCount} replica${metrics.indexReplicaCount === 1 ? "" : "s"} each across distinct Search hosts. Verify infrastructure separation before production.` });
  };

  const serverRows = config.topology === "shared"
    ? [{ key: "wfe", label: "Front-end + Distributed Cache", value: config.wfe, set: (v: number) => setField("wfe", v), icon: "traffic" as IconName, max: 8 }, { key: "app", label: config.search ? "Application + Search" : "Application", value: config.app, set: (v: number) => setField("app", v), icon: "app" as IconName, max: 8 }]
    : [{ key: "wfe", label: "Front-end", value: config.wfe, set: (v: number) => setField("wfe", v), icon: "traffic" as IconName, max: 8 }, { key: "cache", label: "Distributed Cache", value: config.cache, set: (v: number) => setField("cache", v), icon: "server" as IconName, max: 8 }, { key: "app", label: "Application", value: config.app, set: (v: number) => setField("app", v), icon: "app" as IconName, max: 8 }, ...(config.search ? [{ key: "search", label: "Search", value: config.searchNodes, set: (v: number) => setField("searchNodes", v), icon: "search" as IconName, max: 16 }] : [])];

  return <main className="site-shell">
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-mark"><Icon name="brand" size={20} /></div>
        <div><strong>Farm Studio</strong><span>SharePoint Architecture Designer</span></div>
      </div>
      <div className="topbar-context"><span className="live-dot" /><span>Design updates automatically</span></div>
      <div className="topbar-actions">
        <button className="ghost-button" type="button" onClick={() => { setConfig(baseConfig); setActivePreset("ha4"); setNotice(null); }}><Icon name="reset" size={16} /><span>Reset</span></button>
        <button className="ghost-button" type="button" onClick={() => window.print()}><Icon name="print" size={16} /><span>Print</span></button>
        <button className="ghost-button" type="button" onClick={exportDesign}><Icon name="download" size={16} /><span>JSON</span></button>
        <button className="primary-button powershell-button" type="button" onClick={exportSearchPowerShell}><Icon name="code" size={17} /><span>Search .ps1</span></button>
      </div>
    </header>

    <section className="hero-strip">
      <div><p className="kicker">ARCHITECTURE WORKSPACE</p><h1>Model your SharePoint farm<br /><span>with confidence.</span></h1></div>
      <p className="hero-copy">Define workload targets, shape your MinRole topology, and identify high-availability gaps instantly.</p>
    </section>

    <nav className="preset-bar" aria-label="Architecture presets">
      <div className="preset-heading"><span>Quick start</span><strong>Select a design preset</strong></div>
      <div className="preset-list">{presetLabels.map((preset) => <button key={preset.key} type="button" className={`preset-button ${activePreset === preset.key ? "is-active" : ""}`} onClick={() => choosePreset(preset.key)}><span className="preset-radio" /><span><strong>{preset.label}</strong><small>{preset.meta}</small></span></button>)}</div>
    </nav>

    <div className="workspace-grid">
      <aside className="panel config-panel">
        <div className="panel-heading"><div><span>01</span><div><p>Inputs</p><h2>Farm settings</h2></div></div><span className="status-pill">Editable</span></div>
        <div className="control-section">
          <label className="field-label" htmlFor="version">SharePoint version</label>
          <div className="select-wrap"><select id="version" value={config.version} onChange={(e) => setField("version", e.target.value as FarmConfig["version"])}><option value="se">Subscription Edition</option><option value="2019">SharePoint Server 2019</option><option value="2016">SharePoint Server 2016</option></select><Icon name="chevron" size={15} /></div>
        </div>
        <div className="control-section compact-section">
          <div className="section-caption"><span>Workload</span><small>Initial assumptions</small></div>
          <label className="range-field"><div><span><Icon name="users" size={16} /> Active users</span><strong>{config.users.toLocaleString("en-US")}</strong></div><input type="range" min="250" max="50000" step="250" value={config.users} style={{ background: `linear-gradient(90deg,#2879e2 ${((config.users - 250) / 49750) * 100}%,#dfe6ee 0)` }} onChange={(e) => setField("users", Number(e.target.value))} /><small><span>250</span><span>50,000</span></small></label>
          <label className="range-field"><div><span><Icon name="database" size={16} /> Content volume</span><strong>{config.contentTb.toLocaleString("en-US")} TB</strong></div><input type="range" min="0.25" max="25" step="0.25" value={config.contentTb} style={{ background: `linear-gradient(90deg,#2879e2 ${((config.contentTb - .25) / 24.75) * 100}%,#dfe6ee 0)` }} onChange={(e) => setField("contentTb", Number(e.target.value))} /><small><span>0.25 TB</span><span>25 TB</span></small></label>
          <button type="button" className="recommend-button" onClick={applyRecommended}><span className="spark">✦</span> Recommend for this workload</button>
        </div>
        {config.search && <div className="control-section compact-section search-index-section">
          <div className="section-caption"><span>Search index design</span><small>Capacity-aware</small></div>
          <label className="range-field"><div><span><Icon name="search" size={16} /> Expected indexed items</span><strong>{config.expectedIndexedItemsMillions.toLocaleString("en-US")}M</strong></div><input type="range" min="0.5" max="500" step="0.5" value={config.expectedIndexedItemsMillions} style={{ background: `linear-gradient(90deg,#0d8f79 ${((config.expectedIndexedItemsMillions - .5) / 499.5) * 100}%,#dfe6ee 0)` }} onChange={(e) => setField("expectedIndexedItemsMillions", Number(e.target.value))} /><small><span>0.5 million</span><span>500 million</span></small></label>
          <div className="segmented-control search-mode-control" role="group" aria-label="Index partition sizing mode"><button type="button" className={config.indexPartitionMode === "auto" ? "is-selected" : ""} onClick={() => setField("indexPartitionMode", "auto")}>Automatic</button><button type="button" className={config.indexPartitionMode === "manual" ? "is-selected" : ""} onClick={() => { setConfig((current) => ({ ...current, indexPartitionMode: "manual", indexPartitions: selectedIndexPartitions(current) })); setActivePreset("custom"); }}>Manual override</button></div>
          <div className="search-sizing-rows">
            <div className="search-sizing-row"><span><strong>Index partitions</strong><small>Baseline: one per 20M items</small></span>{config.indexPartitionMode === "auto" ? <span className="calculated-value" aria-label={`${metrics.indexPartitionCount} calculated index partitions`}>{metrics.indexPartitionCount}<small>calculated</small></span> : <Stepper value={config.indexPartitions} min={1} max={MAX_INDEX_PARTITIONS} onChange={(value) => setField("indexPartitions", value)} label="Index partitions" />}</div>
            <div className="search-sizing-row"><span><strong>Replicas per partition</strong><small>Use two or more for HA</small></span><Stepper value={config.indexReplicas} min={1} max={MAX_INDEX_REPLICAS} onChange={(value) => setField("indexReplicas", value)} label="Index replicas per partition" /></div>
          </div>
          <div className={`search-capacity-card ${metrics.searchExportReady ? "is-ready" : "has-warning"}`}><span><strong>{metrics.indexPartitionCount} × {metrics.indexReplicaCount} = {metrics.indexComponentCount}</strong><small>index components</small></span><span><strong>{metrics.indexHostCount} hosts / {metrics.indexHostSlotCount} slots</strong><small>real-time placement capacity</small></span></div>
          <p className="search-guidance">The script places replicas of the same partition on distinct Search servers. SharePoint does not label or track fault domains; verify separate hosts, racks, storage or power groups, or availability zones with the infrastructure team.</p>
        </div>}
        <div className="control-section compact-section">
          <div className="section-caption"><span>MinRole model</span><small>Service placement</small></div>
          <div className="segmented-control" role="group" aria-label="MinRole model"><button type="button" className={config.topology === "shared" ? "is-selected" : ""} onClick={() => setField("topology", "shared")}>Shared</button><button type="button" className={config.topology === "dedicated" ? "is-selected" : ""} onClick={() => setField("topology", "dedicated")}>Dedicated</button></div>
          <p className="helper-copy">{config.topology === "shared" ? "WFE + Cache and Application + Search roles run on the same servers." : "Each MinRole function scales in an independent server group."}</p>
        </div>
        <div className="control-section compact-section">
          <div className="section-caption"><span>Server roles</span><small>Up to 16 Search nodes</small></div>
          <div className="role-controls">
            {serverRows.map((row) => <div className="role-control" key={row.key}><span className={`role-symbol role-${row.key}`}><Icon name={row.icon} size={16} /></span><span className="role-label">{row.label}</span><Stepper value={row.value} min={1} max={row.max} onChange={row.set} label={row.label} /></div>)}
            <div className="role-control"><span className="role-symbol role-sql"><Icon name="database" size={16} /></span><span className="role-label">SQL Server</span><Stepper value={config.sql} min={1} max={4} onChange={(v) => setField("sql", v)} label="SQL Server" /></div>
            {config.oos && <div className="role-control"><span className="role-symbol role-oos"><Icon name="server" size={16} /></span><span className="role-label">Office Online</span><Stepper value={config.oosNodes} min={1} max={4} onChange={(v) => setField("oosNodes", v)} label="Office Online" /></div>}
            {config.workflow && <div className="role-control"><span className="role-symbol role-workflow"><Icon name="app" size={16} /></span><span className="role-label">Workflow Manager</span><Stepper value={config.workflowNodes} min={1} max={5} onChange={(v) => setField("workflowNodes", v)} label="Workflow Manager" /></div>}
          </div>
        </div>
        <div className="control-section compact-section">
          <div className="section-caption"><span>Goals and services</span><small>Optional</small></div>
          <div className="switch-list">
            <div className="switch-row"><span><strong>High availability</strong><small>N+1 per role</small></span><Switch checked={config.ha} onChange={(v) => setField("ha", v)} label="High availability" /></div>
            <div className="switch-row"><span><strong>Infrastructure separation</strong><small>Planning only—no SharePoint setting</small></span><Switch checked={config.faultDomains} onChange={(v) => setField("faultDomains", v)} label="Separate infrastructure failure groups" /></div>
            <div className="switch-row"><span><strong>Search Service Application</strong><small>Enterprise search</small></span><Switch checked={config.search} onChange={(v) => { setField("search", v); setConfig((c) => ({ ...c, search: v, searchNodes: v ? Math.max(c.searchNodes, c.ha ? 2 : 1) : 0 })); }} label="Search Service Application" /></div>
            <div className="switch-row"><span><strong>Office Online Server</strong><small>In-browser document viewing</small></span><Switch checked={config.oos} onChange={(v) => { setField("oos", v); setConfig((c) => ({ ...c, oos: v, oosNodes: v ? (c.ha ? 2 : 1) : 0 })); }} label="Office Online Server" /></div>
            <div className="switch-row"><span><strong>Workflow Manager</strong><small>SharePoint 2013 workflows</small></span><Switch checked={config.workflow} onChange={(v) => { setField("workflow", v); setConfig((c) => ({ ...c, workflow: v, workflowNodes: v ? (c.ha ? 3 : 1) : 0 })); }} label="Workflow Manager" /></div>
            <div className="switch-row"><span><strong>Secondary DR site</strong><small>Asynchronous replica</small></span><Switch checked={config.dr} onChange={(v) => setField("dr", v)} label="Secondary DR site" /></div>
          </div>
        </div>
      </aside>

      <section className="center-column">
        <div className="summary-cards">
          <article><span className="summary-icon blue"><Icon name="server" size={18} /></span><div><small>Total servers</small><strong>{metrics.total}</strong></div><em>{metrics.spCount} SharePoint</em></article>
          <article><span className="summary-icon violet"><Icon name="shield" size={18} /></span><div><small>Availability</small><strong>{config.ha ? "N+1" : "Standard"}</strong></div><em>{config.faultDomains ? "Infrastructure separated" : "Single failure group"}</em></article>
          <article><span className="summary-icon teal"><Icon name="search" size={18} /></span><div><small>Search</small><strong>{config.search ? `${metrics.searchCount} node${metrics.searchCount === 1 ? "" : "s"}` : "Off"}</strong></div><em title={config.search ? `${metrics.indexPartitionCount} partition${metrics.indexPartitionCount === 1 ? "" : "s"}, ${metrics.indexReplicaCount} replica${metrics.indexReplicaCount === 1 ? "" : "s"} per partition` : undefined}>{config.search ? `${metrics.indexPartitionCount}P · ${metrics.indexReplicaCount}R` : "Disabled"}</em></article>
        </div>
        <section className="architecture-card">
          <div className="architecture-toolbar"><div><span>02</span><div><p>Live topology</p><h2>Farm architecture</h2></div></div><div className="toolbar-badges"><span>{config.version === "se" ? "Subscription Edition" : `Server ${config.version}`}</span><span>{config.topology === "shared" ? "Shared MinRole" : "Dedicated MinRole"}</span></div></div>
          <div className="blueprint"><div className="blueprint-grid" />
            <div className="flow-stage edge-stage"><div className="stage-label"><span>01</span><p>CLIENTS &amp; ACCESS</p></div><div className="edge-flow"><div className="client-cloud"><Icon name="users" size={18} /><span><strong>{config.users.toLocaleString("en-US")}</strong><small>active users</small></span></div><div className="flow-arrow"><i /><span>HTTPS</span><b>›</b></div><div className="load-balancer"><Icon name="traffic" size={18} /><span><strong>Load Balancer</strong><small>{config.ha ? "Active / passive VIP" : "Single VIP"}</small></span><em>{config.ha ? "2×" : "1×"}</em></div></div></div>
            <div className="vertical-connector"><span /></div>
            <div className="flow-stage farm-stage">
              <div className="stage-label"><span>02</span><p>SHAREPOINT FARM</p></div>
              <div className="farm-meta"><span className="farm-health-dot" /><strong>Farm online</strong><small>{config.faultDomains ? "Separate failure groups" : "Single failure group"}</small></div>
              <div className={`farm-groups ${config.topology}`}>
                {config.topology === "shared" ? <>
                  <NodeGroup eyebrow="WEB TIER" title="Front-end + Cache">{Array.from({ length: config.wfe }).map((_, index) => <ServerCard key={`wfe-${index}`} type="wfe" combinedWith="cache" index={index} faultDomains={config.faultDomains} />)}</NodeGroup>
                  <NodeGroup eyebrow="SERVICE TIER" title={config.search ? "Application + Search" : "Application"}>{Array.from({ length: config.app }).map((_, index) => <ServerCard key={`app-${index}`} type="app" combinedWith={config.search ? "search" : undefined} index={index} faultDomains={config.faultDomains} />)}</NodeGroup>
                </> : <>
                  <NodeGroup eyebrow="WEB" title="Front-end">{Array.from({ length: config.wfe }).map((_, index) => <ServerCard key={`wfe-${index}`} type="wfe" index={index} faultDomains={config.faultDomains} />)}</NodeGroup>
                  <NodeGroup eyebrow="CACHE" title="Distributed Cache">{Array.from({ length: config.cache }).map((_, index) => <ServerCard key={`cache-${index}`} type="cache" index={index} faultDomains={config.faultDomains} />)}</NodeGroup>
                  <NodeGroup eyebrow="SERVICE" title="Application">{Array.from({ length: config.app }).map((_, index) => <ServerCard key={`app-${index}`} type="app" index={index} faultDomains={config.faultDomains} />)}</NodeGroup>
                  {config.search && <NodeGroup eyebrow="SEARCH" title="Search">{Array.from({ length: config.searchNodes }).map((_, index) => <ServerCard key={`search-${index}`} type="search" index={index} faultDomains={config.faultDomains} />)}</NodeGroup>}
                </>}
              </div>
            </div>
            <div className="vertical-connector split"><span /></div>
            <div className="lower-tier-grid">
              <div className="flow-stage data-stage"><div className="stage-label"><span>03</span><p>DATA TIER</p></div><div className="data-content"><div className="sql-cluster">{Array.from({ length: config.sql }).map((_, index) => <div className="sql-node" key={`sql-${index}`}><span className="sql-cylinder"><Icon name="database" size={18} /></span><span><strong>SQL-{String(index + 1).padStart(2, "0")}</strong><small>{index === 0 ? "Primary replica" : "Synchronous replica"}</small></span><em title="Infrastructure planning label only; not a SharePoint setting.">{config.faultDomains ? (index % 2 === 0 ? "GROUP 1" : "GROUP 2") : "SINGLE GROUP"}</em></div>)}</div><div className="ag-label"><span className={config.sql >= 2 ? "ready" : ""}><Icon name={config.sql >= 2 ? "check" : "alert"} size={13} /></span><div><strong>{config.sql >= 2 ? "Always On AG" : "Single SQL instance"}</strong><small>{config.sql >= 2 ? "Synchronous commit + listener" : "Add a replica for production HA"}</small></div></div></div></div>
              <div className="flow-stage services-stage"><div className="stage-label"><span>04</span><p>CONNECTED SERVICES</p></div><div className="service-chips">{config.oos && <div><span className="service-chip-icon rose"><Icon name="server" size={16} /></span><span><strong>Office Online</strong><small>{config.oosNodes} node{config.oosNodes === 1 ? "" : "s"}</small></span></div>}{config.workflow && <div><span className="service-chip-icon slate"><Icon name="app" size={16} /></span><span><strong>Workflow Manager</strong><small>{config.workflowNodes} node{config.workflowNodes === 1 ? "" : "s"}</small></span></div>}{config.dr && <div><span className="service-chip-icon blue"><Icon name="shield" size={16} /></span><span><strong>DR site</strong><small>Asynchronous replica</small></span></div>}{!config.oos && !config.workflow && !config.dr && <div className="empty-services"><Icon name="info" size={16} /><span>No connected services selected</span></div>}</div></div>
            </div>
          </div>
        </section>
        <div className="assumption-note"><Icon name="info" size={17} /><p><strong>Draft sizing:</strong> Resource values are initial assumptions. Validate final CPU, memory, disk IOPS, and Search topology against measured usage, indexed item count, and performance testing.</p></div>
      </section>

      <aside className="panel analysis-panel">
        <div className="panel-heading"><div><span>03</span><div><p>Analysis</p><h2>Architecture review</h2></div></div><span className={`status-pill ${metrics.score === 100 ? "success" : "attention"}`}>{metrics.score === 100 ? "Ready" : "Review"}</span></div>
        <section className="score-section"><div className="score-ring" style={{ "--score": `${metrics.score * 3.6}deg` } as React.CSSProperties}><div><strong>{metrics.score}</strong><span>/ 100</span></div></div><div className="score-copy"><span>Architecture health score</span><strong>{metrics.score === 100 ? "Baseline checks complete" : metrics.score >= 60 ? "Good, with a few gaps" : "Critical gaps found"}</strong><small>Based on HA, role redundancy, and fault-domain separation</small></div></section>
        <section className="analysis-section"><div className="section-caption"><span>Review findings</span><small>{metrics.findings.length} {metrics.findings.length === 1 ? "finding" : "findings"}</small></div><div className="finding-list">{metrics.findings.map((finding, index) => <article key={`${finding.title}-${index}`} className={`finding ${finding.level}`}><span><Icon name={finding.level === "warning" ? "alert" : finding.level === "ok" ? "check" : "info"} size={15} /></span><div><strong>{finding.title}</strong><p>{finding.detail}</p></div></article>)}</div></section>
        <section className="analysis-section sizing-section"><div className="section-caption"><span>Resource summary</span><small>Draft sizing</small></div><div className="sizing-grid"><div><span>Servers</span><strong>{metrics.total}</strong><small>total nodes</small></div><div><span>vCPU</span><strong>{metrics.vcpu}</strong><small>estimated total</small></div><div><span>Memory</span><strong>{metrics.ram}</strong><small>GB RAM</small></div><div><span>Content</span><strong>{config.contentTb}</strong><small>TB of data</small></div></div></section>
        <section className="analysis-section decision-section"><div className="section-caption"><span>Decision summary</span><small>Current selection</small></div><dl><div><dt>Version</dt><dd>{config.version === "se" ? "Subscription Edition" : `Server ${config.version}`}</dd></div><div><dt>Topology</dt><dd>{config.topology === "shared" ? "Shared MinRole" : "Dedicated MinRole"}</dd></div><div><dt>Indexed items</dt><dd>{config.expectedIndexedItemsMillions.toLocaleString("en-US")} million</dd></div><div><dt>Index topology</dt><dd>{config.search ? `${metrics.indexPartitionCount} partitions × ${metrics.indexReplicaCount} replicas` : "Disabled"}</dd></div><div><dt>HA target</dt><dd>{config.ha ? "Enabled" : "Not enabled"}</dd></div><div><dt>Infrastructure separation</dt><dd>{config.faultDomains ? "Planned" : "Not planned"}</dd></div><div><dt>DR</dt><dd>{config.dr ? "Planned" : "Out of scope"}</dd></div></dl></section>
        <section className={`ps-export-card ${config.search ? (metrics.searchExportReady ? "" : "has-warning") : "is-disabled"}`}><span><Icon name="code" size={18} /></span><div><div className="ps-card-heading"><strong>Search PowerShell</strong><em>{config.search ? `${metrics.indexPartitionCount}P × ${metrics.indexReplicaCount}R` : "Disabled"}</em></div><p>Generates a guarded `.ps1` file with capacity checks, equal replicas for every partition on distinct Search hosts, SSA/proxy provisioning, and final validation. Infrastructure separation remains an administrator responsibility.</p><button type="button" onClick={exportSearchPowerShell} disabled={!config.search}><Icon name="download" size={14} /> Download script</button></div></section>
        <section className="sources-card"><span><Icon name="shield" size={17} /></span><div><strong>Aligned with Microsoft guidance</strong><p>MinRole, high availability, and Search redundancy checks are based on official planning principles.</p><a href="https://learn.microsoft.com/sharepoint/install/planning-for-a-minrole-server-deployment-in-sharepoint-server" target="_blank" rel="noreferrer">Open planning guide <Icon name="chevron" size={13} /></a></div></section>
      </aside>
    </div>
    {notice && <div className={`toast-notice ${notice.kind}`} role="status" aria-live="polite"><span><Icon name={notice.kind === "success" ? "check" : "alert"} size={17} /></span><div><strong>{notice.title}</strong><p>{notice.detail}</p></div><button type="button" onClick={() => setNotice(null)} aria-label="Close notification">×</button></div>}
    <footer><span>Farm Studio · SharePoint Server architecture workspace</span><nav><a href="https://learn.microsoft.com/sharepoint/administration/plan-for-high-availability" target="_blank" rel="noreferrer">HA guide</a><a href="https://learn.microsoft.com/sharepoint/search/redesign-for-specific-performance-requirements" target="_blank" rel="noreferrer">Search guide</a><a href="https://learn.microsoft.com/sharepoint/administration/configure-an-alwayson-availability-group" target="_blank" rel="noreferrer">SQL Always On</a></nav></footer>
  </main>;
}
