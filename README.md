# Warning!
## Do not use for production! This is just personal playground/sandbox demonstrating the basic usage of the tsjs-xpx-dfms-api, intended only for manual testing. Additionally, my frontend/GUI skills and aesthetic perception is next to none.

# Notes
- tested with locally running dfms v0.6.1 - localhost:6366
- to make it working in Chrome with locally running dev server (port 4200), I had to hide the dfms service behind nginx, and configure nginx to
    -  add CORS headers to the responses (GET, POST)
        - ```
            add_header 'Access-Control-Allow-Origin' '*';
            ```
    - remove ```Referer``` and ```Origin``` headers from requests (added automatically by Chrome)
        - ```
            proxy_set_header Referer "";
            proxy_set_header Origin "";
            ```
    - allow big payloads and don't buffer them
        - ```
            client_max_body_size 8G;
            proxy_request_buffering off;
            ```

# TsjsXpxDfmsApiHttpClientSandbox

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.24.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
