# Publishing Guide for exitus-spring-cli

This guide covers how to publish the package to npm.

## Prerequisites

1. **npm account**: Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **npm CLI authenticated**: Run `npm login`

## Pre-publish Checklist

- [ ] Update version in `package.json`
- [ ] Update `README.md` if needed
- [ ] Run tests (when available)
- [ ] Build the project
- [ ] Test the CLI locally

## Steps to Publish

### 1. Login to npm

```bash
npm login
```

Enter your npm username, password, and email.

### 2. Verify Package Contents

```bash
npm pack --dry-run
```

This shows what files will be included in the package.

### 3. Build the Project

```bash
npm run rebuild
```

### 4. Test Locally (Optional)

You can test the package locally before publishing:

```bash
# Create a tarball
npm pack

# Install globally from the tarball
npm install -g exitus-spring-cli-0.1.0.tgz

# Test the CLI
exitus-spring-cli --help
exitus-spring-cli new TestEntity --dry-run

# Uninstall when done
npm uninstall -g exitus-spring-cli
```

### 5. Publish to npm

```bash
npm publish
```

For first-time publish of a scoped package, use:

```bash
npm publish --access public
```

## Version Management

Use npm version to update the version:

```bash
# Patch version (0.1.0 -> 0.1.1)
npm version patch

# Minor version (0.1.0 -> 0.2.0)
npm version minor

# Major version (0.1.0 -> 1.0.0)
npm version major
```

This automatically:
1. Updates `package.json`
2. Creates a git commit
3. Creates a git tag

## Publish a New Version

```bash
# Update version
npm version patch -m "Release v%s"

# Publish
npm publish
```

## Unpublish (if needed)

You can unpublish within 72 hours:

```bash
npm unpublish exitus-spring-cli@0.1.0
```

Or deprecate a version:

```bash
npm deprecate exitus-spring-cli@0.1.0 "This version has issues, please upgrade"
```

## Git Workflow

### First Time Setup

```bash
# Initialize git
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: exitus-spring-cli v0.1.0"

# Add remote
git remote add origin https://github.com/ensinho/exitus-spring-cli.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Release Workflow

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for release"

# Update version and create tag
npm version patch -m "Release v%s"

# Push commits and tags
git push && git push --tags

# Publish to npm
npm publish
```

## Troubleshooting

### "You must be logged in to publish packages"

```bash
npm login
```

### "Package name already exists"

Change the package name in `package.json` or use a scoped name:

```json
{
  "name": "@your-username/exitus-spring-cli"
}
```

### "Cannot publish over previously published version"

Update the version:

```bash
npm version patch
```

### Check if package name is available

```bash
npm view exitus-spring-cli
```

If it returns 404, the name is available.

## Package URLs

After publishing:

- **npm**: https://www.npmjs.com/package/exitus-spring-cli
- **Install**: `npm install -g exitus-spring-cli`
- **npx**: `npx exitus-spring-cli new EntityName`
