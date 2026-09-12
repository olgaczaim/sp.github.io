# SharePoint Farm Architecture Designer

An interactive React application for modelling SharePoint Server farm topologies, checking common availability risks, estimating draft resources, and exporting the selected Search topology as a PowerShell script.

Search index planning includes:

- Expected indexed-item volume and automatic sizing at one partition per 20 million items
- A manual partition override for validated workload-specific designs
- One to three equal replicas per partition
- Capacity validation against supported partition, replica, component, and per-server limits
- PowerShell placement that keeps replicas of the same partition on distinct real-time Search hosts
- A clear infrastructure note that SharePoint does not configure or track fault-domain labels

## Run locally

Requirements: Node.js 24 and npm.

```bash
npm ci
npm run typecheck
npm run build
```

The production-ready static files are created in `dist/`.
