# Vehicle CLI

> **A command-line tool to create, list, and delete vehicles through an API.**

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-82.8%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-green?style=for-the-badge)
[![CI](https://img.shields.io/badge/CI-Passing-success?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/SoukainaNadir/vehicle-cli/actions)

</div>

---

<div align="center">

### Built with the tools and technologies:

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10.28.2-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

![Commander.js](https://img.shields.io/badge/Commander.js-14.0.2-000000?style=for-the-badge)
![Axios](https://img.shields.io/badge/Axios-1.13.3-5A29E4?style=for-the-badge)
![Jest](https://img.shields.io/badge/Jest-30.2.0-C21325?style=for-the-badge&logo=jest&logoColor=white)

![ESLint](https://img.shields.io/badge/ESLint-9.39.2-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

</div>

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
  - [Setting up the Vehicle Server](#setting-up-the-vehicle-server)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
  - [Commands](#commands)
  - [Command Options](#command-options)
  - [Global Options](#global-options)
- [Development](#development)
  - [Testing](#testing)
- [CI/CD](#cicd)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [License](#license)
- [Authors](#authors)

---

## Features

- Create, list, and delete vehicles
- Configurable server address
- Docker with multi-stage builds
- Test coverage
- Automated CI/CD pipelines

## Prerequisites

- A running vehicle API server

### Setting up the Vehicle Server

The CLI requires a running vehicle API server:
```bash
# Clone the vehicle server
git clone https://github.com/elmehdikaalat/vehicle-server.git
cd vehicle-server

# Start the server with Docker Compose
docker-compose up
```

The server will be available at `http://localhost:8080`
> **Note:** The default CLI server address is `http://localhost:3000`. Use the `-a` flag to specify a different address.


## Quick Start
```bash
# Clone and setup
git clone https://github.com/SoukainaNadir/vehicle-cli.git

# Build the image
docker build -t vehicle-cli .

# Create a vehicle
docker run --rm --network host vehicle-cli \
  -a http://localhost:8080 \
  create-vehicle -s "0001" -b 85 --lat 48.8566 --lon 2.3522

# List vehicles
docker run --rm --network host vehicle-cli \
  -a http://localhost:8080 \
  list-vehicle

# Delete a vehicle
docker run --rm --network host vehicle-cli \
  -a http://localhost:8080 \
  delete-vehicle --id 1
```


## Installation
```bash
docker pull ghcr.io/soukainanadir/vehicle-cli:latest
```


## Usage

### Commands

#### Create a vehicle
```bash
docker run --rm --network host vehicle-cli \
  -a http://localhost:8080 \
  create-vehicle -s "0001" -b 75 --lat 48.8566 --lon 2.3522
```

#### List all vehicles
```bash
docker run --rm --network host vehicle-cli \
  -a http://localhost:8080 \
  list-vehicle
```

#### Delete a vehicle
```bash
docker run --rm --network host vehicle-cli \
  -a http://localhost:8080 \
  delete-vehicle --id 1
```


### Command Options

| Command | Options | Description |
|---------|---------|-------------|
| `create-vehicle` | `-s, --shortcode` <br> `-b, --battery` <br> `--lat` <br> `--lon` | Shortcode (required) <br> Battery 0-100 (required) <br> Latitude -90 to 90 (required) <br> Longitude -180 to 180 (required) |
| `list-vehicle` | None | List all vehicles |
| `delete-vehicle` | `-i, --id` | Vehicle ID (required) |

### Global Options

| Option | Default | Description |
|--------|---------|-------------|
| `--address, -a` | `http://localhost:3000` | API server address |
| `--version, -V` | - | Show version |
| `--help, -h` | - | Show help |

## Development

### Local Setup
```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run in development mode
pnpm run dev
```

### Testing

The project uses Jest for unit testing with test coverage.

**Run tests:**
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage
```

**Test Structure:**
```
src/
├── __tests__/
│   └── index.test.ts              # Main CLI tests
├── commands/
│   └── __tests__/
│       ├── create-vehicle.test.ts  # Create command tests
│       ├── list-vehicle.test.ts    # List command tests
│       └── delete-vehicle.test.ts  # Delete command tests
└── utils/
    └── __tests__/
        ├── http-client.test.ts     # HTTP client tests
        └── error-handler.test.ts   # Error handling tests
```

**Code Quality:**
```bash
# Run linter
pnpm run lint

# Fix linting issues
pnpm run lint:fix
```

## CI/CD

### Continuous Integration
- Runs on every push and pull request
- Steps: Install → Build → Lint → Test
- Configuration: `.github/workflows/ci.yml`

### Continuous Deployment
- Triggered by version tags (e.g., `v1.0.0`)
- Publishes Docker images to GitHub Container Registry
- Configuration: `.github/workflows/cd.yml`

**Create a release:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

## API Reference

The CLI expects the following API endpoints:

### GET /vehicles
```json
{
  "vehicles": [
    {
      "id": 1,
      "shortcode": "0001",
      "battery": 75,
      "position": {
        "latitude": 48.8566,
        "longitude": 2.3522
      }
    }
  ]
}
```

### POST /vehicles
**Request:**
```json
{
  "shortcode": "0001",
  "battery": 75,
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

**Response:**
```json
{
  "vehicle": {
    "id": 1,
    "shortcode": "0001",
    "battery": 75,
    "position": {
      "latitude": 48.8566,
      "longitude": 2.3522
    }
  }
}
```

### DELETE /vehicles/:id
Returns `204 No Content` on success.

## Project Structure
```
vehicle-cli/
├── .github/workflows/     # CI/CD pipelines
├── src/
│   ├── commands/          # CLI command implementations
│   │   ├── __tests__/     # Command tests
│   │   ├── create-vehicle.ts
│   │   ├── list-vehicle.ts
│   │   └── delete-vehicle.ts
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # HTTP client and error handling
│   │   └── __tests__/     # Utility tests
│   ├── __tests__/         # Main CLI tests
│   └── index.ts           # CLI entry point
├── dist/                  # Compiled JavaScript
├── Dockerfile             # Multi-stage Docker build
├── package.json
├── tsconfig.json
└── jest.config.js
```


## License

ISC License 

---



## Authors

<table>
<tr>
<td align="center">
<a href="https://github.com/SoukainaNadir">
<img src="https://github.com/SoukainaNadir.png" width="100px;" alt="Soukaina Nadir"/><br />
<sub><b>Soukaina Nadir</b></sub>
</a>
</td>
<td align="center">
<a href="https://github.com/akanadirensg">
<img src="https://github.com/akanadirensg.png" width="100px;" alt="Akanadir ENSG"/><br />
<sub><b>Nadir Akayab</b></sub>
</a>
</td>
<td align="center">
<a href="https://github.com/elmehdikaalat">
<img src="https://github.com/elmehdikaalat.png" width="100px;" alt="El Mehdi Kaalat"/><br />
<sub><b>El Mehdi Kaalat</b></sub>
</a>
</td>
</tr>
</table>

---

<div align="center">

**Made with ❤️ and TypeScript**

[![GitHub](https://img.shields.io/badge/GitHub-SoukainaNadir%2Fvehicle--cli-181717?style=for-the-badge&logo=github)](https://github.com/SoukainaNadir/vehicle-cli)
[![Docker](https://img.shields.io/badge/Docker-ghcr.io-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://ghcr.io/soukainanadir/vehicle-cli)

</div>
