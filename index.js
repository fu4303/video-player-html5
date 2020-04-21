const video = document.querySelector('#video');
const videoControls = document.querySelector('#video-controls');


// Checking Video Format Support
const videoWorks = !!document.createElement('video').canPlayType;
if (videoWorks) {
    video.controls = false;
    videoControls.classList.remove('hidden');
}


//Play
const play = document.querySelector('#play');
play.addEventListener('click', togglePlay);

function togglePlay() {
    if (video.paused || video.ended) {
        video.play();
    } else {
        video.pause();
    }
}
//Changing Play Icon To Pause Icon
const playpauseIcon = document.querySelectorAll('.playback-icons use');

video.addEventListener('play', updatePlayButton);
video.addEventListener('pause', updatePlayButton);

function updatePlayButton() {
    playpauseIcon.forEach(icon => icon.classList.toggle('hidden'));

    if (video.paused) {
        play.setAttribute('data-title', 'Play (space)')
    } else {
        play.setAttribute('data-title', 'Pause (space)')
    }

}


const timeElapsed = document.getElementById('time-elapsed');
const duration = document.getElementById('duration');

// formatTime takes a time length in seconds and returns the time in minutes and seconds
function formatTime(timeInSeconds) {
    const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);

    return {
        minutes: result.substr(3, 2),
        seconds: result.substr(6, 2),
    };
};

// initializeVideo sets the video duration, and maximum value of progress bar
function initializeVideo() {
    const videoDuration = Math.round(video.duration);
    seek.setAttribute('max', videoDuration);
    progressBar.setAttribute('max', videoDuration);
    const time = formatTime(videoDuration);
    duration.innerText = `${time.minutes}:${time.seconds}`;
    duration.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`)
}
video.addEventListener('loadedmetadata', initializeVideo);


//Changes the elapsed duration text after video time has been updated, i.e. after each second.
function updateTimeElapsed() {
    const time = formatTime(Math.round(video.currentTime));
    timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
    timeElapsed.setAttribute('datetime', `${time.minutes}m ${time.seconds}s`)
}

video.addEventListener('timeupdate', updateTimeElapsed);


//Update Progress Bar
const progressBar = document.getElementById('progress-bar');
const seek = document.getElementById('seek');

function updateProgress() {
    seek.value = Math.floor(video.currentTime);
    progressBar.value = Math.floor(video.currentTime);
}
video.addEventListener('timeupdate', updateProgress);

//Update Video Seek Tooltip
const seekTooltip = document.getElementById('seek-tooltip');
// updateSeekTooltip uses the position of the mouse on the progress bar to
// roughly work out what point in the video the user will skip to if the progress bar is clicked at that point
function updateSeekTooltip(event) {
    const skipTo = Math.round((event.offsetX / event.target.clientWidth) * parseInt(event.target.getAttribute('max'), 10));
    seek.setAttribute('data-seek', skipTo)
    const t = formatTime(skipTo);
    seekTooltip.textContent = `${t.minutes}:${t.seconds}`;
    const rect = video.getBoundingClientRect();
    seekTooltip.style.left = `${event.pageX - rect.left}px`;
}
/* The above functioncode was not written by @ishandeveloper */
/* Thanks To Mozilla Developer Network's Documentation */

seek.addEventListener('mousemove', updateSeekTooltip);

function skipAhead(event) {
    const skipTo = event.target.dataset.seek;
    video.currentTime = skipTo;
    progressBar.value = skipTo;
    seek.value = skipTo;
}

seek.addEventListener('input', skipAhead);


// Volume Controls

const volumeButton = document.getElementById('volume-button');
const volumeIcons = document.querySelectorAll('.volume-button use');
const volumeMute = document.querySelector('use[href="#volume-mute"]');
const volumeLow = document.querySelector('use[href="#volume-low"]');
const volumeHigh = document.querySelector('use[href="#volume-high"]');
const volume = document.getElementById('volume');

function updateVolume() {
    if (video.muted) {
        video.muted = false;
    }

    video.volume = volume.value;
}
volume.addEventListener('input', updateVolume);


// Update Volume Controls Icon
function updateVolumeIcon() {
    volumeIcons.forEach(icon => {
        icon.classList.add('hidden');
    });

    volumeButton.setAttribute('data-title', 'Mute (m)')

    if (video.muted || video.volume === 0) {
        volumeMute.classList.remove('hidden');
        volumeButton.setAttribute('data-title', 'Unmute (m)')
    } else if (video.volume > 0 && video.volume <= 0.5) {
        volumeLow.classList.remove('hidden');
    } else {
        volumeHigh.classList.remove('hidden');
    }
}

video.addEventListener('volumechange', updateVolumeIcon);

//Mute|Unmute
function toggleMute() {
    video.muted = !video.muted;

    if (video.muted) {
        volume.setAttribute('data-volume', volume.value);
        volume.value = 0;
    } else {
        volume.value = volume.dataset.volume;
    }
}
volumeButton.addEventListener('click', toggleMute);

video.addEventListener('click', togglePlay);

const playbackAnimation = document.getElementById('playback-animation');
// animatePlayback displays an animation when
// the video is played or paused
function animatePlayback() {
    playbackAnimation.animate([{
            opacity: 1,
            transform: "scale(1)",
        },
        {
            opacity: 0,
            transform: "scale(1.3)",
        }
    ], {
        duration: 500,
    });
}
video.addEventListener('click', animatePlayback);

// Full Screen Mode 
const fullscreenButton = document.getElementById('fullscreen-button');
const videoContainer = document.getElementById('video-container');

function toggleFullScreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        videoContainer.requestFullscreen();
    }
}
fullscreenButton.onclick = toggleFullScreen;

//Update full screen icon
const fullscreenIcons = fullscreenButton.querySelectorAll('use');

function updateFullscreenButton() {
    fullscreenIcons.forEach(icon => icon.classList.toggle('hidden'));

    if (document.fullscreenElement) {
        fullscreenButton.setAttribute('data-title', 'Exit full screen (f)')
    } else {
        fullscreenButton.setAttribute('data-title', 'Full screen (f)')
    }
}
videoContainer.addEventListener('fullscreenchange', updateFullscreenButton);

// * PICTURE-IN PICTURE
// REFER TO MOZILLA DEVELOPERS NETWORK DOCUMENTATION 

//Detecting PIP support in browser
document.addEventListener('DOMContentLoaded', () => {
    if (!('pictureInPictureEnabled' in document)) {
        pipButton.classList.add('hidden');
    }
});
const pipButton = document.getElementById('pip-button')

// togglePip toggles Picture-in-Picture mode on the video
async function togglePip() {
    try {
        if (video !== document.pictureInPictureElement) {
            pipButton.disabled = true;
            await video.requestPictureInPicture();
        } else {
            await document.exitPictureInPicture();
        }
    } catch (error) {
        console.error(error)
    } finally {
        pipButton.disabled = false;
    }
}

pipButton.addEventListener('click', togglePip);


//Auto Hide Controls
function hideControls() {
    if (video.paused) {
        return;
    }

    videoControls.classList.add('hide');
}

// showControls displays the video controls
function showControls() {
    videoControls.classList.remove('hide');
}
video.addEventListener('mouseenter', showControls);
video.addEventListener('mouseleave', hideControls);
videoControls.addEventListener('mouseenter', showControls);
videoControls.addEventListener('mouseleave', hideControls);

//Keyboard Support

// keyboardShortcuts executes the relevant functions for
// each supported shortcut key
function keyboardShortcuts(event) {
    const {
        key
    } = event;
    console.log(key);
    switch (key) {
        case ' ':
            togglePlay();
            animatePlayback();
            if (video.paused) {
                showControls();
            } else {
                setTimeout(() => {
                    hideControls();
                }, 2000);
            }
            break;
        case 'm':
            toggleMute();
            break;
        case 'f':
            toggleFullScreen();
            break;
        case 'p':
            togglePip();
            break;
    }
}
document.addEventListener('keyup', keyboardShortcuts);
