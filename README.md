<h1 align="center">
  Tensor Marketplace
</h1>
<p align="center">
  <img width="400" alt="Tensor Marketplace" src="https://github.com/tensor-foundation/marketplace/assets/729235/9e209493-0829-4688-a629-c3bb62eb24ca" />
</p>
<p align="center">
  Your one-stop-shop for your NFT needs.
</p>

## Overview

The Tensor Foundation Marketplace program allows creating bids and listings of NFTs and digital
assets from various standards, to allow buying and selling of these assets in a permissionless and
decentralized manner. Fees are split between the Tensor Protocol and brokers facilitiating the
trades 50/50.

## Status

The new Marketplace program is currently deployed to devnet, and will get deployed to mainnet on
October 2nd.

| Devnet | Mainnet |
| ------ | ------- |
| v0.7.1 | v0.7.1  |

## Programs

This project contains the following programs:

- [Marketplace](./programs/marketplace/README.md) `TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp`

You will need a Rust version compatible with BPF to compile the program, currently we recommend
using Rust 1.75.0.

## Clients

This project contains the following clients:

- [JavaScript](./clients/js/README.md)
- [Rust](./clients/rust/README.md)

## Build

### Prerequisites

You need the following tools installed to build the project:

- pnpm v9+
- rust v1.78.0
- node v18+
- solana v1.17.23
- anchor v0.29.0

### Steps

Install JavaScript dependencies:

```bash
pnpm install
```

Build the program and generate the clients:

```bash
pnpm programs:build
pnpm generate
```

Run JS and Rust tests:

```bash
pnpm clients:js:test
pnpm clients:rust:test
```

## Contributing

Check out the [Contributing Guide](./CONTRIBUTING.md) the learn more about how to contribute to this
project.

## License

Copyright (c) 2024 Tensor Protocol Foundation

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is
distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing permissions and limitations under the
License.
