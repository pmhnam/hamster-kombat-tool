document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('authForm');

    authForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const authInput = document.getElementById('authInput').value;

        chrome.storage.sync.set({ 'authorization': authInput }, function() {
            console.log('Authorization saved:', authInput);
            alert('Authorization saved!');
            window.close(); // Đóng popup sau khi lưu
        });
    });
});