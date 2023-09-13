// Getting references to important HTML elements
const form = document.getElementById('form'); // The search form
const search = document.getElementById('search'); // The input for user search
const card = document.getElementById('card'); // The user card container
const rateLimit = document.getElementById('remaining-requests'); // API requests remaining element
const resetTimeElement = document.getElementById('reset-time'); // Reset time element

// Event listener for the form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get the user's input
    const user = search.value;

    if (user) {
        try {
            // Send a request to the GitHub API
            const response = await fetch(`https://api.github.com/users/${user}`);
            const remainingRequests = response.headers.get('X-RateLimit-Remaining');
            const resetTime = response.headers.get('X-RateLimit-Reset');

            if (remainingRequests === '0') {
                // Handle API rate limit exceeded
                const timeUntilReset = (resetTime * 1000) - Date.now();
                displayError(`API rate limit exceeded. Please try again in ${Math.ceil(timeUntilReset / 1000)} seconds.`);
            } else if (response.status === 200) {
                // Display user data if found
                const userData = await response.json();
                updateCard(userData);
            } else if (response.status === 404) {
                // Handle user not found
                displayError('User Not Found');
            }

            // Update the API rate limit and reset time elements
            rateLimit.textContent = remainingRequests;
            resetTimeElement.textContent = new Date(resetTime * 1000).toLocaleTimeString();
        } catch (error) {
            // Handle other errors
            displayError('An error occurred');
        }

        // Show the user card
        card.classList.remove('hidden');

        // Clear the search input
        search.value = '';
    }
});

// Function to update the user card with data
function updateCard(user) {
    // Get card elements
    const cardUserInfo = card.querySelector('.user-info');
    const cardAvatar = card.querySelector('.avatar');

    // Update card with user data
    cardUserInfo.querySelector('h2').textContent = user.name;
    cardUserInfo.querySelector('p').textContent = user.bio || 'No bio available';
    cardUserInfo.querySelector('ul li:nth-child(1) span').textContent = user.followers;
    cardUserInfo.querySelector('ul li:nth-child(2) span').textContent = user.following;
    cardUserInfo.querySelector('ul li:nth-child(3) span').textContent = user.public_repos;

    cardAvatar.src = user.avatar_url;

    // Get and display user repositories
    getRepos(user.login);
}

// Function to display an error message
function displayError(message) {
    const cardUserInfo = card.querySelector('.user-info');
    cardUserInfo.innerHTML = `<h2>Error: ${message}</h2>`;
    rateLimit.textContent = ''; // Clear rate limit info in case of an error
    resetTimeElement.textContent = '';
}

// Function to fetch and display user repositories
async function getRepos(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        if (response.status === 200) {
            const reposData = await response.json();
            const reposEl = card.querySelector('#repos');
            reposEl.innerHTML = '';

            reposData.slice(0, 5).forEach(repo => {
                const repoEl = document.createElement('a');
                repoEl.classList.add('repo');
                repoEl.href = repo.html_url;
                repoEl.target = '_blank';
                repoEl.textContent = repo.name;

                reposEl.appendChild(repoEl);
            });
        }
    } catch (error) {
        console.error('Error fetching repositories:', error);
    }
}

// Initialize rate limit and reset time elements with default values
rateLimit.innerHTML = '<p> <span id="remaining-requests">N/A</span></p>';
resetTimeElement.innerHTML = '<p><span id="reset-time">N/A</span></p>';