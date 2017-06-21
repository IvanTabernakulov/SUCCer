var goodColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#4B0082', '#0000FF', '#8B00FF']
var converted = [];
var playing = true;
var plsNoUpdate = false;
var next = '';
var succlist = [];
var aboutToPlay = '';
var i = 0;
var myMedia;
var holdTheResume = false;

document.addEventListener('deviceready', onDeviceReady, false);
function onDeviceReady() {
    //audioUrl = 'https://www.youtubeinmp3.com/fetch/?video=https://youtu.be/e4jr0C-clCI';
    
    $('#search').show();
    //$('#url').show();
    $('#play').show();
    $('#next').show();

    doEverythingFuckingPossibleToSUCCThis('youtu.be/fV3Fu5csdcA');

    $('#search').click(function () {
        url = $('#url').val();
        doEverythingFuckingPossibleToSUCCThis(url);
    });

    $("#url").keypress(function (e) {
        if (e.keyCode === 13) {
            $('#search').click();
            $("#url").blur();
        }
    });

    $('#url').focus(function () {
        this.value = '';
    });

    $('.togglePlay').click(togglePlay);

    function togglePlay() {
        if (playing) {
            myMedia.pause();
            playing = false;
        }
        else {
            myMedia.play();
            playing = true;
        }
    }

    $('#next').click(function () {        
        var newUrl = $('#url').val();

        if (newUrl.indexOf('youtube.com/') === -1 && newUrl.indexOf('youtu.be/') === -1) {
            $('#next').val('fak u');
            setTimeout(function () { $('#next').val('SUCC LATER'); }, 1000);
            return;
        }

        var newSUCC = {
            key: newUrl,
            value: 'pre-SUCCing...'
        };
        succlist.push(newSUCC);
        preSUCC(newSUCC);
        updateSUCClist();
    });

    function doEverythingFuckingPossibleToSUCCThis(url) {
        aboutToPlay = url;
        $('#presucc').html('');
        $('#next').val('SUCC LATER');

        if (url.indexOf('youtube.com/') === -1 && url.indexOf('youtu.be') === -1) {
            $('#url').val('fak u');
            return;
        }

        var videoId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
        var cover = 'https://img.youtube.com/vi/' + videoId + '/0.jpg';
        $('#thumbnail').attr('src', cover);

        //var getUrl = 'http://www.youtubeinmp3.com/fetch/?video=' + url;

        if (myMedia !== undefined) {
            myMedia.stop();
            myMedia.release();
        }

        var getUrl = 'http://www.youtubeinmp3.com/fetch/?format=JSON&video=' + url;

        $.ajax({
            url: getUrl,
            type: 'GET',
            contentType: 'application/json',
            crossDomain: true,
            success: function (result) {
                if (result[0] === '<') {
                    $('#status').text($('#status').text()[0] === 'p' ? $('#status').text() + '.' : 'processing..');
                    convert(aboutToPlay);
                }
                else {
                    var res = JSON.parse(result);

                    myMedia = new Media(res.link,
                        function () {
                        },
                        function (code) {
                            if (code.code === 0) {
                                $('#status').text('some fkken error'); return;
                            } // some fukken error;

                            if (code.code === 1) { // convert
                                myMedia.release();
                                $('#status').text($('#status').text()[0] === 'p' ? $('#status').text() + '.' : 'processing..');
                                convert(aboutToPlay);
                            }
                        },
                        function (code) {
                            if (code === 2) {
                                aboutToPlay = '';
                                playing = true;
                                MusicControls.updateIsPlaying(true);
                                $('#play').val('Pause');
                            }
                            else if (code === 3) {
                                playing = false;
                                MusicControls.updateIsPlaying(false);
                                $('#play').val('Play');
                            }
                            else if (code === 4) {
                                playing = false;
                                MusicControls.updateIsPlaying(false);
                                $('#play').val('Play');
                            }
                        }
                    );

                    initializeMusicControls(res.title, cover);
                    myMedia.play();

                    $('#seekbar').val(0);
                    $('#seekbar').attr('max', res.length - 2);
                    $('#seekbar').show();
                }
            },
            error: function (request, error) {
                alert('Error ' + error);
            }
        });
    }

    var mediaTimer = setInterval(function () {
        if (plsNoUpdate || myMedia === undefined) return;

        myMedia.getCurrentPosition(
            // success callback
            function (position) {
                if (position > -1) {
                    var intPosition = parseInt(position, 10);
                    var duration = parseInt(myMedia._duration, 10)

                    if (duration > -1) {
                        $('#status').text(secondsToTime(intPosition) + ' / ' + secondsToTime(duration));
                        $('#seekbar').val(intPosition);

                        if (myMedia._duration - position <= 1 && succlist.length > 0) { // fetch the next song, boiz!
                            myMedia.release();
                            var nextSUCC = succlist.shift();
                            doEverythingFuckingPossibleToSUCCThis(nextSUCC.key);
                            updateSUCClist();
                        }
                    }
                }
            },
            // error callback
            function (e) {
                $('#status').text("Error getting pos=" + e);
            }
        );
    }, 1000);

    function convert(url) {
        if (url === '') return;

        url = 'http://www.youtubeinmp3.com/fetch/?format=JSON&video=' + url;
        if ($.inArray(url, converted) !== -1) { // in progress
            setTimeout(function () { doEverythingFuckingPossibleToSUCCThis(aboutToPlay); }, 5000);
            return;
        }

        $.ajax({
            url: url,
            type: 'GET',
            contentType: 'application/json',
            crossDomain: true,
            success: function (result) {
                noUse = false;
                if (result[0] === '<') {
                    var url = result.substring(43, result.length - 3)
                    $.get(url, function (data) {
                        var link = $(data).find('#download').attr('href');
                        if (link === undefined) {
                            $('#presucc').html('Shit wont convert (too long, question mark)');
                            noUse = true;
                            return;
                        }

                        $.get('http://www.youtubeinmp3.com/' + link, function (data) {
                        });
                    });
                }

                setTimeout(function () {
                    if (!noUse) doEverythingFuckingPossibleToSUCCThis(aboutToPlay);
                }, 5000);
            },
            error: function (request, error) {
                alert('Error ' + error);
            }
        });
        converted.push(url);
    }

    function preSUCC(newSUCC) {
        var url = 'http://www.youtubeinmp3.com/fetch/?format=JSON&video=' + newSUCC.key;
        $('#next').val('pre-SUCCing...')

        $.ajax({
            url: url,
            type: 'GET',
            contentType: 'application/json',
            crossDomain: true,
            success: function (result) {
                if (result[0] === '<') {
                    var url = result.substring(43, result.length - 3);
                    $.get(url, function (data) {
                        var link = $(data).find('#download').attr('href');
                        $.get('http://www.youtubeinmp3.com/' + link, function (data) {
                        });
                    });
                    setTimeout(function () { preSUCC(url) }, 5000);
                }
                else {
                    var res = JSON.parse(result);
                    newSUCC.value = res.title;
                    updateSUCClist();
                    setTimeout(function () {
                        $('#presucc').html('');
                        $('#next').val('SUCC LATER');
                    }, 1500);
                   
                    $('#next').val(' ↓  ↓  ↓ ');
                }
            },
            error: function (request, error) {
                alert('Error ' + error);
            }
        });
    }

    function initializeMusicControls(track, cover) {
        MusicControls.destroy();

        MusicControls.create({
            track: track,
            cover: cover,
            dismissable: true,
            hasPrev: false,		// show previous button, optional, default: true
            hasNext: true,		// show next button, optional, default: true
            ticker: 'Now playing "' + track + '"'
        });

        function events(action) {
            switch (action) {
                case 'music-controls-next':
                    if (succlist.length > 0) {
                        myMedia.release();
                        var nextSUCC = succlist.shift();
                        doEverythingFuckingPossibleToSUCCThis(nextSUCC.key);
                        updateSUCClist();
                    }
                    break;
                case 'music-controls-previous':
                    // Do something
                    break;
                case 'music-controls-pause':
                    togglePlay();
                    break;
                case 'music-controls-play':
                    togglePlay();
                    break;

                // Headset events (Android only)
                case 'music-controls-media-button-headset-hook':
                    togglePlay();
                    break;
                case 'music-controls-media-button':
                    togglePlay();
                    break;
                case 'music-controls-headset-unplugged':
                    if (playing) {
                        myMedia.pause();
                        playing = false;
                    }
                    break;
                default:
                    break;
            }
        }

        MusicControls.subscribe(events);
        MusicControls.listen();
    }    

    function secondsToTime(sec) {
        var date = new Date(0, 0);
        date.setSeconds(sec);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        var result = hours > 0 ? hours > 9 ? (hours + ':') : ('0' + hours + ':') : '';
        result += (minutes > 9 ? minutes : '0' + minutes) + ':';
        result += seconds > 9 ? seconds : '0' + seconds;

        return result;
    }

    $('#seekbar').change(function () {
        var value = $('#seekbar').val();
        plsNoUpdate = false;
        myMedia.seekTo(value * 1000);
    });

    $("#seekbar").on('input', function (e) {
        var value = $('#seekbar').val();
        plsNoUpdate = true;
        $('#status').text(secondsToTime(value) + ' / ' + secondsToTime(parseInt(myMedia._duration, 10)));
    });

    $("#adds").bind('touchstart', function (e) {
        var $self = $(this);

        if ($self.is(".btn-disabled")) {
            return;
        }
        if ($self.closest("[data-ripple]")) {
            e.stopPropagation();
        }

        var initPos = $self.css("position"),
            offs = $self.offset(),
            x = e.originalEvent.touches[0].pageX - offs.left,
            y = e.originalEvent.touches[0].pageY - offs.top,
            dia = Math.min(this.offsetHeight, this.offsetWidth, 100), // start diameter
            $ripple = $('<div/>', { class: "ripple", appendTo: $self });

        if (!initPos || initPos === "static") {
            $self.css({ position: "relative" });
        }

        $('<div/>', {
            class: "rippleWave",
            css: {
                background: goodColors[i++],//$self.data("ripple"),
                width: dia,
                height: dia,
                left: x - (dia / 2),
                top: y - (dia / 2),
            },
            appendTo: $ripple,
            one: {
                animationend: function () {
                    $ripple.remove();
                }
            }
        });

        if (goodColors.length <= i) i = 0;
    });

    function updateSUCClist() {
        var result = '';

        for (var i = 0; i < succlist.length; i++) {
            result += (i + 1) + '. ' + succlist[i].value;
            if (i + 1 !== succlist.length) result += '<br>';
        }

        $('#succlist').html(result);
    }

    cordova.SharingReceptor.listen(function (data) {
        if (data == '') return;
        if (data.intent.extras["android.intent.extra.TEXT"].indexOf('http') != 0) return;
        $('#url').val(data.intent.extras["android.intent.extra.TEXT"]);
        updateTitle(data.intent.extras["android.intent.extra.TEXT"]);

        holdTheResume = true;
        setTimeout(function () { holdTheResume = false }, 2000);
        //doEverythingFuckingPossibleToSUCCThis(data.intent.extras["android.intent.extra.TEXT"]);
    });

    document.addEventListener("resume", onResume, false);
    function onResume() {
        if (holdTheResume) return;
        cordova.plugins.clipboard.paste(function (text) {
            if (text.indexOf('youtube.com/') === -1 && text.indexOf('youtu.be') === -1) {
                return;
            }

            updateTitle(text);
            $('#url').val(text);
        });
    }

    function updateTitle(url) {
        if (url.indexOf('youtube.com/') === -1 && url.indexOf('youtu.be') === -1) {
            $('#title').html('');
            return;
        }
        var videoId = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
                
        $.get('http://youtube.com/get_video_info?video_id=' + videoId, function (data) {
            if (data.length > 1000) {
                var titleIndex = data.indexOf('&title=') + 7;
                var dataFromTitle = data.substring(titleIndex);
                var titleEndIndex = dataFromTitle.indexOf('&');
                var title = dataFromTitle.substring(0, titleEndIndex);
                title = decodeURIComponent((title + '').replace(/\+/g, '%20'));
                $('#title').html('Ready to SUCC: ' + title);
            }
            else {
                $('#title').html('Ready to SUCC: ' + url);
            }
        });
    }
}