# TCOMP (Tensor Compressed Marketplace)

_"For my ally is Compression, and a powerful ally it is..."_

## Dev setup

Add the following to `~/.cargo/config` to enable installing a github crate:

```toml
[net]
git-fetch-with-cli = true
```

Ensure `solana` CLI is [MUST be running v1.14.14](https://docs.solana.com/cli/install-solana-cli-tools):

```sh
sh -c "$(curl -sSfL https://release.solana.com/v1.14.14/install)"
```

Ensure `anchor` is [running v0.26](https://book.anchor-lang.com/getting_started/installation.html).

Ensure `cargo` is running on v1.69.0.

> If you run into any issues with build errors eg "found possibly newer version of crate `core`"
> clear out all your `targets/` folders (including inside every `deps/` program.
