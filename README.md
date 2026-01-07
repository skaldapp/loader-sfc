# Vue SFC Loader

Vue3 Single File Component (SFC) loader. Load .vue files directly from your browser without any build step.

## Features

- 🚀 Load Vue 3 SFCs directly in the browser at runtime
- ⚡ No build step required - perfect for dynamic component loading
- 🛠️ Supports TypeScript and JSX
- 📦 Lightweight and efficient
- 🔧 Compatible with Vue's `defineAsyncComponent`

## Installation

Install `@vuebro/loader-sfc` with npm:

```bash
npm install @vuebro/loader-sfc
```

Or with yarn:

```bash
yarn add @vuebro/loader-sfc
```

Or with pnpm:

```bash
pnpm add @vuebro/loader-sfc
```

## Usage

### Basic Usage

To load .vue files dynamically at runtime just use the `loadModule` function:

```vue
<script setup>
import { defineAsyncComponent } from "vue";
import loadModule from "@vuebro/loader-sfc";

const AdminPage = defineAsyncComponent(async () =>
  loadModule(await (await fetch("./components/AdminPageComponent.vue")).text()),
);
</script>

<template>
  <AdminPage />
</template>
```

### Advanced Usage with Configuration

You can pass configuration options to customize the compilation process:

```javascript
import { defineAsyncComponent } from "vue";
import loadModule from "@vuebro/loader-sfc";

const MyComponent = defineAsyncComponent(async () =>
  loadModule(await (await fetch("./components/MyComponent.vue")).text(), {
    scriptOptions: {
      templateOptions: {
        compilerOptions: {
          expressionPlugins: ["typescript"], // Additional Babel plugins
        },
      },
    },
    parseOptions: {
      // Options for the SFC parser
    },
    styleOptions: {
      // Options for style compilation
    },
  }),
);
```

## API

### `loadModule(filename: string, options?: LoadModuleOptions)`

Loads and compiles a Vue SFC file at runtime.

#### Parameters

- `filename` (string): Path to the .vue file to load
- `options` (LoadModuleOptions, optional): Configuration options for compilation

#### Options

- `scriptOptions`: Options for script compilation
  - `templateOptions`: Options for template compilation
    - `compilerOptions`: Vue template compiler options
      - `expressionPlugins`: Additional Babel parser plugins (e.g., 'typescript', 'jsx')
- `parseOptions`: Options for SFC parsing
- `styleOptions`: Options for style compilation (e.g., scss, less)

## Requirements

- Vue 3.x
- Modern browser that supports ES modules and dynamic imports

## Performance Considerations

- The first load of a component will be slower as it needs to fetch and compile the SFC
- Subsequent loads of the same component will be faster due to browser caching
- Styles are injected into the document once per component and cached by a hash of the filename
- Consider using this loader for truly dynamic components, not for all components in your application

## Building and Development

To build the project locally:

```bash
npm run build
```

To lint the code:

```bash
npm run lint
```

## Examples

A simple example of using `@vuebro/loader-sfc` in a template Vue 3 + TypeScript + Vite application for dynamic loading and compilation of an SFC module during application runtime in the browser can be found in the repository: [loader-sfc-example](https://github.com/vuebro/loader-sfc-example)

## License

This project is licensed under the AGPL-3.0-only License.
