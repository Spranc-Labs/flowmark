# Changesets

This folder contains changesets for version management and changelog generation.

## How to use

When you make changes to the codebase:

1. Run `pnpm changeset` to create a new changeset
2. Select which packages changed
3. Describe the changes (major, minor, or patch)
4. Commit the changeset file with your changes

When ready to release:

1. Run `pnpm version` to bump versions
2. Run `pnpm release` to publish to npm

Learn more at https://github.com/changesets/changesets
