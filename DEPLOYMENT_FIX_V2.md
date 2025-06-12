# Vercel Deployment Fix for Crime Patrol Web Frontend

## Issues Fixed

### 1. **Rollup Native Module Error**

The original Vercel deployment was failing with:

```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

### 2. **Invalid Function Runtime Error**

Second deployment attempt failed with:

```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

## Solutions Applied

### 1. **Node.js Version Control**

- Added `.nvmrc` file specifying Node.js 20
- Added Node.js engine specification in `package.json`

### 2. **Rollup Native Dependencies**

- Added platform-specific Rollup native modules as optional dependencies
- For Windows development: `@rollup/rollup-win32-x64-msvc`
- For Vercel (Linux): `@rollup/rollup-linux-x64-gnu`
- For macOS: `@rollup/rollup-darwin-x64` and `@rollup/rollup-darwin-arm64`

### 3. **Optimized Vite Configuration**

- Enhanced `vite.config.js` with production-optimized settings
- Added build target specification (`es2020`)
- Configured minification with `esbuild`
- Disabled sourcemaps for production

### 4. **Fixed Vercel Configuration**

- **REMOVED** duplicate `vercel.json` file from `web-frontend/` directory
- **FIXED** invalid function runtime configuration
- **ADDED** proper SPA routing with `rewrites` for React Router
- **UPDATED** build commands with `--omit=optional` flag

## Files Modified

1. **`.nvmrc`** - Node.js version specification
2. **`vercel.json`** (root) - Corrected Vercel deployment configuration
3. **`package.json`** - Dependencies and build settings
4. **`vite.config.js`** - Enhanced build configuration
5. **REMOVED** `web-frontend/vercel.json` - Duplicate causing conflicts

## Current Vercel Configuration

```json
{
  "version": 2,
  "buildCommand": "cd web-frontend && npm ci --omit=optional && npm run build",
  "outputDirectory": "web-frontend/dist",
  "installCommand": "cd web-frontend && npm ci --omit=optional",
  "framework": null,
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Deployment Commands

For local testing:

```bash
cd web-frontend
npm install --omit=optional
npm run build
```

For Vercel deployment:

- Push to GitHub
- Vercel will automatically use the configuration in root `vercel.json`
- Build should complete successfully without errors

## Key Changes Summary

- ✅ Fixed Rollup native module missing error
- ✅ Fixed invalid function runtime configuration
- ✅ Removed duplicate vercel.json causing conflicts
- ✅ Added proper SPA routing for React Router
- ✅ Optimized for Node.js 20.x (Vercel's stable version)
- ✅ Added platform-specific dependencies as optional
- ✅ Enhanced build configuration for production

The deployment should now work without the `MODULE_NOT_FOUND` or function runtime errors.
