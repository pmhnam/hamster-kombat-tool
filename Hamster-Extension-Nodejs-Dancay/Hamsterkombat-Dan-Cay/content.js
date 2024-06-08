var shouldRun = true;
var shouldWait = false;

(function() {
    window.changeHashPlatform = () => {
        var lochash = location.hash.toString();
        if (lochash.indexOf('tgWebAppPlatform=weba') !== -1) {
            lochash = lochash.replaceAll("tgWebAppPlatform=weba", "tgWebAppPlatform=android");
        } else if (lochash.indexOf('tgWebAppPlatform=web') !== -1) {
            lochash = lochash.replaceAll("tgWebAppPlatform=web", "tgWebAppPlatform=android");
        }
        location.hash = lochash;
        if (index == 0) {
            location.reload();
            index = 1;
        }
    };
    window.changeHashPlatform();
    addEventListener("hashchange", (event) => {
        window.changeHashPlatform();
    });
})();

var index = 0;
var lastClickTime = 0;

const checkAvailableTaps = () => {
    try {
        let element = document.querySelector('.user-tap-button.button');
        if (element) {
            chrome.storage.sync.get(['authorization'], function(result) {
                const authorization = result.authorization;
                if (authorization) {
                    console.log('Authorization:', authorization);
                    const headers = {
                        'Authorization': `Bearer ${authorization}`,
                        'Content-Type': 'application/json'
                    };

                    fetch('https://api.hamsterkombat.io/clicker/sync', {
                        method: 'POST',
                        headers: headers
                    })
                    .then(response => response.json())
                    .then(data => {
						const { balanceCoins, level, availableTaps, maxTaps } = data.clickerUser;
                        console.log(`Kiểm tra năng lượng đầy hay chưa: ${availableTaps}/${maxTaps}`);
                        if (data.clickerUser.availableTaps >= data.clickerUser.maxTaps) {
                            shouldRun = true;
                            shouldWait = false; 
                        }
                        if (data.clickerUser.availableTaps < 300) {
                            shouldRun = false;
                            shouldWait = true; 
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                } else {
                    console.log('Authorization not found.');
                }
            });
        } else {
//                console.log('Không tìm thấy .user-tap-button.button.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};


checkAvailableTaps();
const checkIntervalId = setInterval(checkAvailableTaps, 30000);

const clickWithAPI = () => {
    try {
        if (shouldRun) { 
            let element = document.querySelector('.user-tap-button.button');
            if (element) {
                chrome.storage.sync.get(['authorization'], function(result) {
                    const authorization = result.authorization;
                    if (authorization) {
                        const payload = {
                            count: 1,
                            availableTaps: 1500,
                            timestamp: Date.now() 
                        };

                        const headers = {
                            'Authorization': `Bearer ${authorization}`,
                            'Content-Type': 'application/json'
                        };

                        fetch('https://api.hamsterkombat.io/clicker/tap', {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify(payload)
                        })
                        .then(response => response.json())
                        .then(data => {
                            const { balanceCoins, level, availableTaps, maxTaps } = data.clickerUser;
                            console.log(`Đang tap liên tục: ${balanceCoins}, level: ${level}, availableTaps: ${availableTaps}, maxTaps: ${maxTaps}`);
                            lastClickTime = Date.now(); 
                            if (data.clickerUser.availableTaps < 300) {
                                shouldRun = false; 
                                shouldWait = true; 
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                    } else {
                        console.log('Authorization not found.');
                    }
                });
            } else {
//                console.log('Không tìm thấy .user-tap-button.button.');
            }
        } else {
            if (shouldWait) {
            } else {
                console.log('Dừng Lại');
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const intervalId = setInterval(clickWithAPI, 50); 
