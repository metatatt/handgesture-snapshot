# *process flow* handChecker 2023.09

## events table
|sevents|state |prompt|data/constructor|error
|--|--|--|--|--|
|start | null|say 'Hey Joe'|`init()`, `iniAgora()`*not included here
|voice | 1|await motion...|
|motion detected |2|await gesture|
|gesture detected |3|say 'check'|`.boxLoc()`, `typeOf()`|'gesture first', `rout to 2`
|break[]|--|--|--|--|
|check or upload |4|checking now|.`imageBlob()|`
|md ready |5|showing result|save to Azure CV Prediction

## variables

|var| reference |
|--|--|
| prompt: |instruction or state, `say 'Hey Computer' to start,/awaiting hand gesture...`,`  |
| dataset: |id, tag, info,|
| dataset: |keyContain `key (CV prediction) or contain (Azure storage container)`|
| dataset: |endConnect `endpoint (CV prediction) or connection (Azure storage container)`|
| snapShot: |image & prediction results|
| snapShot Image: |blob, 224 X 224, vector directioned per pointing gesture|
| socket|messages to lead console: `gridID`, state|
| Agora|webRTC, auth `token, UID, session ID`, and `channel name|`

## js libraries

|js| usage |
|--|--|
|jsQR  | QR Code `./lib/jsQR.js`|
|mediaPipe  | `handMarkers, fileSaver,hands,drawing`  |
|Agora  | `AgoraRTC 4.7.3` |
|Markdown Extension | `marked` and `stackedit.io` |

## bugs and taks
>jsQR failed often
>snapShot image to be shown on sidePage
>error handlings
>
> Sept 02, 2023