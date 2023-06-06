const searchButton = document.getElementById("searchButton");
const queryUsername = document.getElementById("queryUsername");
const userSummary = document.getElementById("userSummary");
const body = document.getElementById("body");
var loader = null;
var token = 'TOKEN_HERE';

//Event handlers

searchButton.addEventListener("click", createSummary);
queryUsername.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        createSummary();
    }
});

//API Functions

async function getReposByPage(username, pageNum = 1){
    const url = "https://api.github.com/users/" + username + "/repos?q=user:" + username + "&per_page=100&page=" + pageNum;
    const response = await fetch(url, {
        method: 'GET',
        headers:
        {
            'Authorization': 'token ' + token
        },
    });

    if (!response.ok){
        console.log("Error fetching repos");
        return null;
    }
    return await response.json();
}

//Will return the languages used by a single repository given a single URL to that repo's language list.
async function getLanguagesByRepo(repoLanguagesURL){
    var response = await fetch(repoLanguagesURL);
    return await response.json();
}


//Helpers

//Given a username, this will return all repositories belonging to a specified user
async function getAllRepos(username){
    var firstPage = await getReposByPage(username);

    //TODO: Include all pages for users with over 100 repos
    
    return firstPage
}

//Given a list of URLs that point the languages of repositories, this function will return an ordered list of all languages along with their respective number of occurances.
async function getLanguages(languageURLs){
    var languages = [];
    var promises = [];
    languageURLs.forEach(link => {
        promises.push(getLanguagesByRepo(link));
    });
    var results = await Promise.all(promises);
    
    for (let i = 0; i < results.length; i++){ //for each repo...
        for (let language in results[i]){ //for each language in each repo...
            if (Object.hasOwn(languages, language)){
                languages[language] += 1;
            }
            else{
                languages[language] = 1;
            }
        }
    }
    var sortedList = Object.entries(languages).sort((a,b) => b[1]-a[1])
    return sortedList;
}

//This function returns an object containing information summarizing a user's repositories.
//It will also update the screen with either a stringified json object or a prettier equivalent.
async function createSummary(){
    //clear everything first
    userSummary.textContent = "";
    if (loader){
        loader.remove();
    }
    loader = document.createElement("div");
    loader.classList.add("loader");
    searchButton.after(loader);

    const repos = await getAllRepos(queryUsername.value);
    loader.remove();
    if (!repos){
        return;
    }
    var summary = {
        username: "",
        totalRepos: 0,
        totalStargazers: 0,
        totalForks: 0,
        totalSizes: 0,
        averageSize: 0,
        languages: []
    }
    var repoLanguages = [];

    //TODO: GET THIS FROM THE SCREEN VIA CHECK BOX
    var includeForks = false;

    //fill out the summary object
    summary.username = queryUsername.value;
    summary.totalRepos = repos.length;
    repos.forEach(element => {
        if (element.fork && !includeForks){
            summary.totalRepos -= 1;
            return;
        }
        summary.totalStargazers += element.stargazers_count;
        summary.totalForks += element.forks_count;
        summary.totalSizes += element.size;
        repoLanguages.push(element.languages_url);
    });
    summary.averageSize = (summary.totalSizes/summary.totalRepos) + "KB";
    summary.totalSizes += "KB";
    summary.languages = await getLanguages(repoLanguages);

    //TODO: Only print json if the user chooses to do so. Otherwise, print beautifully.
    userSummary.textContent = JSON.stringify(summary);

    return summary;
}