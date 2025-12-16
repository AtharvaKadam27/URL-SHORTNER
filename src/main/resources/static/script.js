async function shortenUrl() {
    const originalUrl = document.getElementById('originalUrl').value;
    const algorithm = document.getElementById('algorithm').value;
    const shortenBtn = document.getElementById('shortenBtn');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    const shortenedUrlSpan = document.getElementById('shortenedUrl');

    if (!originalUrl) {
        alert("Please enter a URL");
        return;
    }

    // UI States
    shortenBtn.disabled = true;
    shortenBtn.style.opacity = '0.7';
    loading.classList.remove('hidden');
    resultContainer.classList.add('hidden');

    try {
        const response = await fetch(`/api/shorten?url=${encodeURIComponent(originalUrl)}&algorithm=${algorithm}`, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            const fullShortUrl = window.location.origin + '/' + data.id;

            shortenedUrlSpan.innerText = fullShortUrl;
            loading.classList.add('hidden');
            resultContainer.classList.remove('hidden');
        } else {
            alert("Failed to shorten URL. Please try again.");
            loading.classList.add('hidden');
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred.");
        loading.classList.add('hidden');
    } finally {
        shortenBtn.disabled = false;
        shortenBtn.style.opacity = '1';
    }
}

function copyToClipboard() {
    const textToCopy = document.getElementById('shortenedUrl').innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const copyBtn = document.querySelector('.copy-btn i');
        const originalClass = copyBtn.className;

        copyBtn.className = "fas fa-check";
        copyBtn.style.color = "#00ff88";

        setTimeout(() => {
            copyBtn.className = "far fa-copy";
            copyBtn.style.color = "#fff";
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}
