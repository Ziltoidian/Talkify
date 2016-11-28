﻿function talkifyPlaybar(parent) {
    var settings = {
        parentElement: parent || talkifyConfig.ui.audioControls.container || document.body
    }

    var playElement, pauseElement, rateElement, volumeElement, progressElement, voiceElement, currentTimeElement, trackTimeElement, textHighlightingElement, timeWrapperElement, controlsWrapperElement, wrapper, voiceWrapperElement;

    var events = {
        onPlayClicked: function () { },
        onPauseClicked: function () { },
        onVolumeChanged: function () { },
        onRateChanged: function () { },
        onTextHighlightingClicked: function () { }
    }

    function hide(element) {
        if (element.classList.contains("talkify-hidden")) {
            return;
        }

        element.className += " talkify-hidden";
    }

    function show(element) {
        element.className = element.className.replace("talkify-hidden", "");
    }

    function play() {
        hide(playElement);
        show(pauseElement);
    }

    function pause() {
        hide(pauseElement);
        show(playElement);
    }

    function addClass(element, c) {
        if (element.classList.contains(c)) {
            return;
        }

        element.className += (" " + c);
    }

    function removeClass(element, c) {
        element.className = element.className.replace(c, "");
    }

    function render() {
        var existingControl = document.getElementById("htmlPlaybar");
        if (existingControl) {
            existingControl.parentNode.removeChild(existingControl);
        }

        wrapper = document.createElement("section");
        wrapper.id = "htmlPlaybar";
        wrapper.className = "talkify-audio-control";

        voiceWrapperElement = document.createElement("div");
        voiceWrapperElement.className = "talkify-audio-control-voice-wrapper";
        voiceWrapperElement.textContent = "Speaking:";

        voiceElement = document.createElement("span");

        textHighlightingElement = document.createElement("i");
        textHighlightingElement.className = "fa fa-cc talkify-clickable talkify-disabled";
        textHighlightingElement.title = "Toggle text highlighting (applied for the next paragraph)";

        voiceWrapperElement.appendChild(voiceElement);
        voiceWrapperElement.appendChild(textHighlightingElement);

        timeWrapperElement = document.createElement("div");
        timeWrapperElement.className = "talkify-inline";

        currentTimeElement = document.createElement("span");
        currentTimeElement.id = "talkify-current-track-time";
        currentTimeElement.textContent = "0:00";

        trackTimeElement = document.createElement("span");
        trackTimeElement.id = "talkify-track-time";
        trackTimeElement.textContent = "0:00";

        timeWrapperElement.appendChild(currentTimeElement);
        timeWrapperElement.appendChild(document.createTextNode("/"));
        timeWrapperElement.appendChild(trackTimeElement);

        progressElement = document.createElement("progress");
        progressElement.setAttribute("value", "0.0");
        progressElement.setAttribute("max", "1.0");

        var backElement = document.createElement("i");
        backElement.className = "fa fa-backward fa-2x talkify-clickable";

        playElement = document.createElement("i");
        playElement.className = "fa fa-play-circle fa-2x talkify-clickable";

        pauseElement = document.createElement("i");
        pauseElement.className = "fa fa-pause fa-2x talkify-clickable";

        var forwardElement = document.createElement("i");
        forwardElement.className = "fa fa-forward fa-2x talkify-clickable";

        controlsWrapperElement = document.createElement("div");
        controlsWrapperElement.className = "talkify-wrapper talkify-inline";

        var rateIconElement = document.createElement("i");
        rateIconElement.className = "fa fa-tachometer";

        rateElement = document.createElement("input");
        rateElement.setAttribute("type", "range");
        rateElement.setAttribute("value", "5");
        rateElement.setAttribute("min", "0");
        rateElement.setAttribute("max", "10");
        rateElement.setAttribute("title", "Adjust playback speed");

        var volumeIconElement = document.createElement("i");
        volumeIconElement.className = "fa fa-volume-up";

        volumeElement = document.createElement("input");
        volumeElement.setAttribute("type", "range");
        volumeElement.setAttribute("value", "10");
        volumeElement.setAttribute("min", "0");
        volumeElement.setAttribute("max", "10");
        rateElement.setAttribute("title", "Adjust playback volume");

        wrapper.appendChild(voiceWrapperElement);
        wrapper.appendChild(timeWrapperElement);
        wrapper.appendChild(playElement);
        wrapper.appendChild(pauseElement);

        wrapper.appendChild(progressElement);
        //wrapper.appendChild(backElement);
        //wrapper.appendChild(forwardElement);
        wrapper.appendChild(controlsWrapperElement);
        controlsWrapperElement.appendChild(rateIconElement);
        controlsWrapperElement.appendChild(rateElement);
        controlsWrapperElement.appendChild(volumeIconElement);
        controlsWrapperElement.appendChild(volumeElement);

        settings.parentElement.appendChild(wrapper);

        pause();
    }

    function setupBindings() {
        playElement.addEventListener("click", function () {
            events.onPlayClicked();
        });

        pauseElement.addEventListener("click", function () {
            events.onPauseClicked();
        });

        rateElement.addEventListener("change", function () {
            events.onRateChanged(parseInt(this.value));
        });

        volumeElement.addEventListener("change", function (e) {
            events.onVolumeChanged(parseInt(this.value));
        });

        textHighlightingElement.addEventListener("click", function (e) {
            if (textHighlightingElement.classList.contains("talkify-disabled")) {
                removeClass(textHighlightingElement, "talkify-disabled");
            } else {
                addClass(textHighlightingElement, "talkify-disabled");
            }

            events.onTextHighlightingClicked();
        });
    }

    function initialize() {
        render();
        setupBindings();
    };

    function listenToAudioSrc(src) {
        if (!(src instanceof Node)) {
            return;
        }

        src.addEventListener("timeupdate", function (e) {
            progressElement.setAttribute("value", e.target.currentTime / e.target.duration);

            var current = document.getElementById("talkify-current-track-time");
            var total = document.getElementById("talkify-track-time");

            var minutes = Math.floor(e.target.currentTime / 60);
            var seconds = Math.round(e.target.currentTime) - (minutes * 60);

            current.textContent = minutes + ":" + ((seconds < 10) ? "0" + seconds : seconds);

            minutes = Math.floor(e.target.duration / 60);
            seconds = Math.round(e.target.duration) - (minutes * 60);
            total.textContent = minutes + ":" + ((seconds < 10) ? "0" + seconds : seconds);
        }, true);
    }

    function arrangeControlsWhenProgressIsUnsupported() {
        wrapper.insertBefore(voiceWrapperElement, controlsWrapperElement);
        addClass(voiceWrapperElement, "talkify-inline");
    }

    function arrangeControlsWhenProgressIsSupported() {
        wrapper.insertBefore(voiceWrapperElement, timeWrapperElement);
        removeClass(voiceWrapperElement, "talkify-inline");
        show(voiceWrapperElement);
    }

    function isTalkifyHostedVoice(voice) {
        return voice && voice.isTalkify;
    }

    function featureToggle(voice) {
        show(progressElement);
        arrangeControlsWhenProgressIsSupported();
        show(textHighlightingElement);

        if (!voice) {
            return;
        }

        if (isTalkifyHostedVoice(voice)) {
            return;
        }

        hide(timeWrapperElement);

        if (!voice.localService) {
            hide(progressElement);
            arrangeControlsWhenProgressIsUnsupported();
            hide(textHighlightingElement);
        }
    }

    function setVoiceName(voice) {
        if (!voice) {
            voiceElement.textContent = "Automatic voice detection";
            return;
        }

        if (isTalkifyHostedVoice(voice)) {
            voiceElement.textContent = voice.description;
            return;
        }

        voiceElement.textContent = voice.name;
    }

    initialize();

    return {
        subscribeTo: function (subscriptions) {
            events.onPauseClicked = subscriptions.onPauseClicked || events.onPauseClicked;
            events.onPlayClicked = subscriptions.onPlayClicked || events.onPlayClicked;
            events.onRateChanged = subscriptions.onRateChanged || events.onRateChanged;
            events.onVolumeChanged = subscriptions.onVolumeChanged || events.onVolumeChanged;
            events.onTextHighlightingClicked = subscriptions.onTextHighlightingClicked || events.onTextHighlightingClicked;
            return this;
        },
        setRate: function (value) {
            rateElement.setAttribute("value", value);
            return this;
        },
        setMaxRate: function (value) {
            rateElement.setAttribute("max", value);
            return this;
        },
        setMinRate: function (value) {
            rateElement.setAttribute("min", value);
            return this;
        },
        markAsPaused: pause,
        markAsPlaying: play,
        setTextHighlight: function (enabled) {
            if (enabled) {
                removeClass(textHighlightingElement, "talkify-disabled");
                return;
            }

            addClass(textHighlightingElement, "talkify-disabled");
        },
        setProgress: function (value) {
            progressElement.setAttribute("value", value);
        },
        setVoice: function (voice) {
            featureToggle(voice);
            setVoiceName(voice);

            return this;
        },
        setAudioSource: function (src) {
            listenToAudioSrc(src);
        }
    }
}