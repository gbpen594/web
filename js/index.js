document.addEventListener('DOMContentLoaded', function() {
    // 评分
    const ratings = document.querySelectorAll('.rating');
    
    ratings.forEach(rating => {
        const stars = rating.querySelectorAll('.star');
        const score = parseFloat(rating.dataset.score);
        
        updateStars(score);
        
        rating.addEventListener('mousemove', (e) => {
            const rect = rating.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const starWidth = rect.width / stars.length;
            const starIndex = Math.floor(x / starWidth);
            const isHalfStar = (x % starWidth) < (starWidth / 2);
            
            if (starIndex >= 0 && starIndex < stars.length) {
                stars.forEach((star, index) => {
                    if (index < starIndex) {
                        star.src = 'images/star-on.png';
                    } else if (index === starIndex) {
                        star.src = isHalfStar ? 'images/star-half.png' : 'images/star-on.png';
                    } else {
                        star.src = 'images/star-off.png';
                    }
                });
            }
        });
        
        rating.addEventListener('mouseleave', () => {
            updateStars(score);
        });
        
        function updateStars(value) {
            const fullStars = Math.floor(value);
            const hasHalfStar = value % 1 >= 0.5;
            
            stars.forEach((star, index) => {
                if (index < fullStars) {
                    star.src = 'images/star-on.png';
                } else if (index === fullStars && hasHalfStar) {
                    star.src = 'images/star-half.png';
                } else {
                    star.src = 'images/star-off.png';
                }
            });
        }
    });

    // 点赞功能
    const likeBtn = document.querySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon) {
                if (icon.classList.contains('liked')) {
                    icon.classList.remove('liked');
                } else {
                    icon.classList.add('liked');
                }
            }
        });
    }

    // 全屏游戏功能
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    const playBtn = document.querySelector('.play-btn');
    const gameFrame = document.querySelector('.game-frame iframe');
    const gameFrameContainer = document.querySelector('.game-frame');
    const gameWrap = document.querySelector('.game-wrap');
    const gameMain = document.querySelector('.game-main');
    const gameInfo = document.querySelector('.game-info');

    const backButton = document.createElement('button');
    backButton.className = 'fullscreen-back-button';
    backButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    backButton.setAttribute('aria-label', 'back');
    document.body.appendChild(backButton);

    const env = {
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };

    let isSimulatedFullscreen = false;

    backButton.addEventListener('click', exitFullscreen);
    fullscreenBtn.addEventListener('click', toggleFullScreen);
    playBtn.addEventListener('click', handlePlayClick);
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && env.isIOS && isSimulatedFullscreen) {
            simulateFullscreen();
        }
    });

    if (env.isIOS) {
        window.addEventListener('orientationchange', handleOrientationChange);
    }

    function toggleFullScreen() {
        const isGameLoaded = gameFrameContainer.style.display !== 'none';
        
        if (env.isIOS) {
            simulateFullscreen(isGameLoaded);
            return;
        }

        if (!document.fullscreenElement && 
            !document.mozFullScreenElement && 
            !document.webkitFullscreenElement && 
            !document.msFullscreenElement) {
            enterFullscreen();
        } else {
            exitFullscreen();
        }
    }
    
    function enterFullscreen() {
        const targetElement = gameFrameContainer.style.display !== 'none' 
            ? gameFrame 
            : gameMain;
        
        requestFullscreenForElement(targetElement);
        updateFullscreenButtonIcon(true);
        
        if (env.isMobile) {
            backButton.style.display = 'flex';
        }
    }
    
    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        
        updateFullscreenButtonIcon(false);
        backButton.style.display = 'none';
        
        if (isSimulatedFullscreen) {
            simulateFullscreen();
        }
    }
    
    function requestFullscreenForElement(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    }
    
    function simulateFullscreen(forceGameMode = false) {
        if (!isSimulatedFullscreen) {
            enterSimulatedFullscreen(forceGameMode);
        } else {
            exitSimulatedFullscreen();
        }
    }
    
    function enterSimulatedFullscreen(forceGameMode) {
        gameMain.dataset.originalStyles = JSON.stringify({
            position: gameMain.style.position,
            top: gameMain.style.top,
            left: gameMain.style.left,
            width: gameMain.style.width,
            height: gameMain.style.height,
            zIndex: gameMain.style.zIndex
        });
        
        Object.assign(gameMain.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            zIndex: '9999'
        });
        
        gameMain.classList.add('ios-fullscreen-transition');
        
        const isGameMode = forceGameMode || gameFrameContainer.style.display !== 'none';
        
        if (isGameMode) {
            setupGameMode();
        } else {
            setupGameWrapMode();
        }
        
        if (gameInfo) {
            gameInfo.style.display = 'none';
        }
        
        document.body.style.overflow = 'hidden';
        document.body.classList.add('disable-scroll');
        
        isSimulatedFullscreen = true;
        updateFullscreenButtonIcon(true);
        
        if (env.isMobile) {
            backButton.style.display = 'flex';
        }
    }
    
    function setupGameMode() {
        if (gameFrameContainer.style.display === 'none') {
            gameWrap.style.display = 'none';
            gameFrameContainer.style.display = 'block';
        }
        
        const gameContainerStyles = {
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: '0',
            left: '0'
        };
        
        Object.assign(gameFrameContainer.style, gameContainerStyles);
        Object.assign(gameFrame.style, gameContainerStyles);
    }
    
    function setupGameWrapMode() {
        gameWrap.style.height = '100%';
        gameWrap.style.width = '100%';
        gameWrap.style.borderRadius = '0';
        
        const gameContent = gameWrap.querySelector('.game-content');
        const avatarWrap = gameWrap.querySelector('.avatar-wrap');
        
        if (gameContent) {
            gameContent.style.justifyContent = 'center';
            gameContent.style.alignItems = 'center';
            gameContent.style.textAlign = 'center';
        }
        
        if (avatarWrap) {
            const avatar = avatarWrap.querySelector('.avatar');
            if (avatar) {
                avatar.style.width = '300px';
                avatar.style.height = '300px';
            }
        }
    }
    
    function exitSimulatedFullscreen() {
        const originalStyles = JSON.parse(gameMain.dataset.originalStyles || '{}');
        
        for (const [property, value] of Object.entries(originalStyles)) {
            gameMain.style[property] = value || '';
        }
        
        gameMain.style.backgroundColor = '';
        gameMain.classList.remove('ios-fullscreen-transition');
        
        if (gameFrameContainer.style.display !== 'none') {
            resetElementStyles(gameFrameContainer);
            resetElementStyles(gameFrame);
        } 
        
        gameWrap.style.height = '';
        gameWrap.style.width = '';
        gameWrap.style.borderRadius = '';
        
        const gameContent = gameWrap.querySelector('.game-content');
        const avatarWrap = gameWrap.querySelector('.avatar-wrap');
        
        if (gameContent) {
            gameContent.style.justifyContent = '';
            gameContent.style.alignItems = '';
            gameContent.style.textAlign = '';
        }
        
        if (avatarWrap) {
            const avatar = avatarWrap.querySelector('.avatar');
            if (avatar) {
                avatar.style.width = '';
                avatar.style.height = '';
            }
        }
        
        if (gameInfo) {
            gameInfo.style.display = '';
        }
        
        document.body.style.overflow = '';
        document.body.classList.remove('disable-scroll');
        
        isSimulatedFullscreen = false;
        updateFullscreenButtonIcon(false);
        backButton.style.display = 'none';
    }
    
    function resetElementStyles(element) {
        const propertiesToReset = ['height', 'width', 'position', 'top', 'left', 'borderRadius'];
        propertiesToReset.forEach(prop => element.style[prop] = '');
    }
    
    function updateFullscreenButtonIcon(isFullscreen) {
        const icon = fullscreenBtn.querySelector('i');
        if (isFullscreen) {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
        } else {
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand');
        }
    }
    
    function handleFullscreenChange() {
        const isFullscreen = document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement;
        updateFullscreenButtonIcon(!!isFullscreen);
        
        backButton.style.display = (isFullscreen && env.isMobile) ? 'flex' : 'none';
    }
    
    function handleOrientationChange() {
        if (isSimulatedFullscreen) {
            setTimeout(function() {
                gameMain.style.width = '100%';
                gameMain.style.height = '100%';
                
                if (gameFrameContainer.style.display !== 'none') {
                    gameFrameContainer.style.height = '100%';
                    gameFrame.style.height = '100%';
                } else {
                    gameWrap.style.height = '100%';
                }
            }, 300);
        }
    }
    
    function handlePlayClick() {
        gameWrap.style.display = 'none';
        gameFrameContainer.style.display = 'block';
        gameFrame.src = iframe_url;
        
        if (env.isIOS && isSimulatedFullscreen) {
            setupGameMode();
        } else if (document.fullscreenElement || 
                  document.webkitFullscreenElement || 
                  document.mozFullScreenElement || 
                  document.msFullscreenElement) {
            handleFullscreenTransition();
        }
    }
    
    function handleFullscreenTransition() {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                gameFrame.requestFullscreen();
            }).catch(err => {
                setTimeout(() => {
                    gameFrame.requestFullscreen();
                }, 50);
            });
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
            gameFrame.webkitRequestFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
            gameFrame.mozRequestFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
            gameFrame.msRequestFullscreen();
        }
    }
});