<!-- GENERATED FROM SOURCE -->

# vjs

__DEFINED IN__: [src/js/core.js#L26](https://github.com/videojs/video.js/blob/master/src/js/core.js#L26)  

Doubles as the main function for users to create a player instance and also
the main library object.

**ALIASES** videojs, _V_ (deprecated)

The `vjs` function can be used to initialize or retrieve a player.

    var myPlayer = vjs('my_video_id');

---

## INDEX

- [PROPERTIES](#properties)
  - [options](#options)
  - [players](#players)

- [METHODS](#methods)
  - [addLanguage](#addlanguage-code-data-)
  - [parseUrl](#parseurl-url-)
  - [plugin](#plugin-name-init-)
  - [xhr](#xhr-options-callback-)

- CLASSES
  - [BigPlayButton](vjs.BigPlayButton.md)
  - [Button](vjs.Button.md)
  - [CaptionsButton](undefined.md)
  - [ChaptersButton](undefined.md)
  - [ChaptersTrackMenuItem](undefined.md)
  - [Component](vjs.Component.md)
  - [ControlBar](vjs.ControlBar.md)
  - [CoreObject](vjs.CoreObject.md)
  - [CurrentTimeDisplay](vjs.CurrentTimeDisplay.md)
  - [DurationDisplay](vjs.DurationDisplay.md)
  - [ErrorDisplay](vjs.ErrorDisplay.md)
  - [Flash](vjs.Flash.md)
  - [FullscreenToggle](vjs.FullscreenToggle.md)
  - [Html5](vjs.Html5.md)
  - [LiveDisplay](vjs.LiveDisplay.md)
  - [LoadProgressBar](vjs.LoadProgressBar.md)
  - [LoadingSpinner](vjs.LoadingSpinner.md)
  - [MediaError](vjs.MediaError.md)
  - [MediaLoader](vjs.MediaLoader.md)
  - [MediaTechController](undefined.md)
  - [Menu](vjs.Menu.md)
  - [MenuButton](vjs.MenuButton.md)
  - [MenuItem](vjs.MenuItem.md)
  - [MuteToggle](vjs.MuteToggle.md)
  - [OffTextTrackMenuItem](undefined.md)
  - [PlayProgressBar](vjs.PlayProgressBar.md)
  - [PlayToggle](vjs.PlayToggle.md)
  - [PlaybackRateMenuButton](vjs.PlaybackRateMenuButton.md)
  - [PlaybackRateMenuItem](vjs.PlaybackRateMenuItem.md)
  - [Player](vjs.Player.md)
  - [PosterImage](vjs.PosterImage.md)
  - [ProgressControl](vjs.ProgressControl.md)
  - [RemainingTimeDisplay](vjs.RemainingTimeDisplay.md)
  - [SeekBar](vjs.SeekBar.md)
  - [SeekHandle](vjs.SeekHandle.md)
  - [Slider](vjs.Slider.md)
  - [SliderHandle](vjs.SliderHandle.md)
  - [SubtitlesButton](undefined.md)
  - [TextTrackButton](undefined.md)
  - [TextTrackDisplay](undefined.md)
  - [TextTrackMenuItem](undefined.md)
  - [TimeDivider](vjs.TimeDivider.md)
  - [VolumeBar](vjs.VolumeBar.md)
  - [VolumeControl](vjs.VolumeControl.md)
  - [VolumeHandle](vjs.VolumeHandle.md)
  - [VolumeLevel](vjs.VolumeLevel.md)
  - [VolumeMenuButton](vjs.VolumeMenuButton.md)

- NAMESPACES
  - [log](vjs.log.md)
  - [util](vjs.util.md)

---

## PROPERTIES

### options
> Global Player instance options, surfaced from vjs.Player.prototype.options_
> vjs.options = vjs.Player.prototype.options_
> All options should use string keys so they avoid
> renaming by closure compiler

_defined in_: [src/js/core.js#L92](https://github.com/videojs/video.js/blob/master/src/js/core.js#L92)

---

### players
> Global player list

_defined in_: [src/js/core.js#L164](https://github.com/videojs/video.js/blob/master/src/js/core.js#L164)

---

## METHODS

### addLanguage( code, data )
> Utility function for adding languages to the default options. Useful for
> amending multiple language support at runtime.
> 
> Example: vjs.addLanguage('es', {'Hello':'Hola'});

##### PARAMETERS: 
* __code__ `String` The language code or dictionary property
* __data__ `Object` The data values to be translated

##### RETURNS: 
* `Object` The resulting global languages dictionary object

_defined in_: [src/js/core.js#L151](https://github.com/videojs/video.js/blob/master/src/js/core.js#L151)

---

### parseUrl( url )
> Resolve and parse the elements of a URL

##### PARAMETERS: 
* __url__ `String` The url to parse

##### RETURNS: 
* `Object` An object of url details

_defined in_: [src/js/lib.js#L676](https://github.com/videojs/video.js/blob/master/src/js/lib.js#L676)

---

### plugin( name, init )
> the method for registering a video.js plugin

##### PARAMETERS: 
* __name__ `String` The name of the plugin
* __init__ `Function` The function that is run when the player inits

_defined in_: [src/js/plugins.js#L7](https://github.com/videojs/video.js/blob/master/src/js/plugins.js#L7)

---

### xhr( options, callback )
> Simple http request for retrieving external files (e.g. text tracks)
> 
> ##### Example
> 
>     // using url string
>     videojs.xhr('http://example.com/myfile.vtt', function(error, response, responseBody){});
> 
>     // or options block
>     videojs.xhr({
>       uri: 'http://example.com/myfile.vtt',
>       method: 'GET',
>       responseType: 'text'
>     }, function(error, response, responseBody){
>       if (error) {
>         // log the error
>       } else {
>         // successful, do something with the response
>       }
>     });
> 
> 
> API is modeled after the Raynos/xhr, which we hope to use after
> getting browserify implemented.
> https://github.com/Raynos/xhr/blob/master/index.js

##### PARAMETERS: 
* __options__ `Object|String` Options block or URL string
* __callback__ `Function` The callback function

##### RETURNS: 
* `Object` The request

_defined in_: [src/js/xhr.js#L31](https://github.com/videojs/video.js/blob/master/src/js/xhr.js#L31)

---

