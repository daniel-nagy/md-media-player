# Material Design Media Player

This module provides a HTML5 audio API written in AngularJS for use with [Angular Material](https://material.angularjs.org/latest/#/).

## Demo

http://danielnagy.me/md-media-player

## Installation
This package is installable through the Bower package manager.

```
bower install md-media-player --save
```

## Usage

```html
<md-media-player collection-id="936832274" src="media/${album-title}/${track-title}.m4a"></md-media-player>
```

## API Documentation

### iTunes Queries

Album information may be queried from iTunes.

| Attribute       | Type     | Description |
| :-------------- | :------- | :---------- |
| `collection-id` | `String` | A collection ID for an album from the iTunes Store. |

## Resource URIs

| Attribute | Type     | Description |
| :-------- | :------- | :---------- |
| `src`     | `String` | A URI for hosted audio files. The URI can accept album variables. |

**URI Variables**

| Variable          | Description      |
| :---------------- | :--------------- |
| `${album-artist}` | The album artist. |
| `${album-title}`  | The title of the album. |
| `${track-title}`  | The title of the current track. |

## Contributing

**Requires**

* node
* grunt-cli

This repository contains a demo application for developing features. As you make changes the application will live reload itself.

##### Running the App Locally

Clone this repository to your local machine.

```
git clone https://github.com/daniel-nagy/md-media-player.git
cd md-media-player
```

Create a new branch for the issue you are working on.

```
git checkout -b my-issue
```

Install the package dependencies.

```
npm install
bower install
```

Run the application and visit `127.0.0.1:8000` in the browser.

```
grunt
```

Make your modifications and update the build.

```
grunt build
```

Create a pull request!