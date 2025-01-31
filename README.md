# Fantasia Archive (fantasia-archive)

A worldbuilding database manager

Use Yarn 1.22.19 or stuff is gonna bug out.

Make sure you are running this with Node v18.20.6 ("nvm" is great for these older versions)

> Playwright tests run from built, live version of FA. Therefore, to run them, you need to localy build the app on your machine first - Both on first time using them and every time something is changed in the source code.

## Install Quasar CLI for smoothest experience
##### Details found here: https://quasar.dev/start/quasar-cli

##### Ensure that the Yarn global install location is in your PATH after install. (details in article linked above)

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

### Testing:

#### Unit test - via Vitest

```
test:unit
```

#### Component test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.
```
test:component
```

#### Component single test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.
```
test:component --component=COMPONENT_FOLDER_NAME
```

#### E2E test - via Playwright
> The app MUST be built for production with current code before running the tests due to limitations of the Playwright library.
```
test:e2e
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
