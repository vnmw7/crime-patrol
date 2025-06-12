# Vercel Deployment Fix for Crime Patrol Web Frontend

## Issue Fixed

The original Vercel deployment was failing with a Rollup native module error:

```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

## Solution Applied

### 1. **Node.js Version Control**

- Added `.nvmrc` file specifying Node.js 20
- Updated `vercel.json` to use Node.js 20.x runtime
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

### 4. **Vercel Configuration**

- Updated `vercel.json` with proper build commands
- Added `--omit=optional` flag to prevent optional dependency issues
- Specified correct output directory (`web-frontend/dist`)

## Files Modified

1. **`.nvmrc`** - Node.js version specification
2. **`vercel.json`** - Vercel deployment configuration
3. **`package.json`** - Dependencies and build settings
4. **`vite.config.js`** - Enhanced build configuration

## Deployment Commands

For local testing:

```bash
cd web-frontend
npm install --omit=optional
npm run build
```

For Vercel deployment:

- Push to GitHub
- Vercel will automatically use the configuration in `vercel.json`
- Build should complete successfully without Rollup errors

## Key Changes Summary

- ✅ Fixed Rollup native module missing error
- ✅ Optimized for Node.js 20.x (Vercel's stable version)
- ✅ Added platform-specific dependencies as optional
- ✅ Enhanced build configuration for production
- ✅ Proper Vercel deployment setup

The deployment should now work without the `MODULE_NOT_FOUND` errors that were occurring with Rollup's native dependencies.
