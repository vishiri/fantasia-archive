# Fantasia Archive (fantasia-archive)

A worldbuilding database manager

Use Yarn 1.22.19, or things may become unstable.

Make sure you are running this with Node v18.20.6 (`nvm` is great for these older versions).

> Playwright tests run from a built, live version of FA. Therefore, to run them, you need to locally build the app on your machine first - both the first time you use them and every time something is changed in the source code.

## Install Quasar CLI for smoothest experience
##### Details found here: https://quasar.dev/start/quasar-cli

##### Ensure that the Yarn global install location is in your PATH after installation (details in the article linked above).

```
yarn global add @quasar/cli
```

## Install the dependencies and set up the project
```
yarn
```

### Start the app in Quasar development mode (hot-code reloading, error reporting, etc.)
```
quasar dev -m electron
```

### Build the app for production
```
quasar build -m electron
```

### Storybook (Vue components)

Use Storybook to develop/document renderer components in isolation.

```
yarn storybook
```

Build static Storybook output:

```
yarn build-storybook
```

Stories live next to components as `*.stories.ts` under `src/components/**`.

### Testing

#### Unit test - via Vitest

Use Vitest for deterministic unit logic in both app layers: renderer code under `src/` (helpers, store/composable logic, extracted component-facing transforms), Electron/runtime code under `src-electron/`, and shallow-mounted `.vue` files under `src/components/` (second Vitest config; see `vitest.components.config.mts`).

```
yarn test:unit
```

#### Component test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.

Use Playwright component/E2E tests for rendered behavior and integration flows that rely on the built app runtime.
```
yarn test:component
```

#### Component list test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.

> Opens a CLI prompt listing available component tests.
```
yarn test:componentList
```

#### Component single test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.
```
yarn test:componentSingle --component=COMPONENT_FOLDER_NAME
```

#### E2E test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.
```
yarn test:e2e
```

#### E2E list test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.

> Opens a CLI prompt listing available E2E tests.
```
yarn test:e2eList
```

#### E2E single test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.
```
yarn test:e2eSingle --spec=SPEC_FILE_NAME
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
